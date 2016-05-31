(function (App) {
    'use strict';

    var chromecasts = require('chromecasts')(),
        collection = App.Device.Collection;

    var Chromecast = App.Device.Generic.extend({
        defaults: {
            type: 'chromecast',
            typeFamily: 'external'
        },

        _makeID: function (baseID) {
            return 'chromecast-' + Common.md5(baseID);
        },

        initialize: function (attrs) {
            this.device = attrs.device;
            this.attributes.id = this._makeID(this.device.name);
            this.attributes.name = this.device.name;
            this.attributes.address = this.device.host;
        },

        play: function (streamModel) {
            var self = this;
            var subtitle = streamModel.get('subFile');
            var cover = streamModel.get('cover');
            var url = streamModel.get('src');
            var attr= streamModel.attributes;
            this.attributes.url = url;
            var media;

            if (subtitle) {
                media = {
                    title: streamModel.get('title'),
                    images: streamModel.get('cover'),
                    subtitles: ['http:' + url.split(':')[1] + ':9999/subtitle.vtt'],

                    subtitles_style: {
                        backgroundColor: AdvSettings.get('subtitle_decoration') === 'Opaque Background' ? '#000000FF' : '#00000000', // color of background - see http://dev.w3.org/csswg/css-color/#hex-notation
                        foregroundColor: AdvSettings.get('subtitle_color') + 'ff', // color of text - see http://dev.w3.org/csswg/css-color/#hex-notation
                        edgeType: AdvSettings.get('subtitle_decoration') === 'Outline' ? 'OUTLINE' : 'NONE', // border of text - can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
                        edgeColor: '#000000FF', // color of border - see http://dev.w3.org/csswg/css-color/#hex-notation
                        fontScale: ((parseFloat(AdvSettings.get('subtitle_size')) / 28) * 1.3).toFixed(1), // size of the text - transforms into "font-size: " + (fontScale*100) +"%"
                        fontStyle: 'NORMAL', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
                        fontFamily: 'Helvetica',
                        fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
                        windowColor: '#00000000', // see http://dev.w3.org/csswg/css-color/#hex-notation
                        windowRoundedCornerRadius: 0, // radius in px
                        windowType: 'NONE' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
                    }
                };
            } else {
                media = {
                    images: cover,
                    title: streamModel.get('title')
                };
            }
            win.info('Chromecast: play ' + url + ' on \'' + this.get('name') + '\'');
            win.info('Chromecast: connecting to ' + this.device.host);

  				self.device.play(url, media, function (err, status) {
  					if (err) {
  						win.error('chromecast.play error: ', err);
  					} else {
  						win.info('Playing ' + url + ' on ' + self.get('name'));
  						self.set('loadedMedia', status.media);
  					}
  				});
  this.device.on('status', function (status) {
                self._internalStatusUpdated(status);
            });
        },

        pause: function () {
            this.get('device').pause(function () {});
        },

        stop: function () {
            win.info('Closing Chromecast Casting');
            App.vent.trigger('stream:stop');
            App.vent.trigger('player:close');
            App.vent.trigger('torrentcache:stop');
            var device = this.get('device');
            // Also stops player and closes connection.
            device.stop(function () {
                device.removeAllListeners();
                win.info('Chromecast: stopped. Listeners removed!');
            });
        },

        seek: function (seconds) {
            win.info('Chromecast: seek %s', seconds);
            this.get('device').seek(seconds, function (err, status) {
                if (err) {
                    win.error('Chromecast.seek:Error', err);
                }
            });
        },

        seekTo: function (newCurrentTime) {
            win.info('Chromecast: seek to %ss', newCurrentTime);
            this.get('device').seek(newCurrentTime, function (err, status) {
                if (err) {
                    win.error('Chromecast.seekTo:Error', err);
                }
            });
        },

        seekPercentage: function (percentage) {
            win.info('Chromecast: seek percentage %s%', percentage.toFixed(2));
            var newCurrentTime = this.get('loadedMedia').duration / 100 * percentage;
            this.seekTo(newCurrentTime.toFixed());
        },

        forward: function () {
            this.seek(30);
        },

        backward: function () {
            this.seek(-30);
        },

        unpause: function () {
            this.get('device').resume(function () {});
        },

        updateStatus: function () {
            var self = this;
            this.get('device').status(function (err, status) {
                if (err) {
                    return win.info('Chromecast.updateStatus:Error', err);
                }
                self._internalStatusUpdated(status);
            });
        },

        _internalStatusUpdated: function (status) {
            if (status.media === undefined) {
                status.media = this.get('loadedMedia');
            }
            // If this is the active device, propagate the status event.
            if (collection.selected.id === this.id) {
              console.log(status);
                App.vent.trigger('device:status', status);
            }
        }
    });

win.info('Scanning: Local Network for Chromecast devices');
chromecasts.update();
chromecasts.on('update', function (player) {
          collection.add(new Chromecast({
            device: player
        }));
    });

    App.Device.Chromecast = Chromecast;
})(window.App);
