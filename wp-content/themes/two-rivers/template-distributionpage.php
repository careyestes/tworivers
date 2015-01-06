<?php
/**
 * Template Name: Distribution Template
 * Description: Shows the distribution map
 *
 * @package WordPress
 * @subpackage utresponsive
 */

get_header(); ?>

	<div id="primary" class="site-content brandContainerWrap">
		<div id="content" class="brandContainer" role="main">

			<?php 
				// $coffeeArgs = array(
				// 	'post_type' => 'tr_brands',
				// 	'posts_per_page' => -1,
				// 	'meta_key' => 'brand_categories',
				// 	'meta_value' => 'coffee'
				// );
				// $coffeeQuery = new WP_Query($coffeeArgs);


				// while ( $coffeeQuery->have_posts() ) : $coffeeQuery->the_post(); ?>
				
				
			<?php //endwhile; // end of the loop. ?>
			<div id="map" class="mapContainer"></div>
			<div class="storeColumn">
				<h2 class="entry-title">Stores</h2>
				<div class="storeListing"></div>
			</div>

		</div><!-- #content -->
	</div><!-- #primary -->
	<hr>

<?php get_footer(); ?>