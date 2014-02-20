var App = {
  Controller: {},
  View: {},
  Model: {},
  Page: {}
};

App.throttle = function(handler, time) {
  var throttle;
  time = time || 300;
  return function() {
    var args = arguments,
     context = this;
    clearTimeout(throttle);
    throttle = setTimeout(function() {
      handler.apply(context, args);
    }, time);
  };
};

App.loader = function (hasToShow, copy) {
    var $el = $('.popcorn-load');

    if (hasToShow === true && !$el.hasClass('hidden') ||
        hasToShow === false && $el.hasClass('hidden')) {
        return false;
    }

    if (hasToShow === true) {
        $el.find('.text').html(copy ? copy : Language.loading);
    }

    $el[hasToShow === false ? 'addClass' : 'removeClass']('hidden');
    
    if( ! hasToShow ) { 
      $el.removeClass('withProgressBar');
    }
};

// Show by default
App.loader(true, Language.loading);

// Handler for Video opening
window.spawnCallback = function (url, subs) {
    var player =
      '<a href="javascript:;" id="video_player_close" class="btn-close"><img src="/images/close.svg" width="50" /></a>' +
      '<video autoplay id="video_player" width="100%" height="100%" class="video-js vjs-default-skin" controls>' +
        '<source src="' + url + '" type="video/mp4" />' +
        (subs ? '<track kind="subtitles" src="app://host/' + subs.file + '" default srclang="es" label="' + Languages[subs.lang] + '" />' : '') +
      '</video>';

    if (!document.createElement('video').canPlayType('video/mp4')) {
      return alert('Weird, but it seems the application is broken and you can\'t play this video.');
    }

    // Move this to a separate view.
    $('#video-container').append(player).show();

    // Init video.
    var video = videojs('video_player');

    // Enter full-screen
    $('.vjs-fullscreen-control').on('click', function () {
      win.toggleFullscreen();
    });

    // Close player
    $('#video_player_close').on('click', function () {
      $('#video-container').hide();
      video.dispose();
      $(document).trigger('videoExit');
    });

    video.player().on('pause', function () { $('#video_player_close').show(); });
    video.player().on('play', function () { $('#video_player_close').hide(); });

    App.loader(false);
};

// On Document Ready
jQuery(function ($) {
  $('.btn-os.min').on('click', function () {
    win.minimize();
  });

  $('.btn-os.close').on('click', function () {
    win.close();
  });

  $('#catalog-select ul li a').on('click', function (evt) {
    $('#catalog-select ul li.active').removeClass('active');
    $(this).parent('li').addClass('active');

    var genre = $(this).data('genre');

    if (genre == 'all') {
      App.Router.navigate('index.html', { trigger: true });
    } else {
      App.Router.navigate('filter/' + genre, { trigger: true });
    }
  });

  $('.search input').on('keypress', function (evt) {
    var term = $.trim($(this).val());

    // ENTER KEY
    if (evt.keyCode === 13) {
       if (term) {
          App.Router.navigate('search/' + term, { trigger: true });
        } else {
          App.Router.navigate('index.html', { trigger: true });
        }
        $('#catalog-select ul li.active').removeClass('active');
      }
  });
});