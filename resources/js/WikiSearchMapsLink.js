/**
 * WikiSearchMapsLink - Creates a binding link between WikiSearch and Semantic Maps
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
	}

	// Run initialization when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

}() );
