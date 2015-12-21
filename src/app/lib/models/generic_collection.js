(function (App) {
    'use strict';

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

            var subtitle = this.providers.subtitle;
            var metadata = this.providers.metadata;
            var torrents = this.providers.torrents;

            /* XXX(xaiki): provider hack
             *
             * we actually do this to 'save' the provider number,
             * this is shit, as we can't dynamically switch
             * providers, the 'right' way to do it is to have every
             * provider declare a unique id, and then lookthem up in
             * a hash.
             */
            function getDataFromProvider(torrentProvider) {
                var deferred = Q.defer();

                var torrentsPromise = torrentProvider.fetch(self.filter);
                var idsPromise = torrentsPromise.then(_.bind(torrentProvider.extractIds, torrentProvider));
                var promises = [
                    torrentsPromise,
                    subtitle ? idsPromise.then(_.bind(subtitle.fetch, subtitle)) : true,
                    metadata ? idsPromise.then(function (ids) {
                        return Q.allSettled(_.map(ids, function (id) {
                            return metadata.movies.summary(id);
                        }));
                    }) : true
                ];

                Q.all(promises)
                    .spread(function (torrents, subtitles, metadatas) {
                        // If a new request was started...
                        metadatas = _.map(metadatas, function (m) {
                            if (!m || !m.value) {
                                return {};
                            }

                            m = m.value;
                            m.id = m.ids.imdb;
                            return m;
                        });

                        _.each(torrents.results, function (movie) {
                            var id = movie[self.popid];
                            /* XXX(xaiki): check if we already have this
                             * torrent if we do merge our torrents with the
                             * ones we already have and update.
                             */
                            var model = self.get(id);
                            if (model) {
                                var ts = model.get('torrents');
                                _.extend(ts, movie.torrents);
                                model.set('torrents', ts);

                                return;
                            }
                            movie.provider = torrentProvider.name;

                            if (subtitles) {
                                movie.subtitle = subtitles[id];
                            }

                            if (metadatas) {
                                var info = _.findWhere(metadatas, {
                                    id: id
                                });

                                if (info) {
                                    _.extend(movie, {
                                        synopsis: info.overview,
                                        genres: info.genres,
                                        certification: info.certification,
                                        runtime: info.runtime,
                                        tagline: info.tagline,
                                        title: info.title,
                                        trailer: info.trailer,
                                        year: info.year,
                                        images: info.images
                                    });


                                    if (info.images.poster) {
                                        movie.image = info.images.poster;
                                        if (!movie.cover) {
                                            movie.cover = movie.image.full;
                                        }
                                    }

                                    if (info.images.fanart) {
                                        movie.backdrop = info.images.full;
                                    }
                                } else {
                                    win.warn('Unable to find %s on Trakt.tv', id);
                                }
                            }
                        });

                        return deferred.resolve(torrents);
                    })
                    .catch(function (err) {
                        self.state = 'error';
                        self.trigger('loaded', self, self.state);
                        win.error('PopCollection.fetch() : torrentPromises mapping', err);
                    });

                return deferred.promise;
            }

            var torrentPromises = _.map(torrents, function (torrentProvider) {
                return getDataFromProvider(torrentProvider)
                    .then(function (torrents) {
                        self.add(torrents.results);
                        self.hasMore = true;
                        self.trigger('sync', self);
                    })
                    .catch(function (err) {
                        console.error('provider error err', err);
                    });
            });

            Q.all(torrentPromises).done(function (torrents) {
                self.state = 'loaded';
                self.trigger('loaded', self, self.state);
            });
        },

        fetchMore: function () {
            this.filter.page += 1;
            this.fetch();
        }
    });

    App.Model.Collection = PopCollection;
})(window.App);
