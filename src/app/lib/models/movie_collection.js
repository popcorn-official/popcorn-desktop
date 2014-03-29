(function(App) {
    "use strict";

    var Q = require('q');

    var MovieCollection = Backbone.Collection.extend({

        initialize: function() {
            this.providers = {
                torrent: new (App.Config.getProvider('torrent'))(),
                subtitle: new (App.Config.getProvider('subtitle'))(),
                metadata: new (App.Config.getProvider('metadata'))()
            };
        },

        // TODO: Consolidate data
        fetch: function(filter) {
            var subtitle = this.providers.subtitle;
            var metadata = this.providers.metadata;
            var torrent = this.providers.torrent;
            var torrentPromise = torrent.fetch(filter);
            var idsPromise = torrentPromise.then(_.bind(torrent.extractIds, torrent));
            var subtitlePromise = idsPromise.then(_.bind(subtitle.fetch, subtitle));
            var metadataPromise = idsPromise.then(_.bind(metadata.fetch, metadata));

            return Q.all([torrentPromise, subtitlePromise, metadataPromise])
                .spread(function(torrents, subtitles, metadatas) {
                    console.log('Movies data: ', torrents, subtitles, metadatas);
                });
        }
    });

    App.Model.MovieCollection = MovieCollection;
})(window.App);