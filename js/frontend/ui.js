// Loading Screen

App.loader = function (hasToShow, copy) {
  var $el = $('.popcorn-load');

  if (hasToShow === true && !$el.hasClass('hidden') ||
    hasToShow === false && $el.hasClass('hidden')) {
    return false;
  }

  if (hasToShow === true) {
    $el.find('.text').html(copy ? copy : i18n.__('loading'));
  }

  $el[hasToShow === false ? 'addClass' : 'removeClass']('hidden');

  if( ! hasToShow ) {
    window.initialLoading = false;

    // Wait a second before removing the progressbar class
    setTimeout(function(){
      $el.removeClass('withProgressBar').removeClass('cancellable');
      $el.find('.progress').css('width', 0.0+'%');
    }, 1000);
  }
};

// Show by default
window.initialLoading = true;
App.loader(true, i18n.__('loading'));



// Handles general UI buttons, like maximization, etc

jQuery(function ($) {

  // Maximize, minimize
  $('.btn-os.max').on('click', function () {
    if(win.isFullscreen){
      win.toggleFullscreen();
    }else{
      if (screen.availHeight <= win.height) {
        win.unmaximize();
      }
      else {
          win.maximize();
      }
    }
  });

  $('.btn-os.min').on('click', function () {
    win.minimize();
  });

  $('.btn-os.close').on('click', function () {
    win.close();
  });

  $('.btn-os.fullscreen').on('click', function () {
    win.toggleFullscreen();
    $('.btn-os.fullscreen').toggleClass('active');
  });


  // The app loading close button
  $('.popcorn-load .btn-close').click(function(event){
    event.preventDefault();
    App.loader(false);
    $(document).trigger('videoExit');
  });

  $('.popcorn-quit .quit').click(function(event){
    win.close(true);
  });

  $('.popcorn-quit .cancel').click(function(event){
    $('.popcorn-quit').addClass('hidden');
  });

  // Catalog switch
  $('#catalog-select ul li a').on('click', function (evt) {
    $('#catalog-select ul li.active').removeClass('active');
    $(this).parent('li').addClass('active');

    var genre = $(this).data('genre');

    if (genre == 'all') {
      App.Router.navigate('index.html', { trigger: true });
    } else {
      App.Router.navigate('filter/' + genre, { trigger: true });
    }
    evt.preventDefault();
  });


  // Add route callback to router
  App.Router.on('route', function () {
    // Ensure sidebar is hidden
    App.sidebar.hide();
  });


  // Search
  $('.search input').on('keypress', function (evt) {
    var term = $.trim($(this).val());

    // ENTER KEY
    if (evt.keyCode === 13) {
       if (term) {
          App.Router.navigate('search/' + encodeURIComponent(term), { trigger: true });
        } else {
          App.Router.navigate('index.html', { trigger: true });
        }
        $('#catalog-select ul li.active').removeClass('active');
      }
  });

  $('.search i').on('click', function (evt) {
    var term = $.trim($('.search input').val());

    if (term) {
      App.Router.navigate('search/' + term, { trigger: true });
    } else {
      App.Router.navigate('index.html', { trigger: true });
    }
    $('#catalog-select ul li.active').removeClass('active');
  });



  // Shortcuts
  document.addEventListener('keydown', function(event){
    var $el = $('.popcorn-quit');
    if(!$el.hasClass('hidden')) {
      // Esc
      if( event.keyCode == 27 ) { $el.addClass('hidden'); }
    }
    if (event.keyCode === 27 && $('body').is('.loading')) {
      // Escape pressed from sidebar
      App.loader(false);
      $(document).trigger('videoExit');
    }
    // Get video player
    var videoPlayer = $("#video_player");
    if (videoPlayer.length > 0) {
      videoPlayer = videoPlayer[0].player;
      if (event.keyCode == 32 && $("#video_player").is(".vjs-playing")) {
        // Space: pause
        videoPlayer.pause();
      } else if (event.keyCode == 32 && $("#video_player").is(".vjs-paused")) {
        // Space: play
        videoPlayer.play();
      }
      if (event.keyCode == 37) {
        // Left arrow: jump backward
        var currentTime = videoPlayer.currentTime();
        videoPlayer.currentTime(currentTime - 10);
      }
      if (event.keyCode == 38) {
        // Up arrow: increase volume (1.0 is all the way up)
        var currentVolume = videoPlayer.volume();
        videoPlayer.volume(currentVolume + 0.1);
      }
      if (event.keyCode == 39) {
        // Right arrow: jump forward
        var currentTime = videoPlayer.currentTime();
        videoPlayer.currentTime(currentTime + 10);
      }
      if (event.keyCode == 40) {
        // Down arrow: decrease volume (0 is off, muted)
        var currentVolume = videoPlayer.volume();
        videoPlayer.volume(currentVolume - 0.1);
      }
    }
  });


  document.addEventListener('mousewheel', function(event){
    // Get video player
    var videoPlayer = $("#video_player");
    if (videoPlayer.length === 0)
      return;
    videoPlayer = videoPlayer[0].player;
    // Get current volume
    var currentVolume = videoPlayer.volume();
    // Check wheel direction
    if (event.wheelDelta > 0) {
      // Wheel up: increase volume (1.0 is all the way up)
      videoPlayer.volume(currentVolume + 0.1);
    } else {
      // Wheel down: decrease volume (0 is off, muted)
      videoPlayer.volume(currentVolume - 0.1);
    }
  });



  // Enable tooltips
  $('body').tooltip({
    selector: "*[data-toggle^='tooltip']"
  });
});

