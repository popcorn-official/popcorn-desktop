(function (App) {
    'use strict';
    var dlnacasts = require('dlnacasts')();
    var xmlb = require('xmlbuilder');
    var collection = App.Device.Collection;


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
            this.player = attrs.player;
            this.attributes.name = this.player.name;
            this.attributes.address = this.player.host;
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
                    .ele('dc:title', {}, streamModel.get('title'))
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
                    .ele('dc:title', {}, streamModel.get('title'))
                    .insertAfter('res', {
                        'protocolInfo': 'http-get:*:video/mp4:*',
                    }, url_video)
                    .insertAfter('upnp:class', {}, 'object.item.videoItem.movie')
                    .end({
                        pretty: false
                    });
            }
            this.player.play(url_video, {
                metadata: metadata,
                autoplay: true,

            }, function (err, result) {
                if (err) {
                    throw err;
                }

            });
            

        },

        stop: function () {
            this.player.stop();
        },

        pause: function () {
            this.player.pause();
        },

        forward: function () {
            this.player.seek(30);
        },

        backward: function () {
            this.player.seek(-30);
        },

        seek: function (seconds) {
            win.info('DLNA: seek %s', seconds);
            this.get('player').seek(seconds, function (err, status) {
                if (err) {
                    win.error('DLNA.seek:Error', err);
                }
            });
        },


        unpause: function () {
            this.player.play();
        }
    });


    dlnacasts.on('update', function (player) {
        if (collection.where({
                id: player.host
            }).length === 0) {
            win.info('Found DLNA Device: %s at %s', player.name, player.host);
            collection.add(new Dlna({
                id: player.host,
                player: player
            }));
        }
    });

    win.info('Scanning: Local Network for DLNA devices');
    dlnacasts.update();


    App.Device.Dlna = Dlna;
})(window.App);
