(function (App) {
    'use strict';

    var apiUrl = 'http://vodo.net/popcorn',
        db = new Datastore();

    function Vodo() {
        if (!(this instanceof Vodo)) {
            return new Vodo();
        }

        App.Providers.Generic.call(this);
    }
    inherits(Vodo, App.Providers.Generic);

    function formatForPopcorn(items) {
        var results = {};
        var movieFetch = {};
        movieFetch.results = [];
        movieFetch.hasMore = (Number(items.length) > 1 ? true : false);
        _.each(items, function (movie) {
            if (movie.Quality === '3D') {
                return;
            }
            var imdb = movie.ImdbCode;

            // Calc torrent health
            var seeds = 0; //XXX movie.TorrentSeeds;
            var peers = 0; //XXX movie.TorrentPeers;

            var torrents = {};
            torrents[movie.Quality] = {
                url: movie.TorrentUrl,
                size: movie.SizeByte,
                filesize: movie.Size,
                seed: seeds,
                peer: peers
            };

            var ptItem = results[imdb];
            if (!ptItem) {
                ptItem = {
                    imdb_id: imdb,
                    title: movie.MovieTitleClean.replace(/\([^)]*\)|1080p|DIRECTORS CUT|EXTENDED|UNRATED|3D|[()]/g, ''),
                    year: movie.MovieYear,
                    genre: [movie.Genre],
                    rating: movie.MovieRating,
                    image: movie.CoverImage,
                    cover: movie.CoverImage,
                    backdrop: movie.CoverImage,
                    torrents: torrents,
                    trailer: false,
                    synopsis: movie.Synopsis,
                    type: 'movie'
                };

                movieFetch.results.push(ptItem);
            } else {
                _.extend(ptItem.torrents, torrents);
            }

            results[imdb] = ptItem;
        });

        return movieFetch.results;
    }

    Vodo.prototype.extractIds = function (items) {
        return _.pluck(items.results, 'imdb_id');
    };

    Vodo.prototype.config = {
        uniqueId: 'imdb_id',
        tabName: 'Vodo',
        type: 'movie',
        /* should be removed */
        //subtitle: 'ysubs',
        metadata: 'trakttv:movie-metadata'
    };

    Vodo.prototype.updateAPI = function () {
        var self = this;
        var defer = Q.defer();
        win.info('Request to Vodo', apiUrl);
        request({
                uri: apiUrl,
                strictSSL: false,
                json: true,
                timeout: 10000
            },
            function (err, res, data) {
                /*
                 data = _.map (helpers.formatForPopcorn(data), function (item) {
                 item.rating = item.rating.percentage * Math.log(item.rating.votes);
                 return item;
                 });
                 */
                db.insert(formatForPopcorn(data.downloads), function (err, newDocs) {
                    if (err) {
                        win.error('Vodo.updateAPI(): Error inserting', err);
                    }

                    db.find({}).limit(2).exec(function (err, docs) {
                        //win.debug('FIND ---->', err, docs);
                    });
                    defer.resolve(newDocs);
                });
            });

        return defer.promise;
    };

    Vodo.prototype.fetch = function (filters) {
        var self = this;
        if (!self.fetchPromise) {
            self.fetchPromise = this.updateAPI();
        }

        var defer = Q.defer();
        var params = {
            sort: 'rating',
            limit: 50
        };
        var findOpts = {};

        if (filters.keywords) {
            findOpts = {
                title: new RegExp(filters.keywords.replace(/\s/g, '\\s+'))
            };
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        if (filters.order) {
            params.order = filters.order;
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            params.sort = filters.sorter;
        }

        var sortOpts = {};
        sortOpts[params.sort] = params.order;

        self.fetchPromise.then(function () {
            db.find(findOpts)
                .sort(sortOpts)
                .skip((filters.page - 1) * params.limit)
                .limit(Number(params.limit))
                .exec(function (err, docs) {
                    docs.forEach(function (entry) {
                        entry.type = 'movie';
                    });

                    return defer.resolve({
                        results: docs,
                        hasMore: docs.length ? true : false
                    });
                });
        });

        return defer.promise;
    };

    Vodo.prototype.detail = function (torrent_id, old_data) {
        return Q(old_data);
    };

    App.Providers.Vodo = Vodo;
})(window.App);
