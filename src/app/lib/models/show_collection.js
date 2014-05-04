(function(App) {
    "use strict";

    var Q = require('q');

    var ShowCollection = Backbone.Collection.extend({
        model: App.Model.Movie,

        initialize: function(models, options) {
            this.providers = {
                torrent: new (App.Providers['Tvshows'])(),
                subtitle: new (App.Config.getProvider('subtitle'))(),
                metadata: new (App.Config.getProvider('metadata'))()
            };

            options = options || {};
            options.filter = options.filter || new App.Model.Filter();

            this.filter = _.defaults(_.clone(options.filter.attributes), {page: 1});
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
            var torrentPromise = torrent.fetch(this.filter);

            var idsPromise = torrentPromise.then(_.bind(torrent.extractIds, torrent));
            var subtitlePromise = idsPromise.then(_.bind(subtitle.fetch, subtitle));

            return Q.all([torrentPromise, subtitlePromise])
                .spread(function(movies, subtitles) {

                    // If a new request was started...
                    _.each(movies, function(movie){

                        var id = movie.imdb;
                        movie.subtitle = subtitles[id];

                    });

                    if(_.isEmpty(movies)) {
                        console.log('hasMore = false');
                        self.hasMore = false;
                    }

                    self.add(movies);
                    self.trigger('sync', self);
                    self.state = 'loaded';
                    self.trigger('loaded', self, self.state);
                })
                .catch(function(err) {
                    self.state = 'error';
                    self.trigger('loaded', self, self.state);
                    console.error(err, err.stack);
                });
        },

         fetchMore: function() {
            console.log('fetchMore');
            this.filter.page += 1;
            this.fetch();
        }

    });

    App.Model.ShowCollection = ShowCollection;
})(window.App);