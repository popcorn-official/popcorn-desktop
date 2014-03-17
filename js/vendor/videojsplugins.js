// VideoJS Plugins

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

      // Do we need decoding?
      if (charset.encoding == targetEncodingCharset || charset.encoding == targetCharset) {
        callback(dataBuff.toString('utf-8'));

      // We do
      } else {
        var iconv = require('iconv-lite');
        // Windows-1251/2/IBM855 works fine when read from a file (like it's UTF-8), but if you try to convert it you'll ruin the encoding.
        // Just save it again, and it'll be stored as UTF-8. At least on Windows.

        if( charset.encoding == 'IBM855' ) {
          // If you're wondering "What the fuck is this shit?", there's a bug with the charset detector when using portuguese or romanian. It's actually ISO-8859-1.
          dataBuff = iconv.encode( iconv.decode(dataBuff, 'iso-8859-1'), targetEncodingCharset );
        }
        else if( charset.encoding == 'windows-1251' || charset.encoding == 'windows-1252' || charset.encoding == 'windows-1255' || charset.encoding == 'windows-1254' ) {
          // It's the charset detector fucking up again, now with Spanish, Portuguese, French (1255) and Romanian
          if( language == 'romanian' ) {
            // And if it's romanian, it's iso-8859-2
            dataBuff = iconv.encode( iconv.decode(dataBuff, 'iso-8859-16'), targetEncodingCharset );
          }
          else if ( language == 'turkish' ) {
            // And if it's turkish, it's iso-8859-9
            dataBuff = iconv.encode( iconv.decode(dataBuff, 'iso-8859-9'), targetEncodingCharset );
          }
          else {
            // Or else, it's ISO-8859-1 by default
            dataBuff = iconv.encode( iconv.decode(dataBuff, 'iso-8859-1'), targetEncodingCharset );
          }
        }
        else {
          // If it's not any of those cases, we should be able to do a decent conversion.
          dataBuff = iconv.encode( iconv.decode(dataBuff, charset.encoding), targetEncodingCharset );
        }

        callback(dataBuff.toString('utf-8'));
      }
    }

    // Get it, Unzip it, Decode it, Send it
    var this_ = this;
    getSub(this.src_, function(dataBuf) {
      var path = require('path');
      if (path.extname(this_.src_) === '.zip') {
        decompress(dataBuf, function(dataBuf) {
          decode(dataBuf, this_.language, vjs.bind(this_, this_.parseCues));
        });
      } else {
        decode(dataBuf, this_.language, vjs.bind(this_, this_.parseCues));
      }
    });

    // TODO: Error Handling when an invalid .srt file is loaded.

  }

};
