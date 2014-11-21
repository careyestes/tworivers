<?php 

// Load from theme add ons
// define( 'ACF_LITE', true ); //removes the admin menu

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
	register_field_group(array(
	    'id' => 'acf_brand_info',
	    'title' => 'Brand Info',
	    'fields' => array(
	    	array(
	        'key' => 'tr_brand_info',
	        'label' => __('Brand Info'),
	        'name' => '',
	        'type' => 'tab',
	      ),
		    array(
		        'key'           => 'tr_brand_image_black',
		        'label'         => __('Homepage Thumbnail'),
		        'name'          => 'brand_image_black',
		        'type'          => 'image',
		        'instructions'  => __('Image for the homepage group under the slider'),
		    ),
		    array(
	        'key' => 'tr_brand_lids',
	        'label' => __('Lids'),
	        'name' => '',
	        'type' => 'tab',
	      ),
		    array(
	        'key' => 'acf_brand_lids',
	        'label' => __('Lids'),
	        'name' => 'brand_lids',
	        'instructions' => 'Add each Lid with description',
	        'type' => 'repeater',
	        'sub_fields' => array(
	          array(
	            'key' => 'acf_brand_flavor_title',
	            'label' => 'Flavor Title',
	            'name' => 'brand_flavor_title',
	            'instructions' => 'Add the Flavor Title',
	            'type' => 'text',
	          ),
	          array(
	            'key' => 'acf_brand_flavor_type',
	            'label' => 'Flavor Roast Type',
	            'name' => 'brand_flavor_type',
	            'instructions' => 'Add the Roast Type',
	            'type' => 'radio',
	            'choices' => array('Light', 'Medium', 'Dark', 'Flavored'),
	          ),
	          array(
							'key' => 'field_546e9b9583355',
							'label' => 'flavor_image',
							'name' => 'Flavor Image',
							'prefix' => '',
							'type' => 'image',
							'instructions' => 'Add Flavor Lid Image',
							'required' => 0,
							'conditional_logic' => 0,
							'column_width' => '',
							'return_format' => 'url',
							'preview_size' => 'thumbnail',
							'library' => 'all',
						),
	          array(
	            'key' => 'acf_brand_flavor_desc',
	            'label' => 'Flavor Description',
	            'name' => 'brand_flavor_desc',
	            'instructions' => 'Add the Flavor Description',
	            'type' => 'textarea',
	          ),
	          array(
	            'key' => 'acf_brand_flavor_excerpt',
	            'label' => 'Flavor Excerpt',
	            'name' => 'brand_flavor_excerpt',
	            'instructions' => 'Add the Flavor Excerpt. This is a shortened version of the description. 12 words or less.',
	            'type' => 'textarea',
	          ),
	        ),
	        'row_min'      => '',
	        'row_limit'    => '',
	        'layout'       => 'row',
	        'button_label' => 'Add Flavor',
        ),
		  ),
		  'location' => array(
			  array(
	        array(
	          'param'    => 'post_type',
	          'operator' => '==',
	          'value'    => 'tr_brands',
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