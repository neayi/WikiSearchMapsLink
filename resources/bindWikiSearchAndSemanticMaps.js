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

		// We listen to the pre-api-call hook of WikiSearchFront
		mw.hook('wikisearchfrontent-pre-api-call').add(function(params) {
			if (params.action === 'query') {

				// Ignore this event if there are no maps on the page
				if (window.mapsLeafletList === undefined || window.mapsLeafletList.length === 0) {
					return;
				}

				// We clone the params to not modify the original object (which is going to be user by WikiSearchFront later)
				let geoParams = { ...params };

				// Get the first map on the page that has the ajaxcoordproperty set
				let map = window.mapsLeafletList.find(map => map.options.ajaxcoordproperty !== undefined && map.options.ajaxcoordproperty.length > 0);
				if (!map) {
					console.log('No map with ajaxcoordproperty found');
					return;
				}

				// We grab the property which contains the coordinates
				let coordinatesProperty = map.options.ajaxcoordproperty;

				let filters = JSON.parse(params.filter);

				// We only want results which have coordinates
				filters.push({"value":"+","key": coordinatesProperty});

				geoParams.filter = JSON.stringify(filters);

				// We limit the number of results to what is configured in the map
				geoParams.limit = map.options.limit ?? 500;

				// Use the WikiSearch API to get the results
				let api = new mw.Api();
				api.post(geoParams).done(function(data) {
					let hits = JSON.parse(data.result.hits);

					map.removeMarkers();

					hits.forEach(hit => {

						// Get the first member of the source object that has a geoField key
						let geoField = Object.values(hit._source).find(t => Object.keys(t).includes('geoField'));

						if (!geoField) {
							throw new Error("Please make sure that WikiSearchConfig has the GEO property in the list of fields to fetch");
						}

						let coordinates = geoField.geoField[0].split(',');

						let title = hit._source.subject.title;
						let url = mw.util.getUrl(title);

						let markerOptions = {
							lat: coordinates[0],
							lon: coordinates[1],
							title: title,
							text: '<b><a href="' + url + '">' + title + '</a></b>',
							icon: ""
						};

						map.addMarker( markerOptions );
					});
				});
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

