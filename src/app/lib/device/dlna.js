(function(App) {
    'use strict';
    var dlnacasts = require('dlnacasts2')();
    var collection = App.Device.Collection;


    class Dlna extends App.Device.Loaders.Device {
        constructor(attrs) {
            super(Object.assign({
                type: 'dlna',
                typeFamily: 'external'
            }, attrs));
        }

        makeID(baseID) {
                return 'dlna-' + baseID.replace('-', '');
        }

        initialize(attrs) {
            this.player = attrs.player;
            this.attributes.name = this.player.name;
            this.attributes.address = this.player.host;
        }

        play(streamModel) {
            var url = streamModel.get('src');
            var self = this;
            var media;
            var url_video = url;
            var url_subtitle = 'http:' + url.split(':')[1] + ':9999/data.srt';
            var metadata = null;
            var subtitle = streamModel.get('subFile');
            if (subtitle) {
                media = {
                    title: Common.normalize(streamModel.get('title')),
                    subtitles: [url_subtitle],
                };
            } else {
                media = {
                    title: Common.normalize(streamModel.get('title'))
                };
            }
            media.dlnaFeatures = 'DLNA.ORG_OP=01;DLNA.ORG_FLAGS=01100000000000000000000000000000';
            win.info('DLNA: play ' + url + ' on \'' + this.get('name') + '\'');
            win.info('DLNA: connecting to ' + this.player.host);

            self.player.play(url_video, media, function(err, status) {
                if (err) {
                    win.error('DLNA.play error: ', err);
                } else {
                    win.info('Playing ' + url + ' on ' + self.get('name'));
                    self.set('loadedMedia', status.media);
                }
            });
            this.player.on('status', function(status) {
                self._internalStatusUpdated(status);
            });
        }

        stop() {
            this.player.stop();
        }

        pause() {
            this.player.pause();
        }

        forward() {
            this.player.seek(30);
        }

        backward() {
            this.player.seek(-30);
        }

        seek(seconds) {
            this.get('player').seek(seconds, function(err, status) {
            });
        }
        seekTo(newCurrentTime) {
            this.get('player').seek(newCurrentTime, function(err, status) {
            });
        }

        seekPercentage(percentage) {
            var newCurrentTime = this.player._status.duration / 100 * percentage;
            this.seekTo(newCurrentTime.toFixed());
        }

        unpause() {
            this.player.play();
        }
        updateStatus() {
            var self = this;
            this.get('player').status(function(err, status) {
                if (err) {
                    return win.error('DLNA.updateStatus:Error', err);
                }
                self._internalStatusUpdated(status);
            });
        }

        _internalStatusUpdated(status) {
            if (status === undefined) {
                status = this.player._status;
            }
            // If this is the active device, propagate the status event.
            if (collection.selected.id === this.id) {
                App.vent.trigger('device:status', status);
            }
        }

        static scan() {
            dlnacasts.on('update', function(player) {
                if (collection.where({
                    id: player.host
                }).length === 0) {
                    win.info('Found DLNA Device: %s at %s', player.name, player.host);
                    collection.add(new Dlna({
                        id: player.host,
                        player: player
                    }));
                }
            });

            win.info('Scanning: Local Network for DLNA devices');
            dlnacasts.update();
        }
    }

    App.Device.Loaders.Dlna = Dlna;
})(window.App);
