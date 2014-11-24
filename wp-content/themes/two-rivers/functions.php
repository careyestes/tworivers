<?php

require('admin/twentytwelveDefaults.php');
require('admin/stylesAndScripts.php');
require('admin/customPostTypes.php');
require('admin/customFields.php');
require('admin/customFunctions.php');

add_action( 'widgets_init', 'tr_add_custom_widgets_init' );

function tr_add_custom_widgets_init() {
	register_sidebar( array(
			'name'          => __( 'Footer Widgets', 'two-rivers' ),
			'id'            => 'footer-sidebar',
			'description'   => __( 'Add a max of 3 widgets for the drawer in the footer', 'two-rivers' ),
			'before_widget' => '<div class="widgetColumn">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4>',
			'after_title'   => '</h4>',
	));
}
