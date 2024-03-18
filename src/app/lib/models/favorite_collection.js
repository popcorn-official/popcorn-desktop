(function (App) {
    'use strict';

    var FavoriteCollection = Backbone.Collection.extend({
        model: App.Model.Movie,

        initialize: function (models, options) {
            this.providers = {
                torrent: App.Providers.get('Favorites')
            };

            options = options || {};
            options.filter = options.filter || new App.Model.Filter();

            this.filter = _.defaults(_.clone(options.filter.attributes), {
                page: 1
            });
            this.hasMore = true;

            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },

        fetch: function () {
            var self = this;

            if (this.state === 'loading' && !this.hasMore) {
                return;
            }

            this.state = 'loading';
            self.trigger('loading', self);

            var torrent = this.providers.torrent;
            var torrentPromise = torrent.fetch(this.filter);

            return Promise.all([torrentPromise])
                .then(function (movies) {
                    movies = movies.flat();

                    // If a new request was started...
                    _.each(movies, function (movie) {
                        var id = movie.imdb_id;
                    });

                    if (_.isEmpty(movies)) {
                        self.hasMore = false;
                    }

                    self.add(movies);
                    self.trigger('sync', self);
                    self.state = 'loaded';
                    self.trigger('loaded', self, self.state);
                })
                .catch(function (err) {
                    self.state = 'error';
                    self.trigger('loaded', self, self.state);
                    win.error('FavoriteCollection.fetch()', err);
                });
        },

        fetchMore: function () {
            this.filter.page += 1;
            this.fetch();
        }

    });

    App.Model.FavoriteCollection = FavoriteCollection;
})(window.App);
