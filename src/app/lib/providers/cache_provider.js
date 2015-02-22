(function (App) {
	'use strict';

	var Q = require('q');

	var CacheProvider = function (table, ttl) {
		this.table = table;
		this.cache = new App.Cache(table);
		this.ttl = ttl;
	};

	// TODO: Duplicate cache entry
	CacheProvider.prototype.fetch = function (ids) {
		var self = this;
		ids = _.map(ids, function (id) {
			return id.toString();
		});
		var cachePromise = this.cache.getItems(ids);
		var queryPromise = cachePromise.then(function (items) {
				// Filter out cached subtitles
				var cachedIds = _.keys(items);
				win.debug(cachedIds.length + ' cached ' + self.table);
				var filteredId = _.difference(ids, cachedIds);
				return filteredId;
			})
			.then(this.query);

		// Cache ysubs subtitles
		queryPromise.then(function (items) {
			win.debug('Cache ' + _.keys(items).length + ' ' + self.table);
			self.cache.setItems(items, self.ttl);
		});

		// Wait for all query promise to finish
		return Q.allSettled([cachePromise, queryPromise])
			.then(function (results) {
				// Merge all promise result
				var items = {};
				_.each(results, function (result) {
					if (result.state === 'fulfilled') {
						_.extend(items, result.value);
					}
				});

				return items;
			});
	};

	App.Providers.CacheProvider = CacheProvider;
})(window.App);
