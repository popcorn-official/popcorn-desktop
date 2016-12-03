(function (App) {
    'use strict';

    var airplayer = require('airplayer'),
        netw = require('network-address'),
        list = airplayer(),
        collection = App.Device.Collection;

    var makeID = function (baseID) {
        return 'airplay-' + baseID.replace('.', '');
    };

    var Airplay = App.Device.Generic.extend({
        defaults: {
            type: 'airplay',
            typeFamily: 'external'
        },
        makeID: makeID,
        initialize: function (attrs) {
            this.device = attrs.device;
            this.attributes.id = this.makeID(this.device.host);
            this.attributes.name = this.device.name || this.device.serverInfo.model;
            this.attributes.address = netw();
        },
        play: function (streamModel) {
            var url = streamModel.attributes.src;
            this.device.play(url, function (err, res) {
                if (err) {
                    console.error('Airplay.play() error:', err);
                }
            });
        },
        stop: function () {
            this.device.destroy();
        },
        pause: function () {
            this.device.pause();
        },
        unpause: function () {
            this.device.resume();
        }
    });


    list.on('update', function (player) {
        console.info('Found Apple TV Device Device: %s at %s', player.name, player.host);
        collection.add(new Airplay({
            device: player
        }));
    });


    console.info('Scanning: Local Network for Airplay devices');
    App.Device.Airplay = Airplay;

})(window.App);
