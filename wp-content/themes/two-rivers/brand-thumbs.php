<section class="brandThumbs">
	<?php
		$args = array(
			'post_type' => 'tr_brands',
			'posts_per_page' => -1
		);
		$brandThumbQuery = new WP_Query($args);
		if($brandThumbQuery->have_posts()): ?>
			<?php while($brandThumbQuery->have_posts()): $brandThumbQuery->the_post(); ?>
			<?php 
				$brandThumb = get_field('brand_image_black');
				if(isset($brandThumb['url'])): ?>
					<a href="<?php the_permalink() ?>"><img class="brandThumbBlack" src="<?php echo $brandThumb['url'] ?>"></a>
				<?php endif ?>
			<?php endwhile ?>
		<?php endif ?>
</section>
<hr>