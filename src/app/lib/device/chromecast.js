(function (App) {
    'use strict';

    const ChromecastAPI = require('chromecast-api'),
          client = new ChromecastAPI(),
          collection = App.Device.Collection;

    class Chromecast extends App.Device.Loaders.Device {
        constructor(attrs) {
            super(Object.assign( {
                type: 'chromecast',
                typeFamily: 'external'
            }, attrs));
        }

        _makeID (baseID) {
            return 'chromecast-' + Common.md5(baseID);
        }

        initialize(attrs) {
            this.device = attrs.device;
            this.attributes.id = this._makeID(this.device.name);
            this.attributes.name = this.device.friendlyName;
            this.attributes.address = this.device.host;
            this.updatingSubtitles = false;
        }

        play(streamModel) {
            var self = this;

            var url = streamModel.get('src');
            this.attributes.url = url;
            const media = this.createMedia(streamModel);

            win.info('Chromecast: play ' + url + ' on \'' + this.get('name') + '\'');
            win.info('Chromecast: connecting to ' + this.device.host);

            self.device.play(media, function (err, status) {
                if (err) {
                    win.error('chromecast.play error: ', err);
                } else {
                    win.info('Playing ' + url + ' on ' + self.get('name'));
                    self.set('loadedMedia', status.media);
                }
            });
            this.device.on('status', function (status) {
                // If we got interrupted because we are updating subtitles, we don't want to close the streamer
                // There's currently no way to reload a media with the castv2 library without interrupting the current media
                if (status.idleReason === 'INTERRUPTED' && self.updatingSubtitles) {
                    self.updatingSubtitles = false;
                } else {
                    self._internalStatusUpdated(status);
                }
            });

            App.vent.on('videojs:drop_sub', function() {
                self.updatingSubtitles = true;
                var subname = Settings.droppedSub;
                var subpath = path.join(App.settings.tmpLocation, subname);
                win.info('Subtitles dropped on chromecast:', subpath);

                App.vent.trigger('stream:serve_subtitles', subpath);

                self.device.status(function (err, status) {
                    const media = self.createMedia(streamModel, true);

                    // After updating the subtitles, we come back to where we were before, minus a small buffer to make sure
                    // we didn't miss anything while switching the subtitles
                    media.seek = status.currentTime - 5.0;

                    self.device.play(url, media, function (err, status) {
                        if (err) {
                            win.error('chromecast.play error: ', err);
                        } else {
                            win.info('Playing ' + url + ' on ' + self.get('name'));
                            self.set('loadedMedia', status.media);
                        }
                    });
                });
            });
        }

        createMedia(streamModel, useLocalSubtitle) {

            var subtitle = streamModel.get('subtitle');
            var cover = streamModel.get('backdrop');
            var url = streamModel.get('src');
            var attr= streamModel.attributes;

            let media = {};

            if (subtitle || useLocalSubtitle) {
                media = {
                    url :  url,
                    cover: {
                      title: streamModel.get('title').substring(0,50),
                      url: cover
                    },
                    title: streamModel.get('title').substring(0,50),
                    subtitles: [{
                        url: 'http:' + url.split(':')[1] + ':9999/data.vtt',
                    }],

                    subtitles_style: {
                        backgroundColor: AdvSettings.get('subtitle_decoration') === 'Opaque Background' ? '#000000FF' : '#00000000', // color of background - see http://dev.w3.org/csswg/css-color/#hex-notation
                        foregroundColor: AdvSettings.get('subtitle_color') + 'ff', // color of text - see http://dev.w3.org/csswg/css-color/#hex-notation
                        edgeType: AdvSettings.get('subtitle_decoration') === 'Outline' ? 'OUTLINE' : 'NONE', // border of text - can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
                        edgeColor: '#000000FF', // color of border - see http://dev.w3.org/csswg/css-color/#hex-notation
                        fontScale: ((parseFloat(AdvSettings.get('subtitle_size')) / 28) * 1.3).toFixed(1), // size of the text - transforms into "font-size: " + (fontScale*100) +"%"
                        fontStyle: 'NORMAL', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
                        fontFamily: 'Helvetica',
                        fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
                        //windowColor: '#00000000', // see http://dev.w3.org/csswg/css-color/#hex-notation
                        //windowRoundedCornerRadius: 0, // radius in px
                        //windowType: 'NONE' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
                    }
                };
            } else {
                media = {
                    url: url,
                    cover: {
                      title: streamModel.get('title').substring(0,50),
                      url: cover
                  }
                };
            }

            return media;
        }

        pause() {
            this.get('device').pause(function () {});
        }

        stop() {
            App.vent.off('videojs:drop_sub');
            App.vent.trigger('stream:stop');
            App.vent.trigger('player:close');
            App.vent.trigger('torrentcache:stop');
            var device = this.get('device');
            // Also stops player and closes connection.
            device.stop(function () {
                device.removeAllListeners();
            });
            device.close(); //Back to ChromeCast home screen instead of black screen

            App.vent.trigger('stream:unserve_subtitles');
        }

        seekPercentage(percentage) {
            var newCurrentTime = this.get('loadedMedia').duration / 100 * percentage;
            this.get('device').seekTo(newCurrentTime);
        }

        forward() {
            this.get('device').seek(30);
        }

        backward() {
            this.get('device').seek(-30);
        }

        unpause() {
            this.get('device').resume(function () {});
        }

        updateStatus() {
            var self = this;
            client.on('status', function (status) {
                self._internalStatusUpdated(status);
            });
        }

        _internalStatusUpdated(status) {
            if (status.media === undefined) {
                status.media = this.get('loadedMedia');
            }
            // If this is the active device, propagate the status event.
            if (collection.selected.id === this.id) {

                App.vent.trigger('device:status', status);
            }
        }

        static scan() {
            win.info('Scanning: Local Network for Chromecast devices');
            client.update();
            client.on('device', function (player) {
                win.info('Found Chromecast Device: %s at %s', player.friendlyName, player.host);
                collection.add(new Chromecast({
                    device: player
                }));
            });
        }
    }

    App.Device.Loaders.Chromecast = Chromecast;
})(window.App);
