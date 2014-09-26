(function (App) {
	'use strict';
	var Q = require('q');

	var Watchlist = function () {};
	Watchlist.prototype.constructor = Watchlist;

	var queryTorrents = function (filters) {
		var deferred = Q.defer();

		/*App.db.getBookmarks(filters, function (err, data) {
			deferred.resolve(data || []);
		});*/
		App.Trakt.show.getProgress().then(function (data) {
			deferred.resolve(data || []);
		})
		.catch(function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
	};

	var formatForPopcorn = function (items) {
		var showList = [];

		var provider = App.Providers.get('Eztv');
		items.forEach(function (show) {
			//If has no next episode or next episode is not aired, go to next one
			if (! show.next_episode || (Math.round(new Date().getTime()/ 1000) < show.next_episode.first_aired)) {
				return;
			}

			var deferred = Q.defer();
			//Try to find it on the Favourites database and attach the next_episode info
			Database.getTVShowByImdb(show.show.imdb_id, function (err, data) {
				if (data != null) {
					data.type = 'bookmarkedshow';
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
					var data = provider.detail(show.show.imdb_id,
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
		return Q.all(showList);
	};

	Watchlist.prototype.extractIds = function (items) {
		return _.pluck(items, 'imdb_id');
	};

	Watchlist.prototype.fetch = function (filters) {
		return queryTorrents(filters)
		.then(formatForPopcorn);
	};

	App.Providers.Watchlist = Watchlist;

})(window.App);
