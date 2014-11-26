<section class="carouselContainer">
	<div class="backgroundLogo"></div>
		<?php
		  $args = array(
				'post_type'      => 'tr_carousel',
				'posts_per_page' => -1,
				'orderby'        => 'menu_order',
				'order'          => 'ASC'
		  );
		  $carouselQuery = new WP_Query($args);
		  if($carouselQuery->have_posts()): ?>
			  <div class="homepageCarousel">
		  	<?php while($carouselQuery->have_posts()): $carouselQuery->the_post(); ?>
		  		<?php $img = get_field('carousel_image'); ?>
		  		<div><img src="<?php echo $img['url'] ?>"></div>
			  <?php endwhile ?>
			  </div>
			<?php endif;
		?>  
</section>
<hr>