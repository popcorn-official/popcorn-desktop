(function (App) {
    'use strict';

    var getDataFromProvider = function (torrentProvider, subtitle, metadata, self) {
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

        console.log('pre all', promises);

        Q.all(promises)
            .spread(function (torrents, subtitles, metadatas) {

                console.log('post all', torrents, subtitles, metadatas);

                // If a new request was started...
                metadatas = _.map(metadatas, function (m) {
                    if (!m || !m.value || !m.value.ids) {
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
                            win.warn('Unable to find %s (%s) on Trakt.tv', id, movie.title);
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
            try {
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
                console.log('pre---', subtitle, metadata, torrents);

                var torrentPromises = _.map(torrents, function (torrentProvider) {
                    return getDataFromProvider(torrentProvider, subtitle, metadata, self)
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
