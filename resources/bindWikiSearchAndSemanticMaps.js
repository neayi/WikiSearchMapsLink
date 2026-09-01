/**
 * WikiSearchMapsLink - Creates a binding link between WikiSearch and Semantic Maps
 * This code adds a hook to WikiSearchFront to filter results based on the coordinates
 * and then update the first map on the page that has the ajaxcoordproperty set.
 *
 * @author neayi
 * @license GPL-3.0-or-later
 */

( function () {
	'use strict';

	/**
	 * Initialize WikiSearchMapsLink functionality
	 */
	function init() {
		// Extension initialization code goes here
		console.log( 'WikiSearchMapsLink extension loaded' );

		let map = undefined;
		let coordinatesProperty = undefined;
		let originalPopups = undefined;

		// Match key between a search hit and an original marker: the page title.
		// Maps sets marker.options.title to Title::getFullText() and WikiSearch's
		// subject.title is the DB key with underscores turned into spaces, so both
		// sides are the space-separated page name (no namespace prefix for NS_MAIN).
		function titleKey(title) {
			return typeof title === 'string' ? title.replace(/_/g, ' ').trim() : '';
		}

		// We listen to the pre-api-call hook of WikiSearchFront
		mw.hook('wikisearchfrontent-pre-api-call').add(function(params) {
			// Ignore this event if there are no maps on the page
			if (window.mapsLeafletList === undefined || window.mapsLeafletList.length === 0) {
				return;
			}

			if (map === undefined) {
				// Get the first map on the page that has the ajaxcoordproperty set
				map = window.mapsLeafletList.find(map => map.options.ajaxcoordproperty !== undefined && map.options.ajaxcoordproperty.length > 0);
				if (!map) {
					console.log('No map with ajaxcoordproperty found');
					return;
				}

				// We grab the property which contains the coordinates
				coordinatesProperty = map.options.ajaxcoordproperty;
						
				// Move the map to the top of the results
				map.prependTo( '.wikisearch-results' );

				// add a margin to the bottom of the map to separate it from the results
				map.css( "margin-bottom", "26px" );

				// Capture the template-rendered popups Maps produced on page load, keyed by
				// page title, so we can reuse them on the markers we recreate below (the
				// search results are always a subset of the map's initial query). Keying by
				// title rather than coordinates keeps distinct pages at the same location apart.
				originalPopups = new Map();
				let markerLayer = map.mapContent && map.mapContent.markerLayer;
				if (markerLayer) {
					markerLayer.eachLayer(function (m) {
						if (typeof m.getPopup !== 'function' || !m.options) {
							return;
						}
						let key = titleKey(m.options.title);
						if (key === '') {
							return;
						}
						let popup = m.getPopup();
						if (!popup) {
							return;
						}
						let content = popup.getContent();
						if (typeof content !== 'string' || content.length === 0) {
							return;
						}
						originalPopups.set(key, content);
					});
				}
			}

			if (params.action === 'query') {

				// We clone the params to not modify the original object (which is going to be user by WikiSearchFront later)
				let geoParams = { ...params };

				let filters = JSON.parse(params.filter);

				// We only want results which have coordinates
				filters.push({"value":"+","key": coordinatesProperty});

				geoParams.filter = JSON.stringify(filters);

				// We limit the number of results to what is configured in the map
				geoParams.limit = map.options.limit ?? 500;

				// Use the WikiSearch API to get the results (delayed by 500ms)
				setTimeout(() => {
					let api = new mw.Api();
					api.post(geoParams).done(function(data) {
						let hits = JSON.parse(data.result.hits);
						
						map.removeMarkers();

						// if no hits, we hide the map with a vertical animation
						if (hits.length === 0) {
							$(map).slideUp();
						} else {
							$(map).slideDown();
						}

						hits.forEach(hit => {

							// Get the first member of the source object that has a geoField key
							let geoField = Object.values(hit._source).find(t => Object.keys(t).includes('geoField'));

							if (!geoField) {
								throw new Error("Please make sure that WikiSearchConfig has the GEO property in the list of fields to fetch");
							}

							let coordinates = geoField.geoField[0].split(',');

							let title = hit._source.subject.title;
							let url = mw.util.getUrl(title);

							// Reuse the template-rendered popup captured on page load; fall back
							// to a plain title link for hits absent from the initial map render.
							let text = (originalPopups && originalPopups.get(titleKey(title)))
								|| '<b><a href="' + url + '">' + title + '</a></b>';

							let markerOptions = {
								lat: coordinates[0],
								lon: coordinates[1],
								title: title,
								text: text,
								icon: ""
							};

							map.addMarker( markerOptions );
						});
					});
				}, 500);
			}
		});
	}

	// Run initialization when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

}() );

