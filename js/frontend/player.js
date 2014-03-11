// Opens a streaming torrent client

var videoPeerflix = null;
var playTorrent = window.playTorrent = function (torrent, subs, movieModel, callback, progressCallback) {

  videoPeerflix ? $(document).trigger('videoExit') : null;

  // Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
  var tmpFilename = ( torrent.toLowerCase().split('/').pop().split('.torrent').shift() ).slice(0,100);
  tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') + '.mp4';
  var tmpFile = path.join(tmpFolder, tmpFilename);

  var numCores = (os.cpus().length > 0) ? os.cpus().length : 1;
  var numConnections = 100;

  // Start Peerflix
  var peerflix = require('peerflix');

  videoPeerflix = peerflix(torrent, {
    // Set the custom temp file
    path: tmpFile,
    //port: 554,
    buffer: (1.5 * 1024 * 1024).toString(),
    connections: numConnections
  }, function (err, flix) {
    if (err) throw err;

    var started = Date.now(),
      loadedTimeout;

    flix.server.on('listening', function () {
      var href = 'http://127.0.0.1:' + flix.server.address().port + '/';

      loadedTimeout ? clearTimeout(loadedTimeout) : null;

      var checkLoadingProgress = function () {

        var now = flix.downloaded,
          total = flix.selected.length,
        // There's a minimum size before we start playing the video.
        // Some movies need quite a few frames to play properly, or else the user gets another (shittier) loading screen on the video player.
          targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
          targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

          targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

          percent = now / targetLoaded * 100.0;

        if (now > targetLoaded) {
          if (typeof window.spawnVideoPlayer === 'function') {
            window.spawnVideoPlayer(href, subs, movieModel);
          }
          if (typeof callback === 'function') {
            callback(href, subs, movieModel);
          }
        } else {
          typeof progressCallback == 'function' ? progressCallback( percent, now, total) : null;
          loadedTimeout = setTimeout(checkLoadingProgress, 500);
        }
      };
      checkLoadingProgress();


      $(document).on('videoExit', function() {
        if (loadedTimeout) { clearTimeout(loadedTimeout); }

        // Keep the sidebar open
        $("body").addClass("sidebar-open").removeClass("loading");

        // Stop processes
        flix.clearCache();
        flix.destroy();
        videoPeerflix = null;

        // Unbind the event handler
        $(document).off('videoExit');

        delete flix;
      });
    });
  });

};


// Supported Languages for Subtitles

window.SubtitleLanguages = {
  'spanish'   : 'Español',
  'english'   : 'English',
  'french'    : 'Français',
  'turkish'   : 'Türkçe',
  'romanian'  : 'Română',
  'portuguese': 'Português',
  'brazilian' : 'Português-Br',
  'dutch'     : 'Nederlands'
};


// Handles the opening of the video player

window.spawnVideoPlayer = function (url, subs, movieModel) {

    // Sort sub according lang translation
    var subArray = [];
    for (lang in subs) {
        if( typeof SubtitleLanguages[lang] == 'undefined' ){ continue; }
        subArray.push({
            'language': SubtitleLanguages[lang],
            'sub': subs[lang]
        });
    }
    subArray.sort(function (sub1, sub2) {
        return sub1.language > sub2.language;
    });

    var subtracks = '';
    for( index in subArray ) {
      subtracks += '<track kind="subtitles" src="app://host/' + subArray[index].sub + '" srclang="es" label="' + subArray[index].language + '" charset="utf-8" />';
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
        
        userTracking.event('Video Subtitle Size', 'Make Bigger', font_size+'px', font_size).send();
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
        
        userTracking.event('Video Subtitle Size', 'Make Smaller', font_size+'px', font_size).send();
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
    $('body').removeClass().addClass('watching');

    // Make sure you can drag the window by the video
    $('#video-container video').canDragWindow();

    // Double Click to toggle Fullscreen
    $('#video-container video').dblclick(function(event){
      $('.vjs-fullscreen-control').trigger('click');
    });

    // Init video.
    var video = videojs('video_player', { plugins: { biggerSubtitle : {}, smallerSubtitle : {} }});

    
    userTracking.pageview('/movies/watch/'+movieModel.get('slug'), movieModel.get('niceTitle') ).send();

    
    // Enter full-screen
    $('.vjs-fullscreen-control').on('click', function () {
      if(win.isFullscreen) {
        win.leaveFullscreen();
        userTracking.event('Video Size', 'Normal', movieModel.get('niceTitle') ).send();
        win.focus();
      } else {
        win.enterFullscreen();
        userTracking.event('Video Size', 'Fullscreen', movieModel.get('niceTitle') ).send();
        win.focus();
      }
    });

    // Exit full-screen
    $(document).on('keydown', function (e) {
      if (e.keyCode == 27) { 
        if(win.isFullscreen) {
          win.leaveFullscreen();
          userTracking.event('Video Size', 'Normal', movieModel.get('niceTitle') ).send();
          win.focus();
        }
      }
    });

    
    tracks = video.textTracks();
    for( var i in tracks ) {
      tracks[i].on('loaded', function(){
        // Trigger a resize to get the subtitles position right
        $(window).trigger('resize'); 
        userTracking.event('Video Subtitles', 'Select '+ this.language_, movieModel.get('niceTitle') ).send();
      });
    }
    

    var getTimeLabel = function() {
      // Give the time in 1 minute increments up to 5min, from then on report every 5m up to half an hour, and then in 15' increments
      var timeLabel = ''
      if( video.currentTime() <= 5*60 ) {
        timeLabel = Math.round(video.currentTime()/60)+'min';
      } else if( video.currentTime() <= 30*60 ) {
        timeLabel = Math.round(video.currentTime()/60/5)*5+'min';
      } else {
        timeLabel = Math.round(video.currentTime()/60/15)*15+'min';
      }
      
      return timeLabel;
    };
    
    // Report the movie playback status once every 10 minutes
    var statusReportInterval = setInterval(function(){
      
      if( typeof video == 'undefined' || video == null ){ clearInterval(statusReportInterval); return; }
      
      userTracking.event('Video Playing', movieModel.get('niceTitle'), getTimeLabel(), Math.round(video.currentTime()/60) ).send();
      
    }, 1000*60*10);
    

    // Close player
    $('#video_player_close').on('click', function () {
      
      // Determine if the user quit because he watched the entire movie
      // Give 15 minutes or 15% of the movie for credits (everyone quits there)
      if( video.duration() > 0 && video.currentTime() >= Math.min(video.duration() * 0.85, video.duration() - 15*60) ) {
        userTracking.event('Video Finished', movieModel.get('niceTitle'), getTimeLabel(), Math.round(video.currentTime()/60) ).send();
      }
      else {
        userTracking.event('Video Quit', movieModel.get('niceTitle'), getTimeLabel(), Math.round(video.currentTime()/60) ).send();
      }
      
      // Clear the status report interval so it doesn't leak
      clearInterval(statusReportInterval);
      
      
      win.leaveFullscreen();
      $('#video-container').hide();
      video.dispose();
      $('body').removeClass();
      $(document).trigger('videoExit');
      
    });

    
    // Todo: delay these tracking events so we don't send two on double click
    video.player().on('pause', function () {
    
      //userTracking.event('Video Control', 'Pause Button', getTimeLabel(), Math.round(video.currentTime()/60) ).send();
    });
    
    video.player().on('play', function () { 
      // Trigger a resize so the subtitles are adjusted
      $(window).trigger('resize'); 
      
      //userTracking.event('Video Control', 'Play Button', getTimeLabel(), Math.round(video.currentTime()/60) ).send();
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
