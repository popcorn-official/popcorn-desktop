(function(App) {
    'use strict';

    var browser = require( 'airplay2' ).createBrowser();


    var Airplay = function () {
        this.selected = null;
        this.devices = {};

        browser.on( 'deviceOn', function( device ) {
            this.add(device);
            App.vent.trigger('airplay:add');
        });

        browser.on( 'deviceOff', function( device ) {
            this.rm(device);
            App.vent.trigger('airplay:rm');
        });

        browser.start();
    };

    Airplay.prototype.startAirplay =  function (streamModel) {
        if (! this.selected) {
            return false;
        }

        var src = streamModel.get(src);
        return this.selected.play(src[0].url);
    };

    Airplay.prototype.add =  function (device) {
        this.devices = [device.id] = device;
        this.selected = device;
    };

    Airplay.prototype.rm =  function (device) {
        delete this[device.id];
        this.devices[device.id] = undefined;
    };

    Airplay.prototype.has = function () {
        return (this.devices.length > 0);
    };

    App.vent.on('stream:start', Streamer.start);
    App.vent.on('stream:stop', Streamer.stop);
})(window.App);
