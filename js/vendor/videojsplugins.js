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


// Custom Subtitles
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

      this.fileInput_ = $('<input type="file" style="display: none;">');
      $(this.el()).append(this.fileInput_);

      var that = this;
      this.fileInput_.on('change', function() {
        that.loadSubtitle(this.value);
      });

      vjs.TextTrackMenuItem.call(this, player, options);
    }
  });

  CustomTrackMenuItem.prototype.onClick = function() {
    this.fileInput_.trigger('click'); // redirect to fileInput click
  }

  CustomTrackMenuItem.prototype.loadSubtitle = function(filePath) {
    // Copy file to tmp
    var fs = require('fs');
    fs.writeFileSync('tmp/custom.srt', fs.readFileSync(filePath), { enconding: 'utf8' });
    // TODO Handle copy errors, validation, etc
    // TODO Fix UTF8 issue
    // TODO Delete old track
    this.track = this.player_.addTextTrack('subtitles', 'Custom...', '00', { src: './tmp/custom.srt' });
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


    // Fetches a subtitle and then does horrible things to make it work properly
    function getSubtitle ( subUrl, language, callback ) {

      var request = require('request');
      var fs = require('fs');
      var AdmZip = require('adm-zip');
      var http = require('http');
      var url = require('url');
      var charsetDetect = require('jschardet');
      var targetCharset = 'utf-8';
      var targetEncodingCharset = 'utf8';

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
            var zip = new AdmZip(buf);
            var zipEntries = zip.getEntries();
            zipEntries.forEach(function(zipEntry, key) {
              if (zipEntry.entryName.indexOf('.srt') != -1) {

                var decompressedData = zip.readFile(zipEntry); // decompressed buffer of the entry
                var charset = charsetDetect.detect(decompressedData);
                if (charset.encoding == targetEncodingCharset || charset.encoding == targetCharset) {
                  callback(decompressedData.toString('utf-8'));
                }
                else {
                  var iconv = require('iconv-lite');
                  // Windows-1251/2/IBM855 works fine when read from a file (like it's UTF-8), but if you try to convert it you'll ruin the encoding.
                  // Just save it again, and it'll be stored as UTF-8. At least on Windows.

                  if( charset.encoding == 'IBM855' ) {
                    // If you're wondering "What the fuck is this shit?", there's a bug with the charset detector when using portuguese or romanian. It's actually ISO-8859-1.
                    decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-1'), targetEncodingCharset );
                  }
                  else if( charset.encoding == 'windows-1251' || charset.encoding == 'windows-1252' || charset.encoding == 'windows-1255' || charset.encoding == 'windows-1254' ) {
                    // It's the charset detector fucking up again, now with Spanish, Portuguese, French (1255) and Romanian
                    if( language == 'romanian' ) {
                      // And if it's romanian, it's iso-8859-2
                      decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-2'), targetEncodingCharset );
                    }
                    else if ( language == 'turkish' ) {
                      // And if it's turkish, it's iso-8859-9
                      decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-9'), targetEncodingCharset );
                    }
                    else {
                      decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-1'), targetEncodingCharset );
                    }
                  }
                  else {
                    decompressedData = iconv.encode( iconv.decode(decompressedData, charset.encoding), targetEncodingCharset );
                  }

                  callback(decompressedData.toString('utf-8'));
                }
              }
            });
          });
      });
    }

    getSubtitle(this.src_, this.language_, vjs.bind(this, this.parseCues));
  }

};
