(function (App) {
	'use strict';

	var Q = require('q');

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
			var torrentPromises = _.map(torrents, function (torrentProvider, pid) { //XXX(xaiki): provider hack
				var deferred = Q.defer();

				var promises = [torrentProvider.fetch(self.filter)];

				var idsPromise = promises[0].then(_.bind(torrentProvider.extractIds, torrentProvider));

				if (subtitle) {
					promises.push(idsPromise.then(_.bind(subtitle.fetch, subtitle)));
				}
				if (metadata) {
					promises.push(idsPromise.then(_.bind(metadata.movie.listSummary, metadata)));
				}

				Q.all(promises)
					.spread(function (torrents, subtitles, metadatas) {
						// If a new request was started...
						_.each(torrents.results, function (movie) {
							var id = movie[self.popid];
							/* XXX(xaiki): check if we already have this
							 * torrent if we do merge our torrents with the
							 * ones we already have and update, we don't
							 * need to go through metadata, and we just lost
							 * a trakt call for nothing. this should really
							 * be handled in the YTS provider/API.
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
								var whash = {};
								whash[self.popid] = id;

								var info = _.findWhere(metadatas, whash);

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
										image: info.images.poster,
										backdrop: info.images.fanart
									});
								} else {
									win.warn('Unable to find %s on Trakt.tv', id);
								}
							}
						});

						return deferred.resolve(torrents);
					})
					.catch(function (err) {
						self.state = 'error';
						self.trigger('loaded', self, self.state);
						win.error(err.message, err.stack);
					});

				return deferred.promise;
			});

			Q.all(torrentPromises).done(function (torrents) {
				_.forEach(torrents, function (t) {
					self.add(t.results);
				});
				self.hasMore = _.pluck(torrents, 'hasMore')[0];
				self.trigger('sync', self);
				self.state = 'loaded';
				self.trigger('loaded', self, self.state);
			});
		},

		fetchMore: function () {
			this.filter.page += 1;
			this.fetch();
		}
	});

	App.Model.Collection = PopCollection;
})(window.App);
