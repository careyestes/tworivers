<?php
/**
 * The default template for displaying content
 *
 * Used for both single and index/archive/search.
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */

$mainThumb = get_field('brand_image_main');
$boxes = get_field('brand_boxes');

?>

	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<section class="mainLogoBlock">
			<img class="mainImageThumb" title="<?php echo $mainThumb['title'] ?>" src="<?php echo $mainThumb['url'] ?>">
		</section>
		<section class="brandBoxContainer">
			<?php foreach($boxes as $box): ?>
				<div class="brandContainerSingle">
					<img src="<?php echo $box['flavor_box_image'] ?>">
					<h2><?php echo $box['brand_flavor_box_title'] ?></h2>
					<?php echo $box['brand_flavor_desc'] ?>
				</div>
			<?php endforeach ?>
			<div style="clear: both;"> </div>
		</section>
	</article><!-- #post -->
	<hr>
