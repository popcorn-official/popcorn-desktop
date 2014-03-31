(function(App) {
    "use strict";

    var Q = require('q');

    var MovieCollection = Backbone.Collection.extend({
        model: App.Model.Movie,

        initialize: function() {
            this.providers = {
                torrent: new (App.Config.getProvider('torrent'))(),
                subtitle: new (App.Config.getProvider('subtitle'))(),
                metadata: new (App.Config.getProvider('metadata'))()
            };
        },

        fetch: function(filter) {
            var self = this;

            this.state = 'loading';
            self.trigger('loading', self);

            var subtitle = this.providers.subtitle;
            var metadata = this.providers.metadata;
            var torrent = this.providers.torrent;
            var torrentPromise = torrent.fetch(filter);
            var idsPromise = torrentPromise.then(_.bind(torrent.extractIds, torrent));
            var subtitlePromise = idsPromise.then(_.bind(subtitle.fetch, subtitle));
            var metadataPromise = idsPromise.then(_.bind(metadata.fetch, metadata));

            this.currentRequest = idsPromise;
            return Q.all([torrentPromise, subtitlePromise, metadataPromise])
                .spread(function(movies, subtitles, metadatas) {
                    // If a new request was started...
                    if(self.currentRequest !== idsPromise) return;

                    _.each(movies, function(movie){
                        var id = movie.imdb;
                        var info = metadatas[id];
                        movie.subtitle = subtitles[id];
                        _.extend(movie, _.pick(info, [
                            'image','bigImage','backdrop',
                            'synopsis','genres','certification','runtime',
                            'tagline','title','trailer','year'
                        ]));
                    });

                    self.state = 'loaded';
                    self.set(movies);
                    self.trigger('sync', self);
                    self.trigger('loaded', self, self.state);
                })
                .catch(function(err) {
                    self.state = 'error';
                    self.trigger('loaded', self, self.state);
                    console.error(err, err.stack);
                });
        }
    });

    App.Model.MovieCollection = MovieCollection;
})(window.App);