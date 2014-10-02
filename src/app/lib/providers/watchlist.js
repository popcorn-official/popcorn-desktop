/* globals moment*/
(function (App) {
	'use strict';
	var Q = require('q');
	var Eztv = App.Providers.get('Eztv');
	
	var Watchlist = function () {};
	Watchlist.prototype.constructor = Watchlist;

	var queryTorrents = function (filters) {
		var deferred = Q.defer();
		var now = moment();
		
		//Checked when last fetched
		App.db.getSetting({
			key: 'watchlist-fetched'
		}, function(err, doc) {
			if (doc) {
				var d = moment.unix(doc.value);
				
				if (Math.abs(now.diff(d, 'days')) >= 1) {
					//Last fetched more than 1 day
					App.db.writeSetting({
						key: 'watchlist-fetched',
						value: now.unix()
					});
					fetchWatchlist(true);
				} else {
					//Last fetch is fresh
					fetchWatchlist(false);
				}
			} else {
				//No last fetch, fetch again
				App.db.writeSetting({
					key: 'watchlist-fetched',
					value: now.unix()
				}, function () {
					fetchWatchlist(true);
				});
			}	
		});
		
		function fetchWatchlist(update) {
			App.db.getSetting({
				key: 'watchlist'
			}, function (err, doc) {
				if (doc && !update) {
					//Returned cached watchlist
					deferred.resolve(doc.value || []);
				} else {
					//Fetch new watchlist
					App.Trakt.show.getProgress().then(function (data) {
						//If data returned is not a valid json, return an empty list
						try {
							JSON.parse(data);
							App.db.writeSetting({
								key: 'watchlist',
								value: data
							}, function () {
								deferred.resolve(data || []);
							});
						} catch (e) {
							//throw Error({message: 'Can\'t get a proper response from Trakt', stack:e.stack});
							deferred.resolve([]);
						}
					})
					.catch(function(error) {
						deferred.reject(error);
					});
				}
			});
		}

		return deferred.promise;
	};

	var formatForPopcorn = function (items) {
		var showList = [];

		items.forEach(function (show) {
			//If has no next episode or next episode is not aired, go to next one
			if (! show.next_episode || (Math.round(new Date().getTime()/ 1000) < show.next_episode.first_aired)) {
				return;
			}

			var deferred = Q.defer();
			//Try to find it on the Favourites database and attach the next_episode info
			Database.getTVShowByImdb(show.show.imdb_id, function (err, data) {
				if (data != null) {
					data.type = 'show';
					data.image = data.images.poster;
					data.imdb = data.imdb_id;
					data.next_episode = show.next_episode;
					// Fallback for old bookmarks without provider in database
					if (typeof (data.provider) === 'undefined') {
						data.provider = 'Eztv';
					}
					deferred.resolve(data);
				} else {
					//If not found, then get the details from Eztv and add it to the DB
					data = Eztv.detail(show.show.imdb_id,
						show,
						function (err, data) {
							if (!err) {
								data.provider = 'Eztv';
								data.type = 'show';
								data.next_episode = show.next_episode;

								Database.addTVShow(data, function (err, idata) {
									Database.addBookmark(show.show.imdb_id, 'tvshow', function (err, saveddata) {
										data.bookmarked = true;
										App.userBookmarks.push(data.imdb_id);
										deferred.resolve(data);
									});
								});
							} else {
								deferred.reject(err);
							}
					});
				}
			});

			showList.push(deferred.promise);
		});
		return Q.all(showList).then(function(res) { return { results: res, hasMore: false }; });
	};

	Watchlist.prototype.extractIds = function (items) {
		return _.pluck(items, 'imdb_id');
	};

	Watchlist.prototype.fetch = function (filters) {
		return queryTorrents(filters)
		.then(formatForPopcorn);
	};
	
	Watchlist.prototype.detail = function (torrent_id, old_data, callback) {
		return Eztv.detail(torrent_id, old_data, callback);
	};

	App.Providers.Watchlist = Watchlist;

})(window.App);
