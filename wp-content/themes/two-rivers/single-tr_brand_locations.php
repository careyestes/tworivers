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
			$storesObject = array();
			$stores = get_field('brand_location_state_name_object');
			foreach($stores as $store) {
				$storesArray = array();
				if(isset($store['location_state_name_text']) && $store['location_state_name_text'] != "") {
					$storesArray['storename'] = $store['location_state_name_text'];
				}
				if(isset($store['location_state_store_url']) && $store['location_state_store_url'] != "") {
					$storesArray['storeurl'] = $store['location_state_store_url'];
				}
				if(isset($store['location_state_store_logo']) && $store['location_state_store_logo'] != "") {
					$storesArray['storeimage'] = $store['location_state_store_logo']['url'];
				}
				$storesObject[] = $storesArray;
			}
			$selectedArray['title'] = $title;
			$selectedArray['statename'] = $stateName;
			$selectedArray['stores'] = $storesObject;
			echo json_encode($selectedArray);
		}
	}
?>	