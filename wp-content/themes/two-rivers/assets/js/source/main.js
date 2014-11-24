(function($) {

	$('.homepageCarousel').slick({
		autoplay: true,
		autoplaySpeed: 5000,
		arrows: true,
	  adaptiveHeight: true,
	});

	// Add sticky header on scroll
  $('.carouselContainer').waypoint(function() {
    if ($(".stickyHeader").is(":hidden")) {
      $(".stickyHeader").slideDown(100);
    } else {
      $(".stickyHeader").slideUp(100);
    }
  });

  // Parallax animations
  $('.brandThumbs').waypoint(function() {
  	$('.beans').animate({
  		'left': '-35px',
  		},'fast');
  });


  $('.familyOfBrands').waypoint(function() {
  	$('.leaves').animate({
  		'right': 0,
  		},'fast');
  });

  $('.coffeeNapkin').waypoint(function() {
  	$('.cappuccino').animate({
  		'left': '40px',
  		},'fast');
  });

})(jQuery);
