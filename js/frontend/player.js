// Opens a streaming torrent client

var videoStreamer = null;
var playTorrent = window.playTorrent = function (torrent, subs, movieModel, callback, progressCallback) {

  videoStreamer ? $(document).trigger('videoExit') : null;

  // Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
  var tmpFolder = path.join(os.tmpDir(), 'Popcorn-Time')
  var tmpFilename = ( torrent.toLowerCase().split('/').pop().split('.torrent').shift() ).slice(0,100);
  tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') + '.mp4';
  var tmpFile = path.join(tmpFolder, tmpFilename);

  var numCores = (os.cpus().length > 0) ? os.cpus().length : 1;
  var numConnections = 100;

  // Start Peerflix
  var peerflix = require('peerflix');

  videoStreamer = peerflix(torrent, {
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
        videoStreamer = null;

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
  'dutch'     : 'Nederlands',
  'german'    : 'Deutsch',
  'hungarian' : 'Magyar',
  'finnish'   : 'Suomi',
  'bulgarian' : 'Български'};


function videoError(e) {
  // video playback failed - show a message saying why
  // TODO: localize
  switch (e.code) {
    case e.MEDIA_ERR_ABORTED:
      return 'The video playback was aborted.';
    case e.MEDIA_ERR_NETWORK:
      return 'A network error caused the video download to fail part-way.';
    case e.MEDIA_ERR_DECODE:
      return 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
    case e.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'The video format is not supported.';
    default:
      return 'An unknown error occurred.';
   }
}


// Handles the opening of the video player

window.spawnVideoPlayer = function (url, subs, movieModel) {

    // Sort sub according lang translation
    var subArray = [];
    for (var lang in subs) {
        if( typeof SubtitleLanguages[lang] == 'undefined' ){ continue; }
        subArray.push({
            'language': lang,
            'languageName': SubtitleLanguages[lang],
            'sub': subs[lang]
        });
    }
    subArray.sort(function (sub1, sub2) {
        return sub1.language > sub2.language;
    });

    var subtracks = '';
    for(var index in subArray ) {
      subtracks += '<track kind="subtitles" src="' + subArray[index].sub + '" srclang="'+ subArray[index].language +'" label="' + subArray[index].languageName + '" charset="utf-8" />';
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
    var video = window.videoPlaying = videojs('video_player', { plugins: { biggerSubtitle : {}, smallerSubtitle : {}, customSubtitles: {} }});

    // Enter full-screen
    $('.vjs-fullscreen-control').on('click', function () {
      if(win.isFullscreen) {
        win.leaveFullscreen();
        win.focus();
      } else {
        win.enterFullscreen();
        win.focus();
      }
    });

    // Exit full-screen
    $(document).on('keydown', function (e) {
      if (e.keyCode == 27) {
        if(win.isFullscreen) {
          win.leaveFullscreen();
          win.focus();
        }
      }
    });


    tracks = video.textTracks();
    for( var i in tracks ) {
      tracks[i].on('loaded', function(){
        // Trigger a resize to get the subtitles position right
        $(window).trigger('resize');
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


    // Close player
    $('#video_player_close').on('click', function () {
      win.leaveFullscreen();
      $('#video-container').hide();
      video.dispose();
      $('body').removeClass();
      $(document).trigger('videoExit');

    });


    // Had only tracking in, leave it here if we want to do something else when paused.
    video.player().on('pause', function () {

    });

    video.player().on('play', function () {
      // Trigger a resize so the subtitles are adjusted
      $(window).trigger('resize');
    });

    // There was an issue with the video
    video.player().on('error', function (error) {
      // TODO: what about some more elegant error tracking
      alert('Error: ' + videoError(document.getElementById('video_player').player.error()));
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
