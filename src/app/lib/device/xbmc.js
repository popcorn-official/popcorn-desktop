(function (App) {
    'use strict';

    var browser = require('airplay-xbmc').createBrowser();

    var collection = App.Device.Collection;

    class AirplayXBMC extends App.Device.Airplay {
        constructor(attrs) {
            super(Object.assign( {
                type: 'airplay-xbmc',
                typeFamily: 'external'
            }, attrs));
        }
        makeID(baseID) {
            return 'airplay-xbmc' + baseID.replace(':', '');
        }
        initialize(attrs) {
            this.device = attrs.device;
            this.attributes.address = this.device.info[0];
        }
    }

    browser.on('deviceOn', function (device) {
        collection.add(new AirplayXBMC({
            device: device
        }));
    });

    browser.on('deviceOff', function (device) {
        var model = collection.get({
            id: this.makeID(device.id)
        });
        if (model) {
            model.destroy();
        }
    });

    browser.start();

    App.Device.AirplayXBMC = AirplayXBMC;
})(window.App);
