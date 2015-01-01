<?php
/**
 * The Header template for our theme
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage Twenty_Twelve
 * @since Twenty Twelve 1.0
 */
?><!DOCTYPE html>
<!--[if IE 7]>
<html class="ie ie7" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html class="ie ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title><?php wp_title( '|', true, 'right' ); ?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<?php // Loads HTML5 JavaScript file to add support for HTML5 elements in older IE versions. ?>
<!--[if lt IE 9]>
<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
<![endif]-->
<?php wp_head(); ?>
<?php if(!is_front_page()): ?>
	<style>
		html, body {
			height: 100%;
		}
	</style>
<?php endif ?>

</head>

<body <?php body_class(); ?>>
<div class="stickyHeader">
  <div class="stickyHeaderContainer">
  	<a class="mastheadLogo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<div class="site-title"><?php bloginfo( 'name' ); ?></div>
			<div class="site-description"><?php bloginfo( 'description' ); ?></div>
		</a>
		<nav id="site-navigation" class="main-navigation" role="navigation">
			<h3 class="menu-toggle"><?php _e( 'Menu', 'twentytwelve' ); ?></h3>
			<?php wp_nav_menu( array( 'theme_location' => 'primary', 'menu' => 'Main Menu', 'menu_class' => 'nav-menu', 'fallback_cb' => false ) ); ?>
		</nav>
  </div>
</div>
<div id="page" class="hfeed site">
	<header id="masthead" class="site-header" role="banner">
		<a class="mastheadLogo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<div class="site-title"><?php bloginfo( 'name' ); ?></div>
			<div class="site-description"><?php bloginfo( 'description' ); ?></div>
		</a>

		<nav id="site-navigation" class="main-navigation" role="navigation">
			<h3 class="menu-toggle"><?php _e( 'Menu', 'twentytwelve' ); ?></h3>
			<?php wp_nav_menu( array( 'theme_location' => 'primary', 'menu' => 'Main Menu', 'menu_class' => 'nav-menu', 'fallback_cb' => false ) ); ?>
		</nav><!-- #site-navigation -->
	</header><!-- #masthead -->
	<hr class="headerDivider">