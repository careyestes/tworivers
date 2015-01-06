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
		<!-- <hr> -->
		<section class="brandDescription">
			<?php the_content(); ?>
		</section>
		<section class="brandBoxContainer">
			<?php if($boxes): ?>
				<?php foreach($boxes as $box): ?>
					<?php 
						$strength = $box['brand_flavor_box_type']; 
						$url = strtolower($box['brand_flavor_box_title']);
						$url = str_replace("'", "", $url);
						$url = str_replace(' ', '-', $url);
						$url = urlencode($url);
					?>
					<div id="<?php echo $url ?>" class="brandContainerSingle">
						<img src="<?php echo $box['flavor_box_image'] ?>">
						<h2><?php echo $box['brand_flavor_box_title'] ?></h2>
						<h3><?php echo $box['brand_flavor_box_style'] ?></h3>
						<div class="brandDescriptionContainer">
							<p><?php echo $box['brand_flavor_excerpt'] ?></p>
							<p><button class="readmoreBrand">More Product Info »</button></p>
						</div>
					</div>
					<article class="lightbox <?php echo $url; ?>">
							<button class="lightboxCloseButton" type="button">&times;</button>
							<img class="lightboxImage" src="<?php echo $box['flavor_lid_image'] ?>">
							<div class="lightboxHeader"><?php echo $box['brand_flavor_box_title'] ?></div>
							<?php 
									$strengthNumber = getFlavorStrength($strength); 
									if($strengthNumber != "n/a"): ?>
									<p class="strengthMeter">Strength: <?php $i = 1; $s = 1;
										while($i <= 5) {
											echo "<span class='strengthMeterBlock' ";
												if($s <= $strengthNumber) {
													echo "style='background-position: 0 -20px; ' ";
												}
											echo "></span> ";
											$i++;
											$s++;
										}
									?></p>
							<?php endif ?>
							<?php echo $box['brand_flavor_desc'] ?>
					</article>
				<?php endforeach ?>
			<?php endif; ?>
			<div style="clear: both;"> </div>
		</section>
	</article><!-- #post -->
	<hr>
