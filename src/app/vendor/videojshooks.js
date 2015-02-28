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
    win.debug('');
    win.debug('Event fired at: '+ vjs.formatTime(this.player_.currentTime(), this.player_.duration()));
    win.debug(event);
  }
  if(event !== undefined && event.type === 'mousemove'){
    if(event.webkitMovementX === 0 && event.webkitMovementY === 0) return;
  }
  this.userActivity_ = true;
};

vjs.Player.prototype.listenForUserActivity = function(){
  var onActivity, onMouseDown, mouseInProgress, onMouseUp,
      activityCheck, inactivityTimeout;

  onActivity = vjs.bind(this, this.reportUserActivity);

  onMouseDown = function(e) {
    onActivity(e);
    clearInterval(mouseInProgress);
    mouseInProgress = setInterval(onActivity, 250);
  };
  
  onMouseUp = function(e) {
    onActivity(e);
    clearInterval(mouseInProgress);
  };
  
  this.on('mousedown', onMouseDown);
  this.on('mousemove', onActivity);
  this.on('mouseup', onMouseUp);
  this.on('keydown', onActivity);
  this.on('keyup', onActivity);
  
  activityCheck = setInterval(vjs.bind(this, function() {
    if (this.userActivity_) {
      this.userActivity_ = false;
      this.userActive(true);
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(vjs.bind(this, function() {
        if (!this.userActivity_) {
          this.userActive(false);
        }
      }), 2000);
    }
  }), 250);

  this.on('dispose', function(){
    clearInterval(activityCheck);
    clearTimeout(inactivityTimeout);
  });
};

vjs.TextTrack.prototype.adjustFontSize = function(){
    if (this.player_.isFullscreen()) {
        this.el_.style.fontSize = '140%';
        $('.state-info-player').css('font-size','65px');
    } else {
        this.el_.style.fontSize = '';
        $('.state-info-player').css('font-size','50px');
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
            $('.vjs-subtitles').css('color', Settings.subtitle_color);
            $('.vjs-subtitles').css('font-family', Settings.subtitle_font);
            if (Settings.subtitle_decoration === 'None') {
                $('.vjs-text-track').css('text-shadow', 'none');
            } else if (Settings.subtitle_decoration === 'Opaque Background') {
                $('.vjs-text-track').css('background', '#000');
            }
			$('.vjs-text-track').css('z-index','auto').css('position','relative').css('top', AdvSettings.get('playerSubPosition'));
		});

		// Fetches a raw subtitle, locally or remotely
		function get_subtitle(subtitle_url, callback) {
			var request = require('request');

			// Fetches Locally
			if (fs.existsSync(subtitle_url)) {
				fs.readFile(subtitle_url, function(error, data) {
					if(!error){
						callback(data);
					}else{
						win.warn('Failed to read subtitle!', error);
					}
				});
			// Fetches Remotely
			} else {
				request({url: subtitle_url, encoding: null}, function(error, response, data){
					if (!error && response.statusCode == 200) {
						callback(data);
					}else{
						win.warn('Failed to download subtitle!', error, response);
					}
				});
			}
		}

		// Decompress zip
		function decompress(dataBuff, callback) {
			try {
				var AdmZip  = require('adm-zip');
				var zip = new AdmZip(dataBuff);
				var zipEntries = zip.getEntries();
				// TODO: Shouldn't we look for only 1 file ???
				zipEntries.forEach(function(zipEntry, key) {
					if (zipEntry.entryName.indexOf('.srt') != -1) {
						var decompressedData = zip.readFile(zipEntry);
						callback(decompressedData);
					}
				});
			} catch (error) {
				win.warn('Failed to decompress subtitle!', error);
			}
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
		get_subtitle(this.src_, function(dataBuf) {
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
  this.trigger('volumechange');
};

/**
 * The custom progressbar we create. Updated in player.js
 *
 * @constructor
 */
vjs.LoadProgressBar = vjs.Component.extend({
  init: function(player, options){
    vjs.Component.call(this, player, options);
    this.on(player, 'progress', this.update);
  }
});
vjs.LoadProgressBar.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-load-progress',
    innerHTML: '<span class="vjs-control-text"><span>Loaded</span>: 0%</span>'
  });
};
vjs.LoadProgressBar.prototype.update = function(){ return; };

//Display our own error
var suggestedExternal = function () {
	var link = '<a href="http://www.videolan.org/vlc/" class="links">VLC</a>';
	try {
		App.Device.Collection.models.forEach( function (player) { 
			link = (player.id === 'VLC') ? player.id : link;
		});
	} catch (e) {};
	return link;
};
vjs.ErrorDisplay.prototype.update = function(){
  if (this.player().error()) {
	if (this.player().error().message === 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.') {
		this.contentEl_.innerHTML = i18n.__('The video playback encountered an issue. Please try an external player like %s to view this content.', suggestedExternal());
	} else {
		this.contentEl_.innerHTML = this.player().error().message;
	}
  }
};

// Remove videojs key listeners
vjs.Button.prototype.onKeyPress = function(event){ return; };
