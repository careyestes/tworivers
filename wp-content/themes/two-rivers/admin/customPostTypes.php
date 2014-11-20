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
        // Create an array for the $args
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
