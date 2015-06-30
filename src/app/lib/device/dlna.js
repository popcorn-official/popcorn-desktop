(function (App) {
    'use strict';
    var Browser = require('nodecast-js');
    var MediaRendererClient = require('upnp-mediarenderer-client');
    var xmlb = require('xmlbuilder');
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
            var url = streamModel.get('src');
            var url_video = url;
            var url_subtitle = 'http:' + url.split(':')[1] + ':9999/video.srt';
            var metadata = null;
            var subtitle = streamModel.get('subFile');
            if (subtitle) {
                metadata = xmlb.create('DIDL-Lite', {
                        'headless': true
                    })
                    .att({
                        'xmlns': 'urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/',
                        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
                        'xmlns:upnp': 'urn:schemas-upnp-org:metadata-1-0/upnp/',
                        'xmlns:dlna': 'urn:schemas-dlna-org:metadata-1-0/',
                        'xmlns:sec': 'http://www.sec.co.kr/',
                        'xmlns:xbmc': 'urn:schemas-xbmc-org:metadata-1-0/'
                    })
                    .ele('item', {
                        'id': '0',
                        'parentID': '-1',
                        'restricted': '1'
                    })
                    .ele('dc:title', {}, 'Popcorn Time Video')
                    .insertAfter('res', {
                        'protocolInfo': 'http-get:*:video/mp4:*',
                        'xmlns:pv': 'http://www.pv.com/pvns/',
                        'pv:subtitleFileUri': url_subtitle,
                        'pv:subtitleFileType': 'srt'
                    }, url_video)
                    .insertAfter('res', {
                        'protocolInfo': 'http-get:*:text/srt:'
                    }, url_subtitle)
                    .insertAfter('res', {
                        'protocolInfo': 'http-get:*:smi/caption'
                    }, url_subtitle)
                    .insertAfter('sec:CaptionInfoEx', {
                        'sec:type': 'srt'
                    }, url_subtitle)
                    .insertAfter('sec:CaptionInfo', {
                        'sec:type': 'srt'
                    }, url_subtitle)
                    .insertAfter('upnp:class', {}, 'object.item.videoItem.movie')
                    .end({
                        pretty: false
                    });
            } else {
                metadata = xmlb.create('DIDL-Lite', {
                        'headless': true
                    })
                    .att({
                        'xmlns': 'urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/',
                        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
                        'xmlns:upnp': 'urn:schemas-upnp-org:metadata-1-0/upnp/',
                        'xmlns:dlna': 'urn:schemas-dlna-org:metadata-1-0/',
                        'xmlns:sec': 'http://www.sec.co.kr/',
                        'xmlns:xbmc': 'urn:schemas-xbmc-org:metadata-1-0/'
                    })
                    .ele('item', {
                        'id': '0',
                        'parentID': '-1',
                        'restricted': '1'
                    })
                    .ele('dc:title', {}, 'Popcorn Time Video')
                    .insertAfter('res', {
                        'protocolInfo': 'http-get:*:video/mp4:*',
                    }, url_video)
                    .insertAfter('upnp:class', {}, 'object.item.videoItem.movie')
                    .end({
                        pretty: false
                    });
            }
            this.client.load(url_video, {
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
            win.error(err);
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
