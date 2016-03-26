(function (App) {
    'use strict';
    var Browser = require('nodecast-js');
    var MediaRendererClient = require('upnp-mediarenderer-client');
    var collection = App.Device.Collection;
    var browser = new Browser();

    var makeID = function (baseID) {
        return 'dlna-' + baseID.replace('-', '');
    };

    var Dlna = App.Device.Generic.extend({
        defaults: {
            type: 'dlna',
            typeFamily: 'external'
        },
        makeID: makeID,

        initialize: function (attrs) {
            this.device = attrs.device;
            this.client = new MediaRendererClient(this.device.xml);
            this.attributes.name = this.device.name;
            this.attributes.address = this.device.host;
        },

        play: function (streamModel) {
            var metadata = {
                title: 'Butter DLNA', // upnp-mediarendered-client object
                type: 'video',
                url: streamModel.get('src'),
                protocolInfo: 'http-get:*:video/mp4:*'
            };

            if (streamModel.get('subFile')) { // inject subtitles
                metadata.subtitlesUrl = 'http:' + metadata.url.split(':')[1] + ':9999/video.srt';
            }

            this.client.load(metadata.url, {
                metadata: metadata,
                autoplay: true,
            }, function (err, result) {
                if (err) {
                    throw err;
                }
            });
        },

        stop: function () {
            this.client.stop();
        },

        pause: function () {
            this.client.pause();
        },

        forward: function () {
            this.client.seek(30);
        },

        backward: function () {
            this.client.seek(-30);
        },

        unpause: function () {
            this.client.play();
        }
    });


    browser.onDevice(function (device) {
        device.onError(function (err) {
            win.error('DNLA device error', err);
        });

        if (collection.where({
                id: device.host
            }).length === 0) {
            win.info('Found DLNA Device: %s at %s', device.name, device.host);
            collection.add(new Dlna({
                id: device.host,
                device: device
            }));
        }
    });

    win.info('Scanning: Local Network for DLNA devices');
    browser.start();

    App.Device.Dlna = Dlna;
})(window.App);
