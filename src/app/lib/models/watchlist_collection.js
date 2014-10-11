(function (App) {
	'use strict';

	var Q = require('q');

	var WatchlistCollection = App.Model.Collection.extend({
		model: App.Model.Movie,
		hasMore: false,

		getProviders: function () {
			return {
				torrents: [App.Providers.get('Watchlist')]
			};
		}

	});

	App.Model.WatchlistCollection = WatchlistCollection;
})(window.App);
