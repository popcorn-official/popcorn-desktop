// VideoJS Plugins
var Button = videojs.getComponent('Button');
var controlBar;
videojs.BiggerSubtitleButton = videojs.extend(Button, {
    /** @constructor */
    init: function (player, options) {
        videojs.Button.call(this, player, options);
        this.on('click', this.onClick);
    }
});

videojs.BiggerSubtitleButton.prototype.onClick = function () {
    var $subs = $('#video_player.video-js .vjs-text-track-display');
    var font_size = parseInt($subs.css('font-size'));
    font_size = font_size + 2;
    $subs.css('font-size', font_size + 'px');
};

var createBiggerSubtitleButton = function () {
    var props = {
        className: 'vjs_biggersub_button vjs-control',
        innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">A+</span></div>',
        role: 'button',
        'aria-live': 'polite', // let the screen reader user know that the text of the button may change
        tabIndex: 0
    };
    return videojs.Component.prototype.createEl(null, props);
};

var biggerSubtitle;
videojs.registerPlugin('biggerSubtitle', function () {
    var options = {
        'el': createBiggerSubtitleButton()
    };
    biggerSubtitle = new videojs.BiggerSubtitleButton(this, options);
    controlBar.el().appendChild(biggerSubtitle.el());
});

videojs.SmallerSubtitleButton = videojs.extend(Button, {
    /** @constructor */
    init: function (player, options) {
        videojs.Button.call(this, player, options);
        this.on('click', this.onClick);
    }
});

videojs.SmallerSubtitleButton.prototype.onClick = function () {
    var $subs = $('#video_player.video-js .vjs-text-track-display');
    var font_size = parseInt($subs.css('font-size'));
    font_size = font_size - 2;
    $subs.css('font-size', font_size + 'px');
};

var createSmallerSubtitleButton = function () {
    var props = {
        className: 'vjs_smallersub_button vjs-control',
        innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">A-</span></div>',
        role: 'button',
        'aria-live': 'polite', // let the screen reader user know that the text of the button may change
        tabIndex: 0
    };
    return videojs.Component.prototype.createEl(null, props);
};

var smallerSubtitle;
videojs.registerPlugin('smallerSubtitle', function() {
var vsComponent = videojs.getComponent('Button');

// Create the button
videojs.SampleButton = videojs.extend(vsComponent, {
    constructor: function() {
        vsComponent.call(this, videojs, null);
    }
});

// Set the text for the button
videojs.SampleButton.prototype.buttonText = 'Mute Icon';

// These are the defaults for this class.
videojs.SampleButton.prototype.options_ = {};

// videojs.Button uses this function to build the class name.
videojs.SampleButton.prototype.buildCSSClass = function() {
    // Add our className to the returned className
    return 'vjs_smallersub_button vjs-control' + vsComponent.prototype.buildCSSClass.call(this);
};

// videojs.Button already sets up the onclick event handler, we just need to overwrite the function
videojs.SampleButton.prototype.handleClick = function( e ) {
    // Add specific click actions here.
    console.log('clicked');
};

videojs.SampleButton.prototype.createEl = function(type, properties, attributes) {
    return videojs.createEl('button', {}, {class: 'vjs_smallersub_button vjs-control'});
};

var pluginFn = function(options) {
    var SampleButton  = new videojs.SampleButton(this, options);
    this.addChild(SampleButton);

    return SampleButton;
};

});

// Custom Subtitles Button/Menu
videojs.registerPlugin('customSubtitles', function () {
    // Find subtitlesButton
    var subtitlesButton;

    controlBar.children().forEach(function (el) {
        if (el.name() === 'subtitlesButton') {
            subtitlesButton = el;
        }
    });

    var CustomTrackMenuItem = videojs.TextTrack.extend({

        /*@ Constructor */
        init: function (player, options) {
            options = options || {};
            // fake 'empty' track
            options['track'] = {
                kind: function () {
                    return 'subtitles';
                },
                player: player,
                label: function () {
                    return i18n.__('Custom...');
                },
                dflt: function () {
                    return false;
                },
                mode: function () {
                    return false;
                }
            };

            this.fileInput_ = $('<input type="file" accept=".vtt" style="display: none;">');
            $(this.el()).append(this.fileInput_);

            var that = this;

            App.vent.on('videojs:drop_sub', function () {
                var subname = Settings.droppedSub;
                var subpath = path.join(App.settings.tmpLocation, subname);
                win.info('Subtitles dropped:', subname);
                that.loadSubtitle(subpath);
            });

            this.fileInput_.on('change', function () {
                that.player_.play();
                if (this.value === '') {
                    return;
                }
                that.loadSubtitle(this.value);
                this.value = null; //reset
            });

            videojs.TextTrack.call(this, player, options);
        }
    });

    CustomTrackMenuItem.prototype.onClick = function () {
        this.player_.pause();
        this.fileInput_.trigger('click'); // redirect to fileInput click
    };

    CustomTrackMenuItem.prototype.loadSubtitle = function (filePath) {

        //clean tracks
        var tracks = this.player_.textTracks() || [];
        for (var i = 0; i < tracks.length; ++i) {
            if (tracks[i].id_.indexOf('vjs_subtitles_00') !== -1) {
                $(tracks[i].el()).remove();
                tracks.splice(i, 1);
                break;
            }
        }

        this.track = this.player_.addTextTrack('subtitles', i18n.__('Custom...'), '00', {
            src: filePath
        });
        App.vent.trigger('customSubtitles:added', filePath);
        videojs.TextTrackMenuItem.prototype.onClick.call(this); // redirect to TextTrackMenuItem.onClick
    };

    subtitlesButton.menu.addItem(new CustomTrackMenuItem(this));
    subtitlesButton.show(); // Always show subtitles button

});

/*! videojs-progressTips - v0.1.0 - 2013-09-16
 * https://github.com/mickey/videojs-progressTips
 * Copyright (c) 2013 Michael Bensoussan; Licensed MIT */

videojs.registerPlugin('progressTips', function (options) {
    var init;
    init = function () {
        var player;
        /*if (this.techName !== "Html5") {
		return;
		}*/
        player = this;
        $('.vjs-progress-control').prepend($('<div id="vjs-tip">  <div id="vjs-tip-arrow"></div>  <div id="vjs-tip-inner"></div>  </div>'));
        $('#vjs-tip').css('top', '-30px');
        $('.vjs-progress-control .vjs-slider').on('mousemove', function (event) {
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
                seconds = '0' + seconds;
            }
            if (hours > 0) {
                minutes = minutes % 60;
                if (minutes < 10) {
                    minutes = '0' + minutes;
                }
                time = '' + hours + ':' + minutes + ':' + seconds;
            } else {
                time = '' + minutes + ':' + seconds;
            }
            $('#vjs-tip-inner').html(time);
            $('#vjs-tip').css('left', '' + (event.pageX - $(this).offset().left - ($('#vjs-tip').outerWidth() / 2)) + 'px').css('visibility', 'visible');
            return;
        });
        $('.vjs-progress-control, .vjs-play-control').on('mouseout', function () {
            $('#vjs-tip').css('visibility', 'hidden');
        });
    };
    this.on('loadedmetadata', init);
});
