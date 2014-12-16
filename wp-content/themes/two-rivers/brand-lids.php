<?php 
	$flavorTypes         = getFlavorTypes();
	$lightRoastsArray    = array();
	$mediumRoastsArray   = array();
	$darkRoastsArray     = array();
	$flavoredRoastsArray = array();
	$seasonalRoastsArray = array();
	$blackTeaArray       = array();
	$greenTeaArray       = array();
	$herbalTeaArray      = array();
	$exoticTeaArray      = array();
	$otherTypeArray      = array();
?>
<section class="lids">
	<?php if($flavorTypes): ?>
		<?php foreach($flavorTypes as $type): ?>
			  <h3><?php echo $type['title']; ?></h3>
			  <?php if($type['title'] != "Hot Chocolate"): ?>
				  <h4>Roast Type</h4>
				<?php endif ?>
			  <?php
			    $args = array(
			    	'post_type' => 'tr_brands',
			    	'posts_per_page' => -1,
			    	'meta_key' => 'brand_categories',
			    	'meta_value' => $type['slug'],
			    	'orderby' => 'meta_value', 
						'order' => 'ASC' 
			    );
			    $query = new WP_Query($args);
			    if($query->have_posts()): ?>
				    <?php while($query->have_posts()): $query->the_post(); ?>
				    	<?php 
					    	$lids = get_field('brand_boxes');
					    	// var_dump($lids);
					    	if($lids) {
						    	foreach($lids as $lid) {
						    		if($type['slug'] == "coffee" && $lid['brand_flavor_box_type']) {
								    		if($lid['brand_flavor_box_type'] == 'light') {
								    			$lightRoastsArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'medium') {
								    			$mediumRoastsArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'dark') {
								    			$darkRoastsArray[] = array( 
								    				'url' => $lid['flavor_lid_image'],
								    				'title' => $lid['brand_flavor_box_title'], 
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'flavored') {
								    			$flavoredRoastsArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'seasonal') {
								    			$seasonalRoastsArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		}
						    		} elseif($type['slug'] == "tea" && $lid['brand_flavor_box_type']) {
						    			if($lid['brand_flavor_box_type'] == 'black') {
								    			$blackTeaArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'green') {
								    			$greenTeaArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'herbal') {
								    			$herbalTeaArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} elseif($lid['brand_flavor_box_type'] == 'exotic') {
								    			$exoticTeaArray[] = array( 
								    				'url' => $lid['flavor_lid_image'], 
								    				'title' => $lid['brand_flavor_box_title'],
								    				'excerpt' => $lid['brand_flavor_excerpt'],
								    				'slug' => get_the_permalink()
								    			);
								    		} 
							    	}else {
						    			$otherTypeArray[] = array( 
						    				'url' => $lid['flavor_lid_image'],
						    				'title' => $lid['brand_flavor_box_title'], 
						    				'excerpt' => $lid['brand_flavor_excerpt'],
						    				'slug' => get_the_permalink()
						    			);
						    		}
						    	}
						    }
				    	?>
				    <?php endwhile ?>
				  <?php endif ?>
				  <?php wp_reset_postdata(); ?>

				<?php if($lightRoastsArray && count($lightRoastsArray) > 0): ?>
						<?php shuffle($lightRoastsArray) ?>
						<section class="roastRow lightRow">
							<h5>Light Roasts</h5>
							<?php $l = 1; foreach($lightRoastsArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
					<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $lightRoastsArray = false; ?>


				<?php if($mediumRoastsArray && count($mediumRoastsArray) > 0): ?>
					<?php shuffle($mediumRoastsArray) ?>
						<section class="roastRow mediumRow">
							<h5>Medium Roasts</h5>
							<?php $l = 1; foreach($mediumRoastsArray as $lid): ?>
								<?php if($l <= 5): ?>
								<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
									<img class="lidImage" src="<?php echo $lid['url'] ?>">
									<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
									<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
								</a>
								<?php endif; $l++ ?>
							<?php endforeach ?>
						</section>
					<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $mediumRoastsArray = false; ?>


				<?php if($darkRoastsArray && count($darkRoastsArray) > 0): ?>
					<?php shuffle($darkRoastsArray) ?>
						<section class="roastRow darkRow">
							<h5>Dark Roasts</h5>
							<?php $l = 1; foreach($darkRoastsArray as $lid): ?>
							<?php if($l <= 5): ?>
								<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
									<img class="lidImage" src="<?php echo $lid['url'] ?>">
									<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
									<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
								</a>
							<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $darkRoastsArray = false; ?>
				

				<?php if($flavoredRoastsArray && count($flavoredRoastsArray) > 0): ?>
					<?php shuffle($flavoredRoastsArray) ?>
						<section class="roastRow flavoredRow">
							<h5>Flavored Coffees</h5>
							<?php $l = 1; foreach($flavoredRoastsArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $flavoredRoastsArray = false; ?>

				<?php if($seasonalRoastsArray && count($seasonalRoastsArray) > 0): ?>
					<?php shuffle($seasonalRoastsArray) ?>
						<section class="roastRow flavoredRow">
							<h5>Seasonal Coffees</h5>
							<?php $l = 1; foreach($seasonalRoastsArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $seasonalRoastsArray = false; ?>

				<?php if($blackTeaArray && count($blackTeaArray) > 0): ?>
					<?php shuffle($blackTeaArray) ?>
						<section class="roastRow flavoredRow">
							<h5>Black Tea</h5>
							<?php $l = 1; foreach($blackTeaArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $blackTeaArray = false; ?>

				<?php if($greenTeaArray && count($greenTeaArray) > 0): ?>
					<?php shuffle($greenTeaArray) ?>
						<section class="roastRow flavoredRow">
							<h5>Green Tea</h5>
							<?php $l = 1; foreach($greenTeaArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $greenTeaArray = false; ?>

				<?php if($herbalTeaArray && count($herbalTeaArray) > 0): ?>
					<?php shuffle($herbalTeaArray) ?>
						<section class="roastRow flavoredRow">
							<h5>Herbal Tea</h5>
							<?php $l = 1; foreach($herbalTeaArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $herbalTeaArray = false; ?>

				<?php if($exoticTeaArray && count($exoticTeaArray) > 0): ?>
					<?php shuffle($exoticTeaArray) ?>
						<section class="roastRow flavoredRow">
							<h5>Exotic Tea</h5>
							<?php $l = 1; foreach($exoticTeaArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif; $exoticTeaArray = false; ?>


				<?php if($otherTypeArray && count($otherTypeArray) > 0): ?>
					<?php shuffle($otherTypeArray) ?>
						<section class="roastRow <?php echo $type ?>Row">
						<h5></h5>
							<?php $l = 1; foreach($otherTypeArray as $lid): ?>
								<?php if($l <= 5): ?>
									<a href="<?php echo $lid['slug'].'#'.strtolower(str_replace('+', '-', urlencode($lid['title']))) ?>" class="lidBlock">
										<img class="lidImage" src="<?php echo $lid['url'] ?>">
										<h6 class="lidTitle"><?php echo $lid['title'] ?></h6>
										<!-- <p class="lidCopy"><?php //echo $lid['excerpt']; ?></p> -->
									</a>
								<?php endif; $l++; ?>
							<?php endforeach; $otherTypeArray = false; ?>
						</section>
						<!-- <button class="readMore" type="button"><a class="readMoreText" href="#">Read More »</a></button> -->
				<?php endif ?>


		<?php endforeach ?>
	<?php endif ?>
</section>