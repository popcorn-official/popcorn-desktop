(function(App) {
    'use strict';
    var dlnacasts = require('dlnacasts2')();
    var xmlb = require('xmlbuilder');
    var collection = App.Device.Collection;


    var makeID = function(baseID) {
        return 'dlna-' + baseID.replace('-', '');
    };

    var Dlna = App.Device.Generic.extend({
        defaults: {
            type: 'dlna',
            typeFamily: 'external'
        },
        makeID: makeID,

        initialize: function(attrs) {
            this.player = attrs.player;
            this.attributes.name = this.player.name;
            this.attributes.address = this.player.host;
        },

        play: function(streamModel) {
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
        },

        stop: function() {
            this.player.stop();
        },

        pause: function() {
            this.player.pause();
        },

        forward: function() {
            this.player.seek(30);
        },

        backward: function() {
            this.player.seek(-30);
        },

        seek: function(seconds) {
            win.info('DLNA: seek %s', seconds);
            this.get('player').seek(seconds, function(err, status) {
                if (err) {
                    win.error('DLNA.seek:Error', err);
                }
            });
        },
        seekTo: function(newCurrentTime) {
            win.info('DLNA: seek to %ss', newCurrentTime);
            this.get('player').seek(newCurrentTime, function(err, status) {
                if (err) {
                    win.error('DLNA.seek:Error', err);
                }
            });
        },

        seekPercentage: function(percentage) {
            win.info('DLNA: seek percentage %s%', percentage.toFixed(2));
            var newCurrentTime = this.player._status.duration / 100 * percentage;
            this.seekTo(newCurrentTime.toFixed());
        },

        unpause: function() {
            this.player.play();
        },
        updateStatus: function() {
            var self = this;
            this.get('player').status(function(err, status) {
                if (err) {
                    return win.info('DLNA.updateStatus:Error', err);
                }
                self._internalStatusUpdated(status);
            });
        },

        _internalStatusUpdated: function(status) {
            if (status === undefined) {
                status = this.player._status;
            }
            // If this is the active device, propagate the status event.
            if (collection.selected.id === this.id) {
                App.vent.trigger('device:status', status);
            }
        }
    });


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


    App.Device.Dlna = Dlna;
})(window.App);
