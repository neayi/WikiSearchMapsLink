<?php

namespace MediaWiki\Extension\WikiSearchMapsLink;

class WikiSearchMapsLinkHooks {
    public static function onBeforePageDisplay( $out, $skin ) {
        // Charge le module JS sur toutes les pages
        $out->addModules( 'ext.wikiSearchMapsLink' );
        return true;
    }
}