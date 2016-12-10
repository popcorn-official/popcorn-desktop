(function (App) {
    'use strict';

    var getDataFromProvider = function (providers, collection) {
        var deferred = Q.defer();

        var torrentsPromise = providers.torrent.fetch(collection.filter);
        var idsPromise = torrentsPromise.then(_.bind(providers.torrent.extractIds, providers.torrent));
        var metadataPromise = providers.metadata ? idsPromise.then(function (ids) {
            return Q.allSettled(ids.map(id => (
                providers.metadata.getMetadata(id)
            )));
        }).catch(err => {
            console.error('Cannot fetch metadata (%s):', providers.torrent.name, err);
            return false;
        }) : false;

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

                return deferred.resolve({
                    torrents: torrents,
                    metadatas: metadataPromise
                });
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

        applyMetadatas(metadatas) {
            metadatas = metadatas.map(m => {
                if (!m || !m.value || !m.value.ids) {
                    return null;
                }

                var info = m.value,
                    id = info.ids.imdb;

                var model = this.findWhere({_id: id});
                if (!id || !model) {
                    return null;
                }

                return model.set({
                    synopsis: info.overview,
                    genres: info.genres,
                    certification: info.certification,
                    runtime: info.runtime,
                    tagline: info.tagline,
                    title: info.title,
                    trailer: info.trailer,
                    year: info.year,
                    backdrop: info.backdrop,
                    poster: info.poster
                });
            });
        },

        fetch: function () {
            try {
                var self = this;

                if (this.state === 'loading' && !this.hasMore) {
                    return;
                }

                this.state = 'loading';
                self.trigger('loading', self);

                var metadata = this.providers.metadata;
                var torrents = this.providers.torrents;

                var torrentPromises = _.map(torrents, function (torrentProvider) {
                    var providers = {
                        torrent: torrentProvider,
                        metadata: metadata
                    };

                    return getDataFromProvider(providers, self)
                        .then(function (data) {
                            self.add(data.torrents.results);
                            self.hasMore = true;
                            self.trigger('sync', self);

                            // apply metadata when it gets in
                            data.metadatas.then(self.applyMetadatas.bind(self));
                        })
                        .catch(function (err) {
                            console.error('provider error err', err);
                        });
                });

                // we can't use Promise.race because we don't want errors
                torrentPromises.forEach(p => p.then(torrents => {
                    self.state = 'loaded';
                    self.trigger('loaded', self, self.state);
                }));
            } catch (e) {
                console.error('cached error', e);
            }
        },

        fetchMore: function () {
            this.filter.page += 1;
            this.fetch();
        }
    });

    App.Model.Collection = PopCollection;
})(window.App);
