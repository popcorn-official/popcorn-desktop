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
      // Wait a second before removing the progressbar clas
      setTimeout(function(){
        $el.removeClass('withProgressBar').removeClass('cancellable');
        $el.find('.progress').css('width', 0.0+'%');
      }, 1000);
    }
};
// Show by default
// App.loader(true, Language.loading);

// Handler for Video opening
window.spawnCallback = function (url, subs) {
    var subtracks = '';
    for( lang in subs ) {
      subtracks += '<track kind="subtitles" src="app://host/' + subs[lang] + '" srclang="es" label="' + Languages[lang] + '" charset="utf-8" />';
    }

    var player =
      '<video autoplay id="video_player" width="100%" height="100%" class="video-js vjs-default-skin" controls preload>' +
        '<source src="' + url + '" type="video/mp4" />' +
        subtracks +
      '</video>' +
      '<a href="javascript:;" id="video_player_close" class="btn-close"><img src="/images/close.svg" width="50" /></a>';

    if (!document.createElement('video').canPlayType('video/mp4')) {
      return alert('Weird, but it seems the application is broken and you can\'t play this video.');
    }

    videojs.BiggerSubtitleButton = videojs.Button.extend({
        /** @constructor */
        init: function(player, options){
            videojs.Button.call(this, player, options);
            this.on('click', this.onClick);
        }
    });

    videojs.BiggerSubtitleButton.prototype.onClick = function() {
        var $subs = $('#video_player.video-js .vjs-text-track-display');
        var font_size = parseInt($subs.css('font-size'));
        font_size = font_size + 3;
        $subs.css('font-size', font_size+'px');
    };

    var createBiggerSubtitleButton = function() {
        var props = {
            className: 'vjs_biggersub_button vjs-control',
            innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">A+</span></div>',
            role: 'button',
            'aria-live': 'polite', // let the screen reader user know that the text of the button may change
            tabIndex: 0
        };
        return videojs.Component.prototype.createEl(null, props);
    }

    var biggerSubtitle;
    videojs.plugin('biggerSubtitle', function() {
        var options = { 'el' : createBiggerSubtitleButton() };
        biggerSubtitle = new videojs.BiggerSubtitleButton(this, options);
        this.controlBar.el().appendChild(biggerSubtitle.el());
    });

    videojs.SmallerSubtitleButton = videojs.Button.extend({
        /** @constructor */
        init: function(player, options){
            videojs.Button.call(this, player, options);
            this.on('click', this.onClick);
        }
    });

    videojs.SmallerSubtitleButton.prototype.onClick = function() {
        var $subs = $('#video_player.video-js .vjs-text-track-display');
        var font_size = parseInt($subs.css('font-size'));
        font_size = font_size - 3;
        $subs.css('font-size', font_size+'px');
    };

    var createSmallerSubtitleButton = function() {
        var props = {
            className: 'vjs_smallersub_button vjs-control',
            innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">A-</span></div>',
            role: 'button',
            'aria-live': 'polite', // let the screen reader user know that the text of the button may change
            tabIndex: 0
        };
        return videojs.Component.prototype.createEl(null, props);
    }

    var smallerSubtitle;
    videojs.plugin('smallerSubtitle', function() {
        var options = { 'el' : createSmallerSubtitleButton() };
        smallerSubtitle = new videojs.SmallerSubtitleButton(this, options);
        this.controlBar.el().appendChild(smallerSubtitle.el());
    });

    // Move this to a separate view.
    $('#video-container').html(player).show();

    // Make sure you can drag the window by the video
    $('#video-container video').canDragWindow();

    // Double Click to toggle Fullscreen
    $('#video-container video').dblclick(function(event){
      win.toggleKioskMode();
    });

    // Init video.
    var video = videojs('video_player', { plugins: { biggerSubtitle : {}, smallerSubtitle : {} }});

    // Enter full-screen
    $('.vjs-fullscreen-control').on('click', function () {
      win.toggleKioskMode();
    });

    // Enter full-screen
    $(document).on('keyup', function (e) {
      if (e.keyCode == 27) { 
        win.leaveKioskMode();
      }
    });



    // Close player
    $('#video_player_close').on('click', function () {
      win.leaveKioskMode();
      $('#video-container').hide();
      video.dispose();
      $(document).trigger('videoExit');
    });

    video.player().on('pause', function () {  });
    video.player().on('play', function () { 
      // Trigger a resize so the subtitles are adjusted
      $(window).trigger('resize'); 
    });
    // There was an issue with the video
    video.player().on('error', function (error) {
      console.log(error);
    });

    App.loader(false);
};


// Change the subtitle size on resize so it fits the screen proportionally
jQuery(function ($) {
  $(window).resize(function(){

    // Calculate a decent font size
    // Baseline: WindowHeight:600px -> FontSize:20px
    var font_size = Math.ceil($(window).height() * 0.0333333);
    var min_font_size = 18;
    font_size = font_size < min_font_size ? min_font_size : font_size

    $('#video-container').css('font-size', font_size+'px');

    // And adjust the subtitle position so they always match the bottom of the video 
    var $video = $('#video-container video');
    var $subs = $('#video-container .vjs-text-track-display');

    if( $video.length && $subs.length ) {
      if( $video[0].videoWidth > 0 && $video[0].videoHeight > 0 ) {
        var ratio = $video[0].videoWidth / $video[0].videoHeight;
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        var realVideoHeight = windowWidth / ratio;
        realVideoHeight = realVideoHeight > windowHeight ? windowHeight : realVideoHeight;

        var bottomOffset = (windowHeight - realVideoHeight) / 2;

        $subs.css('bottom', bottomOffset+'px');
      }
    }

  }).trigger('resize');
});


// On Document Ready
jQuery(function ($) {
  $('.btn-os.min').on('click', function () {
    win.minimize();
  });

  $('.btn-os.close').on('click', function () {
    win.close();
  });

  $('.popcorn-load .btn-close').click(function(event){
    event.preventDefault();
    App.loader(false);
    $(document).trigger('videoExit');
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

  $('body').on('keypress', function (evt) {
    if (evt.keyCode === 13) {}
  });
});

// Drag the window by a specific element
(function( $ ){

  $.fn.canDragWindow = function() {

    return this.each(function(ix, element){

      // Since the -drag CSS property fucks up the touch events, this is a hack so we can drag the window by the video anyway.
      var mouseIsDown = false;
      var previousPos = {};

      // TODO: This breaks under multiple screens on Windows (it won't go outside the screen it's on)
      $(element).mousedown(function(event){
        // Only move with the left mouse button
        if( event.button != 0 ){ return; }
        mouseIsDown = true;
        previousPos = {x: event.screenX, y: event.screenY};
      }).mouseup(function(event){
        mouseIsDown = false;
      }).mousemove(function(event){

        var thisPos = {x: event.screenX, y: event.screenY};
        var distance = {x: thisPos.x - previousPos.x, y: thisPos.y - previousPos.y};
        previousPos = thisPos;

        if( mouseIsDown && ! win.isKioskMode ){
          window.moveBy(distance.x, distance.y);
        }
      });

    });

  };

})( jQuery );
