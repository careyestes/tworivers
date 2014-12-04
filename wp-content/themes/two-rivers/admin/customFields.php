<?php 

// Load from theme add ons
// define( 'ACF_LITE', true ); //removes the admin menu
$flavorTypes = getFlavorTypes();
$catArray = array();
foreach($flavorTypes as $type) {
	$catArray[$type['slug']] = $type['title'];
}

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
	    'id' => 'acf_brand_categories',
	    'title' => 'Categories',
	    'fields' => array(
		    array(
						'key'          => 'tr_brand_categories',
						'label'        => __('Type'),
						'name'         => 'brand_categories',
						'type'         => 'radio',
						'choices'      => $catArray,
						'required'     => true
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
	        'position'       => 'side',
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
		        'key'           => 'tr_brand_image_main',
		        'label'         => __('Brand Main Thumbnail'),
		        'name'          => 'brand_image_main',
		        'type'          => 'image',
		        'instructions'  => __('Image for the top of the brand page.'),
		    ), 
				array(
	        'key' => 'tr_brand_boxes',
	        'label' => __('Boxes & Lids'),
	        'name' => '',
	        'type' => 'tab',
	      ),
	      array(
	        'key' => 'acf_brand_boxes',
	        'label' => __('Boxes'),
	        'name' => 'brand_boxes',
	        'instructions' => 'Add each box with description.',
	        'type' => 'repeater',
	        'sub_fields' => array(
	          array(
							'key'          => 'acf_brand_flavor_box_title',
							'label'        => 'Flavor Title',
							'name'         => 'brand_flavor_box_title',
							'instructions' => 'Add the Flavor Title',
							'type'         => 'text',
							'required'     => true
	          ),
	          array(
							'key'           => 'acf_brand_flavor_type',
							'label'         => 'Flavor Roast Type',
							'name'          => 'brand_flavor_box_type',
							'instructions'  => 'Add the Roast Type',
							'type'          => 'radio',
							'choices'       => array('na'=>'N/A','light'=>'Light','medium'=>'Medium','dark'=>'Dark','flavored'=>'Flavored'),
							'default_value' => 'na',
	          ),
	          array(
							'key'               => 'field_546e9b9583355',
							'label'             => 'Flavor Box Image',
							'name'              => 'flavor_box_image',
							'prefix'            => '',
							'type'              => 'image',
							'instructions'      => 'Add Flavor Box Image',
							'required'          => 0,
							'conditional_logic' => 0,
							'column_width'      => '',
							'return_format'     => 'url',
							'preview_size'      => 'thumbnail',
							'library'           => 'all',
						),
	          array(
	            'key' => 'acf_brand_flavor_desc',
	            'label' => 'Flavor Description',
	            'name' => 'brand_flavor_desc',
	            'instructions' => 'Add the flavor description.',
	            'type' => 'wysiwyg',
	          ),
	          array(
							'key'               => '54738236_acf_brand_flavor_lid_image',
							'label'             => 'Flavor Lid',
							'name'              => 'flavor_lid_image',
							'prefix'            => 'What is this?',
							'type'              => 'image',
							'instructions'      => 'Add Flavor Lid Image',
							'required'          => 0,
							'conditional_logic' => 0,
							'column_width'      => '',
							'return_format'     => 'url',
							'preview_size'      => 'thumbnail',
							'library'           => 'all',
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