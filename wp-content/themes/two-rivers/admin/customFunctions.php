<?php 

function getFlavorTypes() {
	$flavorTypes = array();
	$args = array(
    	'post_type' => 'tr_brands_types',
    	'posts_per_page' => -1,
			'order' => 'ASC' 
    );
    $query = new WP_Query($args);
    if($query->have_posts()) {
	    while($query->have_posts()) { 
	    	$query->the_post();
				$title = get_the_title();
				$slug  = sanitize_title(get_the_title());
	    	$flavorTypes[] = array('title' => $title, 'slug' => $slug);
	    }
    }
    return $flavorTypes;
}

function getFlavorStrength($type) {
	switch($type) {
		case "light":
			return 1;
		case "medium":
			return 3;
		case "dark":
			return 5;
		default: 
			return "n/a";
	}
}