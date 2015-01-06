<?php
/**
 * Template Name: Narrow Column Template
 * Description: For a single column of text
 *
 * @package WordPress
 * @subpackage utresponsive
 */

get_header(); ?>

	<div id="primary" class="site-content">
		<div id="content" role="main">

			<?php while ( have_posts() ) : the_post(); ?>
				<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<header class="entry-header">
						<?php if ( ! is_page_template( 'page-templates/front-page.php' ) ) : ?>
						<?php the_post_thumbnail(); ?>
						<?php endif; ?>
						<h1 class="entry-title narrow"><?php the_title(); ?></h1>
					</header>

					<div class="entry-content narrow">
						<?php the_content(); ?>
						<?php wp_link_pages( array( 'before' => '<div class="page-links">' . __( 'Pages:', 'twentytwelve' ), 'after' => '</div>' ) ); ?>
					</div><!-- .entry-content -->
					<footer class="entry-meta">
						<?php edit_post_link( __( 'Edit', 'twentytwelve' ), '<span class="edit-link">', '</span>' ); ?>
					</footer><!-- .entry-meta -->
				</article><!-- #post -->
			<?php endwhile; // end of the loop. ?>

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>