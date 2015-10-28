(function(App) {
	'use strict';
	var querystring = require('querystring');
	var request = require('request');
	var Q = require('q');

	var Archive = function() {};

        var baseURL = 'https://archive.org/';
        var URL = baseURL + 'advancedsearch.php';
	Archive.prototype.constructor = Archive;

	var queryTorrents = function(filters) {
                var query = 'collection:moviesandfilms'; // OR mediatype:movies)';
                query    += ' AND -mediatype:collection';
                query    += ' AND format:"Archive BitTorrent"';
                query    += ' AND year'; // this is actually: has year
//                query    += ' AND avg_rating'; // this is actually: has year

                var sort = 'downloads';
                //var sort = 'avg_rating';

		var params = {
                        output: 'json',
		        rows : '50',
                        q: query
                };

		if (filters.keywords) {
			params.keywords = filters.keywords.replace(/\s/g, '% ');
		}

		if (filters.genre) {
			params.genre = filters.genre;
		}

                var order = 'desc';
		if(filters.order) {
			if(filters.order === 1) {
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

                return deferRequest (URL + '?sort[]=' + sort, params, true)
                        .then(function (data) {
                                return data.response.docs
                        })
                        .catch (function (err) {
	                        win.error('ARCHIVE.org error:', err);
                        })
        };

        var deferRequest = function (url, params, hasQuestionMark) {
                var d = Q.defer();

                if (params != undefined)  {
                        url += hasQuestionMark?'&':'?';
                        url += querystring.stringify (params);
                }

                console.log ('deferRequest', url, params, querystring.stringify(params));
		request({url: url, json: true}, function(error, response, data) {
			if(error) {
				d.reject(error);
			} else if(!data || (data.error && data.error !== 'No movies found')) {
				var err = data? data.error: 'No data returned';
				d.reject(err);
			} else {
				d.resolve(data || []);
			}
		});

                return d.promise
        }

        var queryDetails = function(id, movie) {

                var url = baseURL + 'details/' + movie.aid + '?output=json';
                win.info('Request to ARCHIVE.org API');
		win.debug(url);
                return deferRequest (url).then (function (data) {
                        return formatDetails(data, movie);
                })
                        .catch (function (err) {
                                win.error ('Archive.org error', err)
                        })
        }

        var paramsToQuery = function (params) {
                return _.map(params, function (v, k) {
                        return k + "=" + v
                }).join('&');
        }

        var queryOMDb = function (item) {
                var params = {
                        t: item.title,
                        r: 'json',
                        tomatoes: true
                }

                var url = 'http://www.omdbapi.com/'
                return deferRequest(url, params).then (function (data) {
                        data.archive = item
                        return data;
                })
        }

        var queryOMDbBulk = function (items) {
                console.error ('before details', items)
                var deferred = Q.defer();
	        var promises = _.map(items, function (item) {
                        return queryOMDb(item)
                                .then(formatOMDbforButter)
                });

                Q.all(promises).done(function (data) {
                        console.error ('queryOMDbbulk', data)
                        deferred.resolve ({hasMore: (data.length < 50),
                                           results: data});
                });

                return deferred.promise;
        };

        function exctractYear (movie) {
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


        var formatDetails = function (movie, old) {
		var id = movie.metadata.identifier[0];
                var metadata = movie.metadata;

                /* HACK (xaiki): archive.org, get your data straight !#$!
                 *
                 * We need all this because data doesn't come reliably tagged =/
                 */
                var mp4s = _.filter(movie.files, function (file, k) { 
                        return k.endsWith('.mp4');
                });

                var rating = 0;
                if (movie.hasOwnProperty('reviews')) {
                        rating = movie.reviews.info.avg_rating;
                }

                var url = 'http://' + movie.server + movie.dir;
                var turl = '/' + id + '_archive.torrent';
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
                old.health   = {}

                return old
	};

        var formatOMDbforButter = function (movie) {
		var id = movie.imdbID
                var metadata = movie.archive.metadata;
                var runtime = movie.Runtime
                var year = movie.Year;
                var rating = movie.imdbRating;

                movie.Quality = '480p'; // XXX

		return {
                        type:     'movie',
                        aid:      movie.archive.identifier,
			imdb:     id,
                        imdb_id:  id,
			title:    movie.Title,
                        genre:    [movie.Genre],
                        year: 	  year,
			rating:   rating,
                        runtime:  runtime,
			image:    undefined,
                        cover:    undefined,
                        images:  {
                                poster: undefined
                        },
                        synopsis: movie.Plot,
                        subtitle: {} // TODO
	        };
	};

        Archive.prototype.config = {
                uniqueId: 'imdb_id',
                tabName: 'Archive.org',
                type: 'movie',
                /* should be removed */
                //subtitle: 'ysubs',
                metadata: 'trakttv:movie-metadata'
        };

	Archive.prototype.extractIds = function(items) {
		return _.pluck(items.results, 'imdb');
	};

	Archive.prototype.fetch = function(filters) {
		return queryTorrents(filters)
			.then(queryOMDbBulk)
	};

        Archive.prototype.detail = function (torrent_id, old_data) {
                return queryDetails(torrent_id, old_data)
        };

	App.Providers.Archive = Archive;

})(window.App);
