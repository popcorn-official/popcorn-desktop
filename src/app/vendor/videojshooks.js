vjs.options['defaultVolume'] = 1;
vjs.options['children'] = {
    'mediaLoader': {},
    'posterImage': {},
    'textTrackDisplay': {},
    'loadingSpinner': {},
	//'bigPlayButton': {},
    'controlBar': {},
    'errorDisplay': {}
};

vjs.Player.prototype.debugMouse_ = false;
vjs.Player.prototype.reportUserActivity = function(event){
  /** DEBUG MOUSE CTRL+D **/
  if(this.debugMouse_) {
    console.log('');
    console.log('Event fired at: '+ vjs.formatTime(this.player_.currentTime(), this.player_.duration()));
    console.log(event);
  }
  /** Possible not needed anymore with new version
  if(event !== undefined && event.type === 'mousemove'){
    if(event.webkitMovementX === 0 && event.webkitMovementY === 0) return;
  }
  **/
  this.userActivity_ = true;
};

vjs.TextTrack.prototype.adjustFontSize = function(){
    if (this.player_.isFullscreen()) {
        $('#video_player .vjs-text-track').css('font-size', '140%');
    } else {
        $('#video_player .vjs-text-track').css('font-size', '100%');
    }
};

// This is a custom way of loading subtitles, since we can't use src (CORS blocks it and we can't disable it)
// We fetch them when requested, process them and finally throw a parseCues their way
vjs.TextTrack.prototype.load = function(){
			
	// Only load if not loaded yet.
	if (this.readyState_ === 0) {
	this.readyState_ = 1;

	this.on('loaded', function(){
		win.info('Subtitle loaded!');
		$('#video_player .vjs-text-track').css('display','inline-block').drags();
		$('#video_player .vjs-text-track-display').css('font-size', Settings.subtitle_size);
	});

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
		var targetEncodingCharset = 'utf8';

		var charset = charsetDetect.detect(dataBuff);
		var detectedEncoding = charset.encoding;
		win.debug("SUB charset detected: "+detectedEncoding);
		// Do we need decoding?
		if (detectedEncoding.toLowerCase().replace('-','') == targetEncodingCharset) {
			callback(dataBuff.toString('utf-8'));
		// We do
		} else {
			var iconv = require('iconv-lite');
			// Windows-1251/2/IBM855 works fine when read from a file (like it's UTF-8), but if you try to convert it you'll ruin the encoding.
			// Just save it again, and it'll be stored as UTF-8. At least on Windows.
			//if ( detectedEncoding == 'UTF-16LE' || detectedEncoding == 'MacCyrillic' || detectedEncoding == 'IBM855' || detectedEncoding == 'windows-1250' || detectedEncoding == 'windows-1251' || detectedEncoding == 'windows-1252' || detectedEncoding == 'windows-1255' || detectedEncoding == 'windows-1254' ) {
			// It's the charset detector screwing up again
			var langInfo = App.Localization.langcodes[language] || {};
			win.debug("SUB charset expected: "+langInfo.encoding);
			if (langInfo.encoding !== undefined && langInfo.encoding.indexOf(detectedEncoding) < 0) {
				// The detected encoding was unexepected to the language, so we'll use the most common
				// encoding for that language instead.
				detectedEncoding = langInfo.encoding[0];
			}
			win.debug("SUB charset used: "+detectedEncoding);
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

/**
 * The specific menu item type for selecting a language within a text track kind
 *
 * @constructor
 */
vjs.TextTrackMenuItem = vjs.MenuItem.extend({
  /** @constructor */
  init: function(player, options){
    var track = this.track = options['track'];

    // Modify options for parent MenuItem class's init.
    options['label'] = track.label();
    options['selected'] = track.dflt();
    vjs.MenuItem.call(this, player, options);

    this.player_.on(track.kind() + 'trackchange', vjs.bind(this, this.update));

    // Popcorn Time Fix 
    // Allowing us to send a default language
    if(track.dflt()) {
        this.player_.showTextTrack(this.track.id_, this.track.kind());
    }
  }
});

vjs.TextTrackMenuItem.prototype.onClick = function(){
  vjs.MenuItem.prototype.onClick.call(this);
  this.player_.showTextTrack(this.track.id_, this.track.kind());
};

vjs.TextTrackMenuItem.prototype.update = function(){
  this.selected(this.track.mode() == 2);
};

vjs.Player.prototype.onLoadStart = function() {
  this.off('play', initFirstPlay);
  this.one('play', initFirstPlay);

  if (this.error()) {
    this.error(null);
  }
  
  vjs.addClass(this.el_, 'vjs-has-started');
};