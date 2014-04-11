(function(App) {
    "use strict";

    var STREAM_PORT = 21584; // 'PT'!

    var readTorrent = require('read-torrent');
    var peerflix = require('peerflix');

    var engine = null;

    var onStreamReady = function() {
        console.log('Peerflix started');

        var streamInfo = new App.Model.StreamInfo({}, {
            engine: engine
        });
        App.vent.trigger('stream:ready', streamInfo);
    };

    var handleTorrent = function(torrent, stateModel) {
        engine = peerflix(torrent, {

        });

        engine.server.on('listening', onStreamReady);

        engine.on('ready', function() {
            engine.server.listen(STREAM_PORT);
        });
    };

    var Streamer = {
        start: function(torrentUrl) {
            var stateModel = new Backbone.Model({state: 'Connecting...'});
            App.vent.trigger('stream:started', stateModel);

            if(engine) {
                Streamer.stop();
            }

            if (/^magnet:/.test(torrentUrl)) {
                handleTorrent(torrentUrl, stateModel);
            } else {
                readTorrent(torrentUrl, function(err, torrent) {
                    if(err) {
                        App.vent.trigger('error', err);
                        App.vent.trigger('stream:stop');
                    } else {
                        handleTorrent(torrent, stateModel);
                    }
                });
            }
        },

        stop: function() {
            engine = null;
        }
    };

    App.vent.on('stream:start', Streamer.start);
    App.vent.on('stream:stop', Streamer.stop);

})(window.App);