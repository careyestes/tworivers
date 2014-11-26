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

  var isShowing = false;
  var pageHeight = $(document).height();
  if (pageHeight > 3000) {
    console.log(pageHeight);
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() === $(document).height()) {
            $('.site-footer').animate({ 'marginBottom': 0 }, 'fast');
            $('#page').animate({ 'top': '-500px' }, 'fast');
            isShowing = true;
      }

      else if (isShowing === true && $(window).scrollTop() + $(window).height() <= $(document).height() ) {
        $('.site-footer').animate({ 'marginBottom': '-497px' }, 'fast');
        $('#page').animate({ 'top': '0' }, 'fast')
        isShowing = false;
      }
    });
  } else {
     $('.site-footer').css({ 'marginBottom': 0, 'position' : 'relative' });
  }

})(jQuery);
