<section class="lids">
  <h3>Coffee</h3>
  <h4>Roast Type</h4>
  <?php
    $args = array(
    	'post_type' => 'tr_brands',
    	'posts_per_page' => -1,
    	'meta_key' => 'brand_categories',
    	'meta_value' => 'Coffee',
    	'orderby' => 'meta_value', 
			'order' => 'ASC' 
    );
    $coffeeQuery = new WP_Query($args);
    if($coffeeQuery->have_posts()): ?>
	    <?php while($coffeeQuery->have_posts()): $coffeeQuery->the_post(); ?>
	    	<?php 
		    	$lids = get_field('brand_lids');
					$lightRoastsArray    = array();
					$mediumRoastsArray   = array();
					$darkRoastsArray     = array();
					$flavoredRoastsArray = array();
		    	if($lids) {
			    	foreach($lids as $lid) {
			    		if($lid['brand_flavor_type'] == 'light') {
			    			$lightRoastsArray['url'] = $lid['flavor_image'];
			    		}
			    		if($lid['brand_flavor_type'] == 'medium') {
			    			$mediumRoastsArray['url'] = $lid['flavor_image'];
			    		}
			    		if($lid['brand_flavor_type'] == 'dark') {
			    			$darkRoastsArray['url'] = $lid['flavor_image'];
			    		}
			    		if($lid['brand_flavor_type'] == 'flavored') {
			    			$flavoredRoastsArray['url'] = $lid['flavor_image'];
			    		}
			    		
			    	}
			    }
	    	?>
	    <?php endwhile ?>
	  <?php endif ?>
	<section class="lightRow">
		<?php var_dump(expression) ?>
	</section>
</section>