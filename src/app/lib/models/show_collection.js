(function(App) {
    "use strict";

    var Q = require('q');

    var ShowCollection = Backbone.Collection.extend({
        model: App.Model.Movie,

        initialize: function(models, options) {
            this.providers = {
                torrent: new (App.Config.getProvider('tvshow'))(),
                subtitle: new (App.Config.getProvider('subtitle'))(),
                metadata: new (App.Config.getProvider('metadata'))()
            };

            options = options || {};
            this.hasMore = true;

            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },

        fetch: function() {
            var self = this;

            if(this.state == 'loading' && !this.hasMore) return;

            this.state = 'loading';
            self.trigger('loading', self);

            var subtitle = this.providers.subtitle;
            var torrent = this.providers.torrent;
            var torrentPromise = torrent.fetch();

            var idsPromise = torrentPromise.then(_.bind(torrent.extractIds, torrent));
            var subtitlePromise = idsPromise.then(_.bind(subtitle.fetch, subtitle));

            return Q.all([torrentPromise, subtitlePromise])
                .spread(function(movies, subtitles) {

                    // If a new request was started...
                    _.each(movies, function(movie){

                        var id = movie.imdb;
                        movie.subtitle = subtitles[id];

                    });

                    self.state = 'loaded';
                    self.add(movies);
                    self.trigger('sync', self);
                    self.trigger('loaded', self, self.state);

                    if(_.isEmpty(movies)) {
                        console.log('hasMore = false');
                        self.hasMore = false;
                    }
                })
                .catch(function(err) {
                    self.state = 'error';
                    self.trigger('loaded', self, self.state);
                    console.error(err, err.stack);
                });
        },

 

    });

    App.Model.ShowCollection = ShowCollection;
})(window.App);