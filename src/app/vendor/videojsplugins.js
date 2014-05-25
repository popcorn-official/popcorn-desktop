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
  var $subs = $('#video_player.video-js .vjs-text-track-display');
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

// Intercept drag'n'drop of subtitles into movie window
videojs.plugin('dropSubtitles', function() {
  var this_ = this;

  function setDroppedSubtitle(path) {
    var track = this_.addTextTrack('subtitles', 'Dropped sub', '00', { src: path });
    this_.showTextTrack(track.id(), track.kind());
  }

  this_.on('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.dataTransfer.files;
    if(files.length == 1) {
	
        var regexAll = /[^\\]*\.(\w+)$/;
        var total = files[0].path.match(regexAll);
        var filename = total[0];
        var extension = total[1];
		
        if(extension == "srt") {
            win.info("Subtitle dropped: " + files[0].path);
            setDroppedSubtitle(files[0].path);                    
        } else {
            win.warn("File dropped is not a subtitle");
        }
    } else {
        win.warn("Too many files dropped");
        return;
    }
  })

  this_.on('dragover', function(e) {
    //prevent dragover event as http://stackoverflow.com/questions/14346556/drop-event-not-firing-on-backbone-view/14349610#14349610 describes
    e.preventDefault();
  })
});