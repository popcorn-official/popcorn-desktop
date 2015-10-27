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
		var deferred = Q.defer();

                var query = 'collection:moviesandfilms'; // OR mediatype:movies)';
                query    += ' AND -mediatype:collection';
                query    += ' AND format:"Archive BitTorrent"';
                query    += ' AND year'; // this is actually: has year
//                query    += ' AND avg_rating'; // this is actually: has year

                var sort = 'downloads';

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

                var url = URL + '?sort[]=' + sort + '&' +  querystring.stringify(params);
                win.info('Request to ARCHIVE.org API');
		win.debug(url);

 		request({url: url, json: true}, function(error, response, data) {
			if(error) {
				deferred.reject(error);
			} else if(!data || (data.error && data.error !== 'No movies found')) {
				var err = data? data.error: 'No data returned';
				win.error('ARCHIVE.org error:', err);
				deferred.reject(err);
			} else {
				deferred.resolve(data.response.docs || []);
			}
		});

		return deferred.promise;
        };

        var queryDetails = function (items) {
                var deferred = Q.defer();
	        var promises = _.map(items, function(movie) {
                        var d = Q.defer();

                        var url = baseURL + 'details/' + movie.identifier + '?output=json';
                        win.info('Request to ARCHIVE.org API');
		        win.debug(url);

		        request({url: url, json: true}, function(error, response, data) {
			        if(error) {
				        d.reject(error);
			        } else if(!data || (data.error && data.error !== 'No movies found')) {
				        var err = data? data.error: 'No data returned';
				        win.error('ARCHIVE.org error:', err);
				d.reject(err);
			        } else {
				        d.resolve(formatForPopcorn(data || []));
			        }
		        });

		        return d.promise;
                });

                Q.all(promises).done(function (data) {
                        deferred.resolve ({hasMore: (data.length < 50),
                                           results: data});
                });

                return deferred.promise;
        };

        var formatForPopcorn = function (movie) {
		var id = movie.metadata.identifier[0];
                var metadata = movie.metadata;
                
                /* HACK (xaiki): archive.org, get your data straight !#$!
                 *
                 * We need all this because data doesn't come reliably tagged =/
                 */
                var mp4s = _.filter(movie.files, function (file, k) { 
                        return k.endsWith('.mp4');
                });
                var runtime = Math.floor(moment.duration(Number(mp4s[0].length)*1000).asMinutes());

                console.log (runtime, movie);
                var year;

                if (metadata.hasOwnProperty('year')) {
                        year = metadata.year[0];
                } else if (metadata.hasOwnProperty('date')) {
                        year = metadata.date[0];
                } else if (metadata.hasOwnProperty('addeddate')) {
                        year = metadata.addeddate[0];
                } else {
                        year = 'UNKNOWN';
                }

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


		return {
			imdb:     id,
			title:    metadata.title[0],
                        year: 	  year,
			rating:   rating,
                        runtime:  runtime,
			image:    movie.misc.image,
			torrents: torrents,
                        synopsis: metadata.description
		};
	};

	Archive.prototype.extractIds = function(items) {
		return _.pluck(items.results, 'imdb');
	};

	Archive.prototype.fetch = function(filters) {
		return queryTorrents(filters)
			.then(queryDetails);
	};

	App.Providers.Archive = Archive;

})(window.App);
