(function(App) {
    'use strict';

    var inherits = require('utils').inherits;
    var chromecast = require('chromecast')();

    var Chromecast = function () {
        App.Device.Generic.call(this);
    };

    inherits(Chromecast, App.Device.Generic);

    Chromecast.prototype.initialize = function () {
        this.type = 'chromecast';

        chromecast.on('device', function( device ) {
            console.log('New chomecast device:', device);
            device = this.add(device);
        });

        chromecast.on( 'deviceOff', function( device ) {
            device = this.rm(device);
        });

        chromecast.discover();
    };

    App.Device.Chromecast = Chromecast;
})(window.App);
