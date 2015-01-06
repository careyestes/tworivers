<?php

function tr_scripts_styles() {
	global $wp_styles;
	// wp_enqueue_style( 'tr-template-style', get_stylesheet_uri() );
	wp_enqueue_style( 'tr-template-ie', get_template_directory_uri() . '/assets/styles/ie.css', array( 'tr-template-style' ), '20121010' );
	$wp_styles->add_data( 'tr-template-ie', 'conditional', 'lt IE 9' );
	wp_enqueue_script( 'js-plugins', get_template_directory_uri().'/assets/js/plugins.min.js', array('jquery') , '20141120', true );
	// wp_enqueue_script( 'js-main', get_template_directory_uri().'/assets/js/main.min.js', array('js-plugins') , '20141120', true );

	wp_register_script( 'js-main', get_template_directory_uri().'/assets/js/main.min.js', array('js-plugins') , '20141120', true );
	$translation_array = array( 'assets_url' => get_template_directory_uri() );
	wp_localize_script( 'js-main', 'php_object', $translation_array );
	wp_enqueue_script( 'js-main' );

}
add_action( 'wp_enqueue_scripts', 'tr_scripts_styles' );