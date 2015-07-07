(function (App) {
    'use strict';

    var browser = require('airplay-js').createBrowser(),
        collection = App.Device.Collection;

    var makeID = function (baseID) {
        return 'airplay-' + baseID.replace(':', '');
    };

    var Airplay = App.Device.Generic.extend({
        defaults: {
            type: 'airplay',
            typeFamily: 'external'
        },
        makeID: makeID,
        initialize: function (attrs) {
            this.device = attrs.device;
            this.attributes.id = this.makeID(this.device.serverInfo.macAddress || this.device.serverInfo.deviceId || '' + this.device.id);
            this.attributes.name = this.device.name || this.device.serverInfo.model;
            this.attributes.address = this.device.info[0];
        },
        play: function (streamModel) {
            var url = streamModel.attributes.src;
            this.device.play(url);
        },
        stop: function () {
            this.device.stop(function () {});
        }
    });


    browser.on('deviceOn', function (device) {

        collection.add(new Airplay({
            device: device
        }));
    });

    browser.on('deviceOff', function (device) {

        var model = collection.get({
            id: makeID(device.id)
        });
        if (model) {
            model.destroy();
        }
    });
    win.info('Scanning: Local Network for Airplay devices');
    browser.start();
    App.Device.Airplay = Airplay;

})(window.App);
