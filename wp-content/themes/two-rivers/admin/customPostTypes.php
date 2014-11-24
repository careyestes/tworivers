<?php

add_action('init', 'carousel_post_type');
function carousel_post_type() {
        $labels = array(
                'name' => 'Homepage Carousel',
                'singular_name' => 'Homepage Carousel Images',
                'menu_name' => 'Homepage Carousel',
                'add_new' => 'Add New Image',
                'add_new_item' => 'Add New Image',
                'edit' => 'Edit',
                'edit_item' => 'Edit Image',
                'new_item' => 'New Image',
                'view' => 'View Image',
                'view_item' => 'View Image',
                'search_items' => 'Search Images',
                'not_found' => 'No Images Found',
                'not_found_in_trash' => 'No Images Found in Trash',
                'parent' => 'Parent Image',
        );
        $args = array( 'labels' => $labels, 
                'public' => false,
                'publicly_queryable' => false,
                'exclude_from_search' => true,
                'show_ui' => true, 
                'query_var' => false,
                'rewrite' => false,
                'capability_type' => 'post',
                'hierarchical' => false,
                'menu_position' => 20,
                'supports' => array('title'),
        );

        register_post_type( 'tr_carousel', $args );
        flush_rewrite_rules();
}

add_action( 'init', 'brand_post_type');
function brand_post_type() {
        $labels = array(
                'name' => 'Brands',
                'singular_name' => 'Brand',
                'menu_name' => 'Brands',
                'add_new' => 'Add Brand',
                'add_new_item' => 'Add Brand',
                'edit' => 'Edit',
                'edit_item' => 'Edit Brand',
                'new_item' => 'New Brands',
                'view' => 'View Brands',
                'view_item' => 'View Brands',
                'search_items' => 'Search Brands',
                'not_found' => 'No Brands Found',
                'not_found_in_trash' => 'No Brands Found in Trash',
                'parent' => 'Parent Brands',  
        );
        $args = array( 'labels' => $labels, 
                'public' => true,
                'publicly_queryable' => true,
                'exclude_from_search' => false,
                'show_ui' => true, 
                'query_var' => true,
                'rewrite' => array('slug'=>'brands','with_front'=>true),
                'capability_type' => 'post',
                'hierarchical' => false,
                'menu_position' => 20,
                'supports' => array('title', 'editor'),
        );

        register_post_type( 'tr_brands', $args );
        flush_rewrite_rules();
}

add_action('init', 'brand_categories_post_type');
function brand_categories_post_type() {
        $labels = array(
                'name' => 'Brand Types',
                'singular_name' => 'Type',
                'menu_name' => 'Brand Types',
                'add_new' => 'Add Type',
                'add_new_item' => 'Add Type',
                'edit' => 'Edit',
                'edit_item' => 'Edit Type',
                'new_item' => 'New Types',
                'view' => 'View Types',
                'view_item' => 'View Types',
                'search_items' => 'Search Types',
                'not_found' => 'No Types Found',
                'not_found_in_trash' => 'No Types Found in Trash',
                'parent' => 'Parent Types',  
        );
        $args = array( 'labels' => $labels, 
                'public' => true,
                'publicly_queryable' => true,
                'exclude_from_search' => false,
                'show_ui' => true, 
                'query_var' => true,
                'rewrite' => array('slug'=>'type','with_front'=>true),
                'capability_type' => 'post',
                'hierarchical' => false,
                'menu_position' => 20,
                'supports' => array('title'),
        );

        register_post_type( 'tr_brands_types', $args );
        flush_rewrite_rules();
}
