(function (App) {
    'use strict';
    var Q = require('q');
    var moment = require('moment');
    var deferRequest = require('defer-request');

    var TheMovieDB = function (args) {
        if (!args || !args.path) {
            return console.error ('The TMDB provider requires a path argument');
        }
        this.config.tabName += ' — args.path';
        this.URL = baseURL + args.path
    };

    var baseURL = 'https://localhost:8080/';
    TheMovieDB.prototype.constructor = TheMovieDB;

    TheMovieDB.prototype.config = {
        name: 'tmdb',
        uniqueId: 'imdb_id',
        tabName: 'TheMovieDB.org',
        type: 'movie',
        /* should be removed */
        //subtitle: 'ysubs',
        metadata: 'trakttv:movie-metadata'
    };

    function exctractYear(movie) {
        var metadata = movie.metadata;
        if (metadata.hasOwnProperty('year')) {
            return metadata.year[0];
        } else if (metadata.hasOwnProperty('date')) {
            return metadata.date[0];
        } else if (metadata.hasOwnProperty('addeddate')) {
            return metadata.addeddate[0];
        }

        return 'UNKNOWN';
    }

    function extractRating(movie) {
        if (movie.hasOwnProperty('reviews')) {
            return movie.reviews.info.avg_rating;
        }

        return 0;
    }

    function formatOMDbforButter(movie) {
        var id = movie.imdbID;
        var runtime = movie.Runtime;
        var year = movie.Year;
        var rating = movie.imdbRating;

        movie.Quality = '480p'; // XXX

        return {
            type: 'movie',
            aid: movie.tmdb.identifier,
            imdb: id,
            imdb_id: id,
            title: movie.Title,
            genre: [movie.Genre],
            year: year,
            rating: rating,
            runtime: runtime,
            image: undefined,
            cover: undefined,
            images: {
                poster: undefined
            },
            synopsis: movie.Plot,
            subtitle: {} // TODO
        };
    }

    function formatDetails(movie, old) {
        var id = movie.metadata.identifier[0];
        /* HACK (xaiki): tmdb.org, get your data straight !#$!
         *
         * We need all this because data doesn't come reliably tagged =/
         */
        var mp4s = _.filter(movie.files, function (file, k) {
            return k.endsWith('.mp4');
        });

        var url = 'http://' + movie.server + movie.dir;
        var turl = '/' + id + '_tmdb.torrent';
        var torrentInfo = movie.files[turl];

        // Calc torrent health
        var seeds = 0; //XXX movie.TorrentSeeds;
        var peers = 0; //XXX movie.TorrentPeers;
        movie.Quality = '480p'; // XXX

        var torrents = {};
        torrents[movie.Quality] = {
            url: url + turl,
            size: torrentInfo.size,
            seed: seeds,
            peer: peers
        };

        old.torrents = torrents;
        old.health = false;

        return old;
    }

    function formatTheMovieDBForButter(movie) {
        var id = movie.metadata.identifier[0];
        var metadata = movie.metadata;

        /* HACK (xaiki): tmdb.org, get your data straight !#$!
         *
         * We need all this because data doesn't come reliably tagged =/
         */
        var mp4s = _.filter(movie.files, function (file, k) {
            return k.endsWith('.mp4');
        });
        var runtime = Math.floor(
            moment.duration(Number(mp4s[0].length) * 1000).asMinutes()
        );

        console.log(runtime, movie);
        var year = exctractYear(movie);
        var rating = extractRating(movie);

        return formatDetails(movie, {
            type: 'movie',
            imdb: id,
            title: metadata.title[0],
            year: year,
            rating: rating,
            runtime: runtime,
            image: movie.misc.image,
            cover: movie.misc.image,
            images: {
                poster: movie.misc.image
            },
            synopsis: metadata.description,
            subtitle: {}
        });
    }

    var queryTorrents = function (URL, filters) {
        var self = this;
        var sort = 'downloads';

        console.log ('this url', URL)
        var params = {
            rows: '50',
        };

        if (filters.keywords) {
            params.keywords = filters.keywords.replace(/\s/g, '% ');
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        var order = 'desc';
        if (filters.order) {
            if (filters.order === 1) {
                order = 'asc';
            }
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            sort = filters.sorter;
        }

        sort += '+' + order;

        if (filters.page) {
            params.page = filters.page;
        }

        if (Settings.movies_quality !== 'all') { //XXX(xaiki): not supported
            params.quality = Settings.movies_quality;
        }

        console.error ('about to request', URL);
        return deferRequest(URL + '?sort[]=' + sort, params, true)
            .then(function (data) {
                return data.response.docs;
            })
            .catch(function (err) {
                win.error('TMDB.org error:', err);
            });
    };

    var queryDetails = function (id, movie) {
        id = movie.aid || id;
        var url = baseURL + 'details/' + id + '?output=json';
        win.info('Request to TMDB.org API');
        win.debug(url);
        return deferRequest(url).then(function (data) {
                return data;
            })
            .catch(function (err) {
                win.error('TheMovieDB.org error', err);
            });
    };

    var queryOMDb = function (item) {
        var params = {
            t: item.title.replace(/\s+\([0-9]+\)/, ''),
            r: 'json',
            tomatoes: true
        };

        var url = 'http://www.omdbapi.com/';
        return deferRequest(url, params).then(function (data) {
            if (data.Error) {
                throw new Error(data);
            }
            data.tmdb = item;
            return data;
        });
    };

    var queryOMDbBulk = function (items) {
        console.error('before details', items);
        var deferred = Q.defer();
        var promises = _.map(items, function (item) {
            return queryOMDb(item)
                .then(formatOMDbforButter)
                .catch(function (err) {
                    console.error('no data on OMDB, going back to tmdb', err, item);
                    return queryDetails(item.identifier, item)
                        .then(formatTheMovieDBForButter);
                });
        });

        Q.all(promises).done(function (data) {
            console.error('queryOMDbbulk', data);
            deferred.resolve({
                hasMore: (data.length < 50),
                results: data
            });
        });

        return deferred.promise;
    };

    TheMovieDB.prototype.extractIds = function (items) {
        return _.pluck(items.results, 'imdb');
    };

    TheMovieDB.prototype.fetch = function (filters) {
        console.log ('fetch from tmdb', this.URL)
        return queryTorrents(this.URL, filters)
            .then(queryOMDbBulk);
    };

    TheMovieDB.prototype.detail = function (torrent_id, old_data) {
        return queryDetails(torrent_id, old_data)
            .then(function (data) {
                return formatDetails(data, old_data);
            });
    };

    App.Providers.install(TheMovieDB);
})(window.App);
