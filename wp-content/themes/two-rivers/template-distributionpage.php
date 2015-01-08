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
			<?php while ( have_posts() ) : the_post(); ?>
				<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<header class="entry-header">
						<?php if ( ! is_page_template( 'page-templates/front-page.php' ) ) : ?>
						<?php the_post_thumbnail(); ?>
						<?php endif; ?>
					</header>
					<?php if(null !== get_the_content() && "" !== get_the_content()): ?>
						<div class="entry-content">
							<?php the_content(); ?>
						</div>
					<?php endif ?>	
				</article>
			<?php endwhile; ?>
			<div id="map" class="mapContainer"></div>
			<div class="storeColumn">
				<h2 class="entry-title">Stores</h2>
				<div class="storeListing"><p>Click on a state to see stores that carry Two Rivers products.</p></div>
			</div>
		</div><!-- #content -->
	</div><!-- #primary -->
	<hr>

<?php get_footer(); ?>