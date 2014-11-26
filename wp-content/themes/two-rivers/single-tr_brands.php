<?php
/**
 * The Template for displaying all single posts
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */

get_header();
$postId = get_the_ID();
$categoryType = get_field('brand_categories');
?>

	<div class="brands">

			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'brands' ); ?>

				<nav class="nav-single">
					<h3 class="browseMore">Also Check Out</h3>
					<?php $randMoreArgs = array(
						'post_type' => 'tr_brands',
						'posts_per_page' => 3,
						'meta_key' => 'brand_categories',
			    	'meta_value' => $categoryType,
			    	'orderby' => 'rand',
			    	'post__not_in' => array( $postId )
					); 
					$randQuery = new WP_Query($randMoreArgs); ?>
					<?php if($randQuery->have_posts()): ?>
						<section class="browseMoreContainer">
							<?php while($randQuery->have_posts()): $randQuery->the_post(); ?>
								<?php $browseImage = get_field('brand_image_black'); ?>
								<a href="<?php the_permalink() ?>"><img class="browseMoreImage" src="<?php echo $browseImage['url'] ?>" title="<?php echo $browseImage['title'] ?>"></a>
							<?php endwhile ?>
						</section>
					<?php endif ?>

				</nav><!-- .nav-single -->

			<?php endwhile; // end of the loop. ?>

	</div><!-- .brands -->
<?php get_footer(); ?>