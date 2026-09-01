# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this extension is

A small MediaWiki extension that binds the [WikiSearch](https://www.mediawiki.org/wiki/Extension:WikiSearchFront)
and [Maps](https://www.mediawiki.org/wiki/Extension:Maps) (Semantic Maps / Leaflet) extensions together: when a
user searches with WikiSearchFront, the first Leaflet map on the page that has `ajaxcoordproperty` configured is
updated dynamically with markers for the matching search results.

This repo is developed standalone and consumed as a git submodule/clone inside the parent Triple Performance
Docker stack (see the parent repo's CLAUDE.md, at `/home/bertrand/3perf-mw1.43/CLAUDE.md`, for how it's built into
`html/extensions/`). There is no build step, package manager, or test suite here — it's pure MediaWiki
extension PHP/JS loaded directly by MediaWiki's ResourceLoader.

## Code architecture

The entire extension is two files:

- `src/WikiSearchMapsLinkHooks.php` — a single `BeforePageDisplay` hook that unconditionally registers the
  `ext.wikiSearchMapsLink` ResourceLoader module on every page load.
- `resources/bindWikiSearchAndSemanticMaps.js` — all the actual logic. It hooks into WikiSearchFront's
  `wikisearchfrontent-pre-api-call` mw.hook, which fires just before WikiSearchFront calls its search API.

The integration is entirely event-driven and depends on globals/hooks exposed by the *other* two extensions,
not on any API surface defined in this repo:

1. **Maps extension**: exposes `window.mapsLeafletList`, an array of Leaflet map instances on the page. This
   extension finds the first one whose `.options.ajaxcoordproperty` is set — that property name tells it which
   SMW property in the search index holds GPS coordinates.
2. **WikiSearchFront extension**: fires `wikisearchfrontent-pre-api-call` with the search `params` (a `filter`
   JSON string plus `action`) right before making its own AJAX search call. This code clones those params, adds
   a filter forcing only results that have coordinates (`{"value":"+","key": coordinatesProperty}`), and fires a
   *second*, separate `mw.Api().post()` call (delayed 500ms via `setTimeout` to dodge a race condition — see
   commit `24749ca`) to fetch geo-filtered results independently of WikiSearchFront's own rendering.
3. The map is moved into the search results DOM (`map.prependTo('.wikisearch-results')`) so it appears above
   the result list, and is hidden/shown with a slide animation depending on whether there are hits.

When editing `bindWikiSearchAndSemanticMaps.js`, keep in mind the response shape it expects from the WikiSearch
API: `data.result.hits` is a JSON string of hit objects; each hit's `_source` must contain one field object with
a `geoField` key (an array whose first element is a `"lat,lon"` string) — this is populated by WikiSearchConfig's
`?Coordinates`-style field list on the wiki page, not by this extension.

## Working with this repo

- No build/lint/test tooling is defined in this repo — validate changes by loading the extension in a running
  MediaWiki instance (via the parent Docker stack) and checking `Special:Version`, then exercising a page with
  both a WikiSearch search box and a Maps/Leaflet map configured with `ajaxcoordproperty`.
- `extension.json` declares the module dependencies (`jquery.ui`, `mediawiki.api`) and hook wiring — update it
  if you add new resource files or hooks.
