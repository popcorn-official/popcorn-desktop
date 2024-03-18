(function (App) {
    'use strict';

    var collection = App.Device.Collection;

    class AirplayXBMC extends App.Device.Loaders.Airplay {
        constructor(attrs) {
            super(Object.assign( {
                type: 'airplay-xbmc',
                typeFamily: 'external'
            }, attrs));
        }
        static makeID(baseID) {
            return 'airplay-xbmc' + baseID.replace(':', '');
        }
        initialize(attrs) {
            this.device = attrs.device;
            this.attributes.address = this.device.info[0];
        }

        static scan() {
            var browser = require('airplay-xbmc').createBrowser();
            browser.on('deviceOn', function (device) {
                collection.add(new AirplayXBMC({
                    device: device
                }));
            });

            browser.on('deviceOff', function (device) {
                var model = collection.get({
                    id: self.makeID(device.id)
                });
                if (model) {
                    model.destroy();
                }
            });

            browser.start();
        }
    }

    App.Device.Loaders.AirplayXBMC = AirplayXBMC;
})(window.App);
