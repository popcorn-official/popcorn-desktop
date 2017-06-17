(function (App) {
    'use strict';

    var airplayer = require('airplayer'),
        list = airplayer(),
        netw = require('network-address'),
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
                throw err;
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
        win.info('Found A Device Device: %s at %s', player.name, player.host);
        collection.add(new Airplay({
            device: player
        }));
    });


    win.info('Scanning: Local Network for Airplay devices');
    App.Device.Airplay = Airplay;

})(window.App);
