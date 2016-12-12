(function (App) {
    'use strict';

    /*
      Useful AirPlay protocol references:
      - "Unofficial AirPlay Protocol Specification" (https://nto.github.io/AirPlay.html)
      - @watson's "airplay-protocol" (https://github.com/watson/airplay-protocol)
    */
    var Bonjour = require('bonjour'), // cross-platform mDNS/Bonjour
        AirPlayProtocol = require('airplay-protocol'); // cross-platform AirPlay protocol

    var bonjourBrowser = new Bonjour(),
        collection = App.Device.Collection;

    var makeID = function (bonjourService) {
        // strong de-duplication ID since there can only be 1 bonjour service per host+port
        var uniqueDeviceId = bonjourService.host + '_' + bonjourService.port;
        return 'airplay-' + uniqueDeviceId;
    };

    var AirPlay = App.Device.Generic.extend({
        defaults: {
            type: 'airplay',
            typeFamily: 'external',
            ipFamily: 'IPv4'
        },

        _makeID: makeID,

        initialize: function (attrs) {
            this.device = attrs.device;
            this.attributes.id = this._makeID(this.device.service);
            this.attributes.name = this.device.service.name;
            /*
              this.device.service.host == The receiver's hostname in a way that makes sense
              on your local network. On a Mac it might be something like "AppleTV.local",
              and on Windows it might be something like "192.168.0.21".
             */
            this.attributes.address = this.device.service.host;
        },

        play: function (streamModel) {
            var self = this;
            var url = streamModel.get('src');
            console.info('AirPlay.play() streaming to "%s"', self.device.service.name);
            self.device.player.play(url, function (err, res, body) {
                if (err) {
                    console.error('AirPlay.play() error:', err);
                    // Tell the AirPlay device to stop whatever it's currently playing,
                    // and we'll also do resource cleanup (closing the reverse-http server).
                    self.stop();
                }
            });
        },

        pause: function () {
            var self = this;
            console.info('AirPlay.pause() streaming to "%s"', self.device.service.name);
            self.device.player.pause(function (err, res, body) {
                if (err) {
                    console.error('AirPlay.pause() error:', err);
                }
            });
        },

        unpause: function() {
            var self = this;
            console.info('AirPlay.unpause() streaming to "%s"', self.device.service.name);
            self.device.player.resume(function (err, res, body) {
                if (err) {
                    console.error('AirPlay.unpause() error:', err);
                }
            });
        },

        stop: function () {
            var self = this;
            console.info('AirPlay.stop() streaming to "%s"', self.device.service.name);
            // Tell the AirPlay device to quit all media playback.
            self.device.player.stop(function (err, res, body) {
                if (err) {
                    console.error('AirPlay.stop() error:', err);
                }
            });
            // Destroy the reverse-http server which was set up to receive AirPlay events
            // from the playback device. We no longer need that socket, since playback has
            // been stopped on the device, so we won't receive any more events on this port.
            // A NEW reverse-http server will be created if we call player.play() again.
            self.device.player.destroy();
        },

        _scrub: function(seconds) { // seconds = float; so 20.097000 is "scrub to ~20 seconds".
            var self = this;
            console.info('AirPlay._scrub() streaming to "%s"', self.device.service.name);
            self.device.player.scrub(seconds, function (err, res, body) {
                if (err) {
                    console.error('AirPlay._scrub() error:', err);
                }
            });
        }

        /*
          TODO: CONTRIBUTION NEEDED!!!

          Implement all of Butter Player's various "position scrubbing" functions, and just make
          all of them calculate their required position IN SECONDS and then simply call the
          internal "self._scrub(seconds)" function to send the command to the AirPlay device.
          The AirPlay protocol only supports seeking to absolute positions, expressed in seconds!
          There is no relative seeking in the AirPlay protocol, so you have to calculate that
          yourself!

          Examples:
            _scrub(0) == go to start of video
            _scrub(130.5) == go to 2 minutes and 10.5 seconds
         */
    });

    // start scanning for AirPlay services and their status changes
    console.info('Scanning: Local Network for AirPlay devices');
    var airplayBrowser = bonjourBrowser.find({ type: 'airplay' });

    // AirPlay service answered our search query or broadcasts going up
    airplayBrowser.on('up', function (service) {
        var model = collection.get({
            id: makeID(service)
        });
        if (!model) {
            // we don't already know about this host+port combo, so add it!
            console.info('Found AirPlay device: "%s" at "%s:%s"', service.name, service.host, service.port);
            var device = {
                service: service,
                player: new AirPlayProtocol(service.host, service.port)
            };

            collection.add(new AirPlay({
                device: device
            }));
        }
    });

    // AirPlay service broadcasts going down
    // this usually only happens when turning off AirPlay in the ATV settings
    airplayBrowser.on('down', function (service) {
        var model = collection.get({
            id: makeID(service)
        });
        if (model) {
            model.destroy();
        }
    });

    App.Device.AirPlay = AirPlay;
})(window.App);
