<?php
/**
 * Template Name: Tea Template
 * Description: Shows all tea brands
 *
 * @package WordPress
 * @subpackage utresponsive
 */

get_header(); ?>

	<div id="primary" class="site-content brandContainerWrap">
		<div id="content" class="brandContainer" role="main">

			<?php 
				$coffeeArgs = array(
					'post_type' => 'tr_brands',
					'posts_per_page' => -1,
					'meta_key' => 'brand_categories',
					'meta_value' => 'tea'
				);
				$coffeeQuery = new WP_Query($coffeeArgs);


				while ( $coffeeQuery->have_posts() ) : $coffeeQuery->the_post(); ?>
				<a href="<?php the_permalink() ?>" class="brandThumbnail">
					<?php $mainThumb = get_field('brand_image_main'); ?>
						<img class="brandImage" src="<?php echo $mainThumb['url'] ?>" alt="<?php echo $mainThumb['title'] ?>">
						<!-- <h2><?php the_title(); ?></h2> -->
				</a>
				
			<?php endwhile; // end of the loop. ?>

		</div><!-- #content -->
	</div><!-- #primary -->
	<hr>

<?php get_footer(); ?>