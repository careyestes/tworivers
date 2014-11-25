	<?php
/*
Plugin Name: Social Media Plugin
Description: A social media plugin for the Two Rivers theme
Version: 1.0
Author: Carey Estes
Author URI: http://careyestes.com
*/

// Create custom Social Media widget
// --------------------------------------------------
class UT_SocialWidget extends WP_Widget {  
    function UT_SocialWidget() {  
            $widget_ops = array('description' => 'A widget for your social media icons');
			$this->WP_Widget('your_widget', 'Social Media Widget', $widget_ops); 
        }  
    function form($instance) {  
            $title = esc_attr($instance['title']); 
            $facebook = $instance['facebook'];
            $twitter = $instance['twitter'];
            $youtube = $instance['youtube'];
            $flickr = $instance['flickr'];
            $gplus = $instance['gplus'];
            $instagram = $instance['instagram'];
            $linkedin = $instance['linkedin'];
            $pinterest = $instance['pinterest'];
            $vimeo = $instance['vimeo'];
            
            
            
            ?>
			<p><label for="<?php echo $this->get_field_id('title'); ?>">Title:<input class="widefat" id="<?php echo $this->get_field_id('title'); ?>
			"name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('facebook'); ?>">Facebook link:<input class="widefat" id="<?php echo $this->get_field_id('facebook'); ?>
			"name="<?php echo $this->get_field_name('facebook'); ?>" type="text" value="<?php echo esc_attr($facebook); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('twitter'); ?>">Twitter link:<input class="widefat" id="<?php echo $this->get_field_id('twitter'); ?>
			"name="<?php echo $this->get_field_name('twitter'); ?>" type="text" value="<?php echo esc_attr($twitter); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('youtube'); ?>">YouTube link:<input class="widefat" id="<?php echo $this->get_field_id('youtube'); ?>
			"name="<?php echo $this->get_field_name('youtube'); ?>" type="text" value="<?php echo esc_attr($youtube); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('flickr'); ?>">Flickr link:<input class="widefat" id="<?php echo $this->get_field_id('flickr'); ?>
			"name="<?php echo $this->get_field_name('flickr'); ?>" type="text" value="<?php echo esc_attr($flickr); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('gplus'); ?>">Google+ link:<input class="widefat" id="<?php echo $this->get_field_id('gplus'); ?>
			"name="<?php echo $this->get_field_name('gplus'); ?>" type="text" value="<?php echo esc_attr($gplus); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('instagram'); ?>">Instagram link:<input class="widefat" id="<?php echo $this->get_field_id('instagram'); ?>
			"name="<?php echo $this->get_field_name('instagram'); ?>" type="text" value="<?php echo esc_attr($instagram); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('linkedin'); ?>">LinkedIn link:<input class="widefat" id="<?php echo $this->get_field_id('linkedin'); ?>
			"name="<?php echo $this->get_field_name('linkedin'); ?>" type="text" value="<?php echo esc_attr($linkedin); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('pinterest'); ?>">Pinterest link:<input class="widefat" id="<?php echo $this->get_field_id('pinterest'); ?>
			"name="<?php echo $this->get_field_name('pinterest'); ?>" type="text" value="<?php echo esc_attr($pinterest); ?>" /> </label> </p>
			<p><label for="<?php echo $this->get_field_id('vimeo'); ?>">Vimeo link:<input class="widefat" id="<?php echo $this->get_field_id('vimeo'); ?>
			"name="<?php echo $this->get_field_name('vimeo'); ?>" type="text" value="<?php echo esc_attr($vimeo); ?>" /> </label> </p>

			<?php 
        }  
    function update($new_instance, $old_instance) {  
            $instance = $old_instance;
			$instance['title'] = strip_tags($new_instance['title']);
			$instance['facebook'] = strip_tags($new_instance['facebook']);
			$instance['twitter'] = strip_tags($new_instance['twitter']);
			$instance['youtube'] = strip_tags($new_instance['youtube']);
			$instance['flickr'] = strip_tags($new_instance['flickr']);
			$instance['gplus'] = strip_tags($new_instance['gplus']);
			$instance['instagram'] = strip_tags($new_instance['instagram']);
			$instance['linkedin'] = strip_tags($new_instance['linkedin']);
			$instance['pinterest'] = strip_tags($new_instance['pinterest']);
			$instance['vimeo'] = strip_tags($new_instance['vimeo']);
			return $instance;
        }  
    function widget($args, $instance) {  
            extract($args, EXTR_SKIP);
			echo $before_widget;
			$title = apply_filters('widget_title', $instance['title']);
			if (!empty($title)) { echo $before_title . $title . $after_title; };
			//*********************************
			echo "<ul class='socialFooter'>";
			if ($instance['facebook']=='') {} else { ?><li class="socialIcon" id="ico-facebook"><a href="<?php echo $instance['facebook']; ?>" target="_blank">Facebook</a><?php }
			if ($instance['twitter']=='') {} else { ?><li class="socialIcon" id="ico-twitter"><a href="<?php echo $instance['twitter']; ?>" target="_blank">Twitter</a><?php }
			if ($instance['youtube']=='') {} else { ?><li class="socialIcon" id="ico-youtube"><a href="<?php echo $instance['youtube']; ?>" target="_blank">YouTube</a><?php }
			if ($instance['flickr']=='') {} else { ?><li class="socialIcon" id="ico-flickr"><a href="<?php echo $instance['flickr']; ?>" target="_blank">Flickr</a><?php }			
			if ($instance['gplus']=='') {} else { ?><li class="socialIcon" id="ico-gplus"><a href="<?php echo $instance['gplus']; ?>" target="_blank">Google +</a><?php }	
			if ($instance['instagram']=='') {} else { ?><li class="socialIcon" id="ico-instagram"><a href="<?php echo $instance['instagram']; ?>" target="_blank">Instagram</a><?php }
			if ($instance['linkedin']=='') {} else { ?><li class="socialIcon" id="ico-linkedin"><a href="<?php echo $instance['linkedin']; ?>" target="_blank">LinkedIn</a><?php }	
			if ($instance['pinterest']=='') {} else { ?><li class="socialIcon" id="ico-pinterest"><a href="<?php echo $instance['pinterest']; ?>" target="_blank">Pinterest</a><?php }
			if ($instance['vimeo']=='') {} else { ?><li class="socialIcon" id="ico-vimeo"><a href="<?php echo $instance['vimeo']; ?>" target="_blank">Vimeo</a><?php }			
			echo "</ul>";
			//*********************************
			echo $after_widget;
        }  
    }  
    
    add_action('widgets_init', 'register_social_widget');
    function register_social_widget() {
    	register_widget('UT_SocialWidget'); 
    } 
?>