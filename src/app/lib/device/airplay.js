(function(App) {
    'use strict';

    var inherits = require('util').inherits;
    var browser = require( 'airplay-js' ).createBrowser();

    var Airplay = function () {
        App.Device.Generic.call(this);
    };

    inherits(Airplay, App.Device.Generic);

    Airplay.prototype.initialize = function () {
        browser.on( 'deviceOn', function( device ) {
            this.add(device);
        });

        browser.on( 'deviceOff', function( device ) {
            this.rm(device);
        });

        browser.start();
    };

    Airplay.prototype.play = function (device, url) {
        return device.play(url);
    };

    App.Device.Airplay = new Airplay();
})(window.App);
