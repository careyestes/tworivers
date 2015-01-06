(function($) {

	function tabListener() {
    var urlhash = window.location.hash;
    var hash = urlhash.replace("#", ""); 
    console.log(hash);
    if(hash) {
        var selected = $("#"+hash);
        selected.addClass('selected');
        lightboxClass = selected.attr('id');
        $('.lightbox.'+lightboxClass).fadeIn('fast').addClass('active');
    }
	}

	function removeHash () { 
    history.pushState("", document.title, window.location.pathname + window.location.search);
	}

  function thumbTransition() {
    $('.brandThumbnail').hover(function() {
      var hasColor = $(this).find('.brandThumbColor');
      if(hasColor.length != 0) {
        $(this).find('.brandThumbBlack').fadeOut('fast');
        $(this).find('.brandThumbColor').fadeIn('fast');
      }
    }, function() {
      var hasColor = $(this).find('.brandThumbColor');
      if(hasColor.length != 0) {
        $(this).find('.brandThumbBlack').fadeIn('fast');
        $(this).find('.brandThumbColor').fadeOut('fast');
      }
    });
  }

  thumbTransition();
	tabListener();

  // Build map on dist page
  $('#map').usmap({
    // The click action
    click: function(event, data) {
      $.ajax({
            url: "http://tworivers.local/locations/al/",
            dataType: "json",
            success: function(data){
              var querySuccess = data.successText;
              $('.storeListing').text(data.statename);
            },
            error: function(jqXHR, textStatus, errorThrown){
              $('.storeListing').text("No stores available for that state");
            }
      });
    }
  });

	// Manually add click to singles on brand page
	$('.readmoreBrand').click(function(event) {
		$('.lightbox').fadeOut('fast').removeClass('active');
		$('.brandContainerSingle').removeClass('selected');
		window.location.hash = "#"+$(this).parent().parent().parent().attr('id');
		tabListener();
	});

	$('.lightboxCloseButton').click(function(event) {
		$(this).parent().fadeOut('fast');
		$('.brandContainerSingle').removeClass('selected');
		removeHash();
	});

	$('.homepageCarousel').slick({
		autoplay: true,
		autoplaySpeed: 5000,
		arrows: true,
    adaptiveHeight: true,
	});

	// Add sticky header on scroll
  $('.headerDivider').waypoint(function() {
    if ($(".stickyHeader").is(":hidden")) {
      $(".stickyHeader").slideDown(100);
    } else {
      $(".stickyHeader").slideUp(100);
    }
  });

  // Parallax animations
  $('.brandThumbs').waypoint(function() {
    var object = $(".beans");
    var side = 'left';
    var start = '-395px';
    var end = '0';
    slideParallax(object, side, start, end);
  });


  $('.familyOfBrands').waypoint(function() {
    var object = $(".leaves");
    var side = 'right';
    var start = '-150px';
    var end = '0';
    slideParallax(object, side, start, end);
  });

  $('.coffeeNapkin').waypoint(function() {
    var object = $(".cappuccino");
    var side = 'left';
    var start = '-300px';
    var end = '40px';
    slideParallax(object, side, start, end);
  });

  function slideParallax(object, side, start, end) {
    if(side == 'left') {
      if (object.is(":hidden")) {
        $(object).css('display', 'block');
        object.animate({
          'left' : end,
          },'fast');
      } else {
        object.animate({
          'left' : start,
          },'fast', function() {
            $(this).css('display', 'none');
          });
      }
    } else {
      if (object.is(":hidden")) {
        $(object).css('display', 'block');
        object.animate({
          'right' : end,
          },'fast');
      } else {
        object.animate({
          'right' : start,
          },'fast', function() {
            $(this).css('display', 'none');
          });
      }
    }
  }

  var isShowing = false;
  var pageHeight = $(document).height();
  if (pageHeight > 3000) {
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() === $(document).height()) {
            $('.site-footer').animate({ 'marginBottom': 0 }, 'fast');
            // $('#page').animate({ 'top': '-500px' }, 'fast');
            isShowing = true;
      }

      else if (isShowing === true && $(window).scrollTop() + $(window).height() <= $(document).height() ) {
        $('.site-footer').animate({ 'marginBottom': '-497px' }, 'fast');
        // $('#page').animate({ 'top': '0' }, 'fast');
        isShowing = false;
      }
    });
  } else {
     $('.site-footer').css({ 'marginBottom': 0, 'position' : 'relative' });
  }

})(jQuery);
