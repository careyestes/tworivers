<?php 

function getFlavoredTypes() {
	$flavorTypes = array();
	$args = array(
    	'post_type' => 'tr_brands',
    	'posts_per_page' => -1,
    	'meta_key' => 'brand_categories',
    	'orderby' => 'meta_value', 
			'order' => 'ASC' 
    );
    $query = new WP_Query($args);
    if($query->have_posts()) {
	    while($query->have_posts()) { 
	    	$query->the_post();
	    }
    }

}