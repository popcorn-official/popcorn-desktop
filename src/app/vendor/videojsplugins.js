// VideoJS Plugins

videojs.BiggerSubtitleButton = videojs.Button.extend({
  /** @constructor */
  init: function(player, options){
    videojs.Button.call(this, player, options);
    this.on('click', this.onClick);
  }
});

videojs.BiggerSubtitleButton.prototype.onClick = function() {
  var $subs = $('#video_player.video-js .vjs-text-track');
  var font_size = parseInt($subs.css('font-size'));
  font_size = font_size + 2;
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
  var $subs = $('#video_player.video-js .vjs-text-track');
  var font_size = parseInt($subs.css('font-size'));
  font_size = font_size - 2;
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


// Custom Subtitles Button/Menu
videojs.plugin('customSubtitles', function() {

  // Find subtitlesButton
  var subtitlesButton;
  this.controlBar.children().forEach(function(el) { if (el.name() == 'subtitlesButton') subtitlesButton = el; });

  var CustomTrackMenuItem = vjs.TextTrackMenuItem.extend({

    /*@ Constructor */
    init: function(player, options) {
      options = options || {};
      // fake 'empty' track
      options['track'] = {
        kind: function() { return 'subtitles'; },
        player: player,
        label: function(){ return 'Custom...' },
        dflt: function(){ return false; },
        mode: function(){ return false; }
      };

      this.fileInput_ = $('<input type="file" accept=".srt" style="display: none;">');
      $(this.el()).append(this.fileInput_);

      var that = this;
      this.fileInput_.on('change', function() {
        if (this.value == '') return;
        that.loadSubtitle(this.value);
      });

      vjs.TextTrackMenuItem.call(this, player, options);
    }
  });

  CustomTrackMenuItem.prototype.onClick = function() {
    this.fileInput_.trigger('click'); // redirect to fileInput click
  }

  CustomTrackMenuItem.prototype.loadSubtitle = function(filePath) {
    // TODO Delete old track
    this.track = this.player_.addTextTrack('subtitles', 'Custom...', '00', { src: filePath });
    vjs.TextTrackMenuItem.prototype.onClick.call(this); // redirect to TextTrackMenuItem.onClick
  }

  subtitlesButton.menu.addItem(new CustomTrackMenuItem(this));
  subtitlesButton.show(); // Always show subtitles button

})

/*! videojs-progressTips - v0.1.0 - 2013-09-16
* https://github.com/mickey/videojs-progressTips
* Copyright (c) 2013 Michael Bensoussan; Licensed MIT */

videojs.plugin('progressTips', function(options) {
    var init;
    init = function() {
      var player;
      /*if (this.techName !== "Html5") {
        return;
      }*/
      player = this;
      $(".vjs-progress-control").prepend($("<div id='vjs-tip'>  <div id='vjs-tip-arrow'></div>  <div id='vjs-tip-inner'></div>  </div>"));
      $("#vjs-tip").css("top", "-30px");
	  $(".vjs-progress-control .vjs-slider").on("mousemove", function(event) {
        var time, hours, minutes, seconds, seekBar, timeInSeconds;
        seekBar = player.controlBar.progressControl.seekBar;
        timeInSeconds = seekBar.calculateDistance(event) * seekBar.player_.duration();
        if (timeInSeconds === seekBar.player_.duration()) {
          timeInSeconds = timeInSeconds - 0.1;
        }
		hours = Math.floor(timeInSeconds / 60 / 60);
        minutes = Math.floor(timeInSeconds / 60);
        seconds = Math.floor(timeInSeconds - minutes * 60);
        if (seconds < 10) {
			seconds = "0" + seconds;
        }
		if(hours > 0) {
			minutes = minutes % 60;
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			time = "" + hours + ":" + minutes + ":" + seconds;
		}else{
			time = "" + minutes + ":" + seconds;
		}
        $('#vjs-tip-inner').html( time );
        $("#vjs-tip").css("left", "" + (event.pageX - $(this).offset().left - ( $("#vjs-tip").outerWidth() / 2 ) ) + "px").css("visibility", "visible");
        return;
      });
      $(".vjs-progress-control, .vjs-play-control").on("mouseout", function() {
        $("#vjs-tip").css("visibility", "hidden");
      });
    };
    this.on("loadedmetadata", init);
  });

// This is a custom way of loading subtitles, since we can't use src (CORS blocks it and we can't disable it)
// We fetch them when requested, process them and finally throw a parseCues their way
vjs.TextTrack.prototype.load = function(){
			
  // Only load if not loaded yet.
  if (this.readyState_ === 0) {
    this.readyState_ = 1;


    // Fetches a raw subtitle, locally or remotely
    function getSub (subUrl, callback) {

      var fs  = require('fs');
      var http    = require('http');
      var url     = require('url');

      // Fetches Locally
      if (fs.existsSync(subUrl)) {
        fs.readFile(subUrl, function(err, data) {
          // TODO: Error handling --- if (err) throw err;
          callback(data);
        })

      // Fetches remotely
      // TODO: Lots of Error Handling
      } else {
        var options = {
          host: url.parse(subUrl).host,
          port: 80,
          path: url.parse(subUrl).pathname
        };
        http.get(options, function(res) {
          var data = [], dataLen = 0;
          res.on('data', function(chunk) {
            data.push(chunk);
            dataLen += chunk.length;
          }).on('end', function() {
            var buf = new Buffer(dataLen);
            for (var i=0, len = data.length, pos = 0; i < len; i++) {
              data[i].copy(buf, pos);
              pos += data[i].length;
            }
            callback(buf);
          });
        });
      }
    }

    // Decompress zip
    function decompress(dataBuff, callback) {
      // TODO: Error handling, exceptions, etc
      var AdmZip  = require('adm-zip');
      var zip = new AdmZip(dataBuff);
      var zipEntries = zip.getEntries();
      // TODO: Shouldn't we look for only 1 file ???
      zipEntries.forEach(function(zipEntry, key) {
        if (zipEntry.entryName.indexOf('.srt') != -1) {
          var decompressedData = zip.readFile(zipEntry); // decompressed buffer of the entry
          callback(decompressedData);
        }
      });
    }

    // Handles charset encoding
    function decode(dataBuff, language, callback) {
      var charsetDetect = require('jschardet');
      var targetCharset = 'utf-8';
      var targetEncodingCharset = 'utf8';

      var charset = charsetDetect.detect(dataBuff);
      var detectedEncoding = charset.encoding;

      // Do we need decoding?
      if (detectedEncoding == targetEncodingCharset || detectedEncoding == targetCharset) {
        callback(dataBuff.toString('utf-8'));

      // We do
      } else {
        var iconv = require('iconv-lite');
        // Windows-1251/2/IBM855 works fine when read from a file (like it's UTF-8), but if you try to convert it you'll ruin the encoding.
        // Just save it again, and it'll be stored as UTF-8. At least on Windows.

        if ( detectedEncoding == 'IBM855' || detectedEncoding == 'windows-1250' || detectedEncoding == 'windows-1251' || detectedEncoding == 'windows-1252' || detectedEncoding == 'windows-1255' || detectedEncoding == 'windows-1254' ) {
          // It's the charset detector screwing up again
          var langInfo = App.Localization.languages[language] || {};
          var expected = langInfo.encoding;
          if (expected && expected.indexOf(detectedEncoding) < 0) {
            // The detected encoding was unexepected to the language, so we'll use the most common
            // encoding for that language instead.
            detectedEncoding = expected[0];
          }
        }

        dataBuff = iconv.encode( iconv.decode(dataBuff, detectedEncoding), targetEncodingCharset );
        callback(dataBuff.toString('utf-8'));
      }
    }

    // Get it, Unzip it, Decode it, Send it
    var this_ = this;
    getSub(this.src_, function(dataBuf) {
      var path = require('path');
      if (path.extname(this_.src_) === '.zip') {
        decompress(dataBuf, function(dataBuf) {
          decode(dataBuf, this_.language(), vjs.bind(this_, this_.parseCues));
        });
      } else {
        decode(dataBuf, this_.language(), vjs.bind(this_, this_.parseCues));
      }
    });

    // TODO: Error Handling when an invalid .srt file is loaded.

  }

};
