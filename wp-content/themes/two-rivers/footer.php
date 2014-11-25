<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */
?>

</div><!-- #page -->
<hr class="finalDivider">
<footer class="site-footer" id="colophon" role="contentinfo">
	<div class="siteMapContainer">
		<div class="siteMapContainerInner">
			<h2>Site Map</h2>
			<?php if ( is_active_sidebar( 'footer-sidebar' ) ) : ?>
				<div class="widget-area" role="complementary">
					<?php dynamic_sidebar( 'footer-sidebar' ); ?>
				</div><!-- #first .widget-area -->
			<?php endif; ?>
			<div style="clear:both;"></div>
		</div>
	</div>
</footer>
<hr>

<?php wp_footer(); ?>
</body>
</html>