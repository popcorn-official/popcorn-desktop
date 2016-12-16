(function (App) {
    'use strict';

    var getDataFromProvider = function (providers, collection) {
        var deferred = Q.defer();

        var torrentsPromise = providers.torrent.fetch(collection.filter);

        torrentsPromise
            .then(function (torrents) {
                // If a new request was started...
                _.each(torrents.results, function (movie) {
                    var id = movie[collection.popid];
                    /* XXX(xaiki): check if we already have this
                     * torrent if we do merge our torrents with the
                     * ones we already have and update.
                     */
                    var model = collection.get(id);
                    if (model) {
                        var ts = model.get('torrents');
                        _.extend(ts, movie.torrents);
                        model.set('torrents', ts);

                        return;
                    }

                    movie.providers = providers;
                });

                return deferred.resolve(torrents);
            })
            .catch(function (err) {
                collection.state = 'error';
                collection.trigger('loaded', collection, collection.state);
                console.error('PopCollection.fetch() : torrentPromises mapping', err);
            });

        return deferred.promise;
    };

    var PopCollection = Backbone.Collection.extend({
        popid: 'imdb_id',
        initialize: function (models, options) {
            this.providers = this.getProviders();

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

            var metadata = this.providers.metadata;
            var torrents = this.providers.torrents;

            var torrentPromises = torrents.filter(torrentProvider => (
                !torrentProvider.loading
            )).map((torrentProvider) => {
                var providers = {
                    torrent: torrentProvider,
                    metadata: metadata
                };

                torrentProvider.loading = true;
                return getDataFromProvider(providers, self)
                    .then(function (torrents) {
                        // set state, can't fail
                        torrentProvider.loading = false;

                        self.add(torrents.results);
                        self.hasMore = true;

                        // set state, can't fail
                        self.trigger('sync', self);
                        self.state = 'loaded';
                        self.trigger('loaded', self, self.state);
                    })
                    .catch(function (err) {
                        console.error('provider error err', err);
                    });
            });
        },

        fetchMore: function () {
            this.filter.page += 1;
            this.fetch();
        }
    });

    App.Model.Collection = PopCollection;
})(window.App);
