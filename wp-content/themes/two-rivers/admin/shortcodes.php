<?php 

function tr_add_clear_shortcode() {
	return "<div style='display:block;clear:both;width:100%;margin: 1em 0;'></div>";
}

add_shortcode( 'clear', 'tr_add_clear_shortcode' );