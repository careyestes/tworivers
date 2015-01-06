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
				$brandThumbBlack = get_field('brand_image_black');
				$brandThumbColor = get_field('brand_image_color');
				if(isset($brandThumbBlack['url'])): ?>
					<a class="brandThumbnail" href="<?php the_permalink() ?>"><span class="brandThumbBlack" style="background-image: url(<?php echo $brandThumbBlack['url'] ?>)"></span><?php if(isset($brandThumbColor['url'])): ?><span class="brandThumbColor" style="background-image: url(<?php echo $brandThumbColor['url'] ?>)"></span><?php endif ?>
					</a>
				<?php endif ?>
			<?php endwhile ?>
		<?php endif ?>
</section>
<hr>