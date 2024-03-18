(function (App) {
    'use strict';

    var airplayer = require('airplayer'),
        netw = require('network-address'),
        collection = App.Device.Collection;

    class Airplay extends App.Device.Loaders.Device {
        constructor(attrs) {
            super(Object.assign( {
                type: 'airplay',
                typeFamily: 'external'
            }, attrs));
        }
        makeID(baseID) {
            return 'airplay-' + baseID.replace('.', '');
        }
        initialize(attrs) {
            this.device = attrs.device;
            this.attributes.id = this.makeID(this.device.host);
            this.attributes.name = this.device.name || this.device.serverInfo.model;
            this.attributes.address = netw();
        }
        play(streamModel) {
            var url = streamModel.attributes.src;
            this.device.play(url, function (err, res) {
              if (err) {
                throw err;
              }
            });

        }
        stop() {
            this.device.destroy();
        }
        pause() {
            this.device.pause();
        }
        unpause() {
            this.device.resume();
        }

        static scan() {
            airplayer().on('update', function (player) {
                win.info('Found A Device Device: %s at %s', player.name, player.host);
                collection.add(new Airplay({
                    device: player
                }));
            });

            win.info('Scanning: Local Network for Airplay devices');
        }
    }

    App.Device.Loaders.Airplay = Airplay;

})(window.App);
