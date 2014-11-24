<?php 
	$lightRoastsArray    = array();
	$mediumRoastsArray   = array();
	$darkRoastsArray     = array();
	$flavoredRoastsArray = array();
?>
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
		    	if($lids) {
			    	foreach($lids as $lid) {
			    		if($lid['brand_flavor_type'] == 'light') {
			    			$lightRoastsArray[] = array( 
			    				'url' => $lid['flavor_image'], 
			    				'excerpt' => $lid['brand_flavor_excerpt']
			    			);
			    		}
			    		if($lid['brand_flavor_type'] == 'medium') {
			    			$mediumRoastsArray[] = array( 
			    				'url' => $lid['flavor_image'], 
			    				'excerpt' => $lid['brand_flavor_excerpt']
			    			);
			    		}
			    		if($lid['brand_flavor_type'] == 'dark') {
			    			$darkRoastsArray[] = array( 
			    				'url' => $lid['flavor_image'], 
			    				'excerpt' => $lid['brand_flavor_excerpt']
			    			);
			    		}
			    		if($lid['brand_flavor_type'] == 'flavored') {
			    			$flavoredRoastsArray[] = array( 
			    				'url' => $lid['flavor_image'], 
			    				'excerpt' => $lid['brand_flavor_excerpt']
			    			);
			    		}
			    		
			    	}
			    }
	    	?>
	    <?php endwhile ?>
	  <?php endif ?>
	<section class="roastRow lightRow">
		<?php $l = 1; foreach($lightRoastsArray as $lid): ?>
			<?php if($l <= 6): ?>
				<div class="lidBlock">
					<img class="lidImage" src="<?php echo $lid['url'] ?>">
					<p class="lidCopy"><?php echo $lid['excerpt']; ?></p>
				</div>
			<?php endif; ?>
			<?php $l++; ?>
		<?php endforeach ?>
	</section>
	<button class="readMore" type="button"><a class="readMoreText" href="#">Read More</a></button>
	<section class="roastRow mediumRow">
		<?php foreach($mediumRoastsArray as $lid): ?>
			<div class="lidBlock">
				<img class="lidImage" src="<?php echo $lid['url'] ?>">
				<p class="lidCopy"><?php echo $lid['excerpt']; ?></p>
			</div>
		<?php endforeach ?>
	</section>
	<section class="roastRow darkRow">
		<?php foreach($darkRoastsArray as $lid): ?>
			<div class="lidBlock">
				<img class="lidImage" src="<?php echo $lid['url'] ?>">
				<p class="lidCopy"><?php echo $lid['excerpt']; ?></p>
			</div>
		<?php endforeach ?>
	</section>
	<section class="roastRow flavoredRow">
		<?php foreach($flavoredRoastsArray as $lid): ?>
			<div class="lidBlock">
				<img class="lidImage" src="<?php echo $lid['url'] ?>">
				<p class="lidCopy"><?php echo $lid['excerpt']; ?></p>
			</div>
		<?php endforeach ?>
	</section>
</section>