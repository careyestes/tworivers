<?php

$randMoreArgs = array(
	'post_type' => 'tr_brand_locations',
	'posts_per_page' => -1,
	); 
	$locationQuery = new WP_Query($randMoreArgs); 
	if($locationQuery->have_posts()) {
		while($locationQuery->have_posts()) {
			$locationQuery->the_post();
			$selectedArray = array();
			$title = get_the_title();
			$stateName = get_field('brand_location_state_name');
			$selectedArray['title'] = $title;
			$selectedArray['statename'] = $stateName;
			echo json_encode($selectedArray);
		}
	}
?>	