
# WikiSearchMapsLink
MediaWiki extension that creates a binding link between [WikiSearch](https://www.mediawiki.org/wiki/Extension:WikiSearchFront) and [Maps](https://www.mediawiki.org/wiki/Extension:Maps).

When you have both a map and a search engine, this extension allows you to synchronize both.

This extension has been developped for Triple Performance. Click on [this link](https://wiki.tripleperformance.fr/wiki/Retours_d%27exp%C3%A9rience) to see it in action!

## Requirements
- MediaWiki 1.43 or later

## Installation
1. Clone this repository to your MediaWiki `extensions` directory:
   ```bash
   cd extensions/
   git clone https://github.com/neayi/WikiSearchMapsLink.git
   ```

2. Add the following line to your `LocalSettings.php`:
   ```php
   wfLoadExtension( 'WikiSearchMapsLink' );
   ```

3. Navigate to Special:Version on your wiki to verify that the extension is successfully installed.

## Usage
In order for the extension to work, you need to configure your map and your search engine:

### Maps configuration
Assuming the map loads places [based on a semantic query](https://maps.extension.wiki/wiki/Leaflet_SMW_queries), you just need to add the `ajaxcoordproperty` setting to your map so that the WikiSearchMapsLink knows which is the property that holds the GPS coordinates (in our case a property called `Coordinates`).

    {{#ask: [[Has country::Greece]][[Coordinates::+]]
     | format=leaflet
     | ajaxcoordproperty = Coordinates
     | ?Coordinates
     | limit=1000
    }}

Then you need to add the property in the configuration of WikiSearch - note that it is a good idea to have the base query of WikiSearch match the semantic query of your map:

    {{#WikiSearchConfig:
    | base query=[[Has country::Greece]]
    ...
    | ?Coordinates
    }}

Once this setup done, you should be able to perform searchs in WikiSearch and see your map being updated dynamically.

## License
This extension is licensed under the GNU General Public License v3.0 or later. See the LICENSE file for details.
