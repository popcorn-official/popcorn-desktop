(function (App) {
    'use strict';

    var request = require('request'),
    inherits = require('util').inherits,
        _ = require('lodash'),
        Q = require('q'),
        querystring = require('querystring'),
        apiUrl = 'http://vodo.net/popcorn',
        Datastore = require('nedb'),
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
            var largeCover = movie.CoverImage;
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
                    image: largeCover,
                    backdrop: largeCover,
                    torrents: torrents,
                    synopsis: 'The film tells a story of a divorced couple trying to raise their young son. The story follows the boy for twelve years, from first grade at age 6 through 12th grade at age 17-18, and examines his relationship with his parents as he grows.',
                    tagline: '12 years in the making.',
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
        subtitle: 'ysubs',
        metadata: 'trakttv:movie-metadata'
    };

    Vodo.prototype.filters = {
        genres: [
            'All',
            'Action',
            'Adventure',
            'Animation',
            'Biography',
            'Comedy',
            'Crime',
            'Documentary',
            'Drama',
            'Family',
            'Fantasy',
            'Film-Noir',
            'History',
            'Horror',
            'Music',
            'Musical',
            'Mystery',
            'Romance',
            'Sci-Fi',
            'Short',
            'Sport',
            'Thriller',
            'War',
            'Western'
        ],
        sorters: [
            'popularity',
            'date',
            'year',
            'rating',
            'alphabet'
        ],
        types: []
    };

    Vodo.prototype.updateAPI = function () {
        var self = this;
        var defer = Q.defer();
        console.log('requesting', apiUrl);
        request({
                uri: apiUrl,
                strictSSL: false,
                json: true,
                timeout: 10000
            },
            function (err, res, data) {
                console.log('got data');
                    /*
                     data = _.map (helpers.formatForPopcorn(data), function (item) {
                     item.rating = item.rating.percentage * Math.log(item.rating.votes);
                     return item;
                     });
                     */
                db.insert(formatForPopcorn(data.downloads), function (err, newDocs) {
                    if (err) {
                        console.error('Error inserting', err);
                    }

                    console.log('db loaded', newDocs.length);
                    db.find({}).limit(2).exec(function (err, docs) {
                        console.log('FIND ---->', err, docs);
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

        console.log(findOpts, sortOpts);
        self.fetchPromise.then(function () {
            db.find(findOpts)
                .sort(sortOpts)
                .skip((filters.page - 1) * params.limit)
                .limit(Number(params.limit))
                .exec(function (err, docs) {
                    docs.forEach(function (entry) {
                        entry.type = 'movie';
                    });

                    console.error('returning', docs);
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
