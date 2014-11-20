<?php 

// Load from theme add ons
define( 'ACF_LITE', true ); //removes the admin menu

if(function_exists("register_field_group")) {
	register_field_group(array(
	    'id' => 'acf_carousel_images',
	    'title' => 'Carousel Images',
	    'fields' => array(
		    array(
		        'key'           => 'tr_carousel_image',
		        'label'         => __('Image'),
		        'name'          => 'carousel_image',
		        'type'          => 'image',
		        'instructions'  => __('Add images to the carousel.'),
		    ),
		    array(
		        'key'           => 'tr_carousel_image_credit',
		        'label'         => __('Image Credit'),
		        'name'          => 'carousel_image_credit',
		        'type'          => 'text',
		        'instructions'  => __('Add images title.'),
		    ),
		  ),
		  'location' => array(
			  array(
	        array(
	          'param'    => 'post_type',
	          'operator' => '==',
	          'value'    => 'tr_carousel',
	          'order_no' => 0,
	          'group_no' => 0,
	        ),
	      ),
	    ),
	      'options'        => array(
	        'position'       => 'normal',
	        'layout'         => 'default',
	        'hide_on_screen' => array(
	        ),
	      ),
	    'menu_order' => 0,
	));
}