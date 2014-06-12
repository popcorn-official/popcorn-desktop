(function(App) {
	'use strict';

	var Q = require('q');

	var MovieCollection = Backbone.Collection.extend({
		model: App.Model.Movie,

		initialize: function(models, options) {
			this.providers = {
				torrent: new (App.Config.getProvider('movie'))(),
				subtitle: new (App.Config.getProvider('subtitle'))(),
				metadata: App.Trakt
			};

			options = options || {};
			options.filter = options.filter || new App.Model.Filter();

			this.filter = _.defaults(_.clone(options.filter.attributes), {page: 1});
			this.hasMore = true;

			Backbone.Collection.prototype.initialize.apply(this, arguments);
		},

		fetch: function() {
			var self = this;

			if(this.state === 'loading' && !this.hasMore) {
				return;
			}

			this.state = 'loading';
			self.trigger('loading', self);

			var subtitle = this.providers.subtitle;
			var metadata = this.providers.metadata;
			var torrent = this.providers.torrent;
			var torrentPromise = torrent.fetch(this.filter);
			var idsPromise = torrentPromise.then(_.bind(torrent.extractIds, torrent));
			var subtitlePromise = idsPromise.then(_.bind(subtitle.fetch, subtitle));
			var metadataPromise = idsPromise.then(_.bind(metadata.movie.listSummary, metadata));
			
			
			return Q.all([torrentPromise, subtitlePromise, metadataPromise])
				.spread(function(torrents, subtitles, metadatas) {
					// If a new request was started...
					_.each(torrents.movies, function(movie){
						var id = movie.imdb;
						var info = _.findWhere(metadatas, {imdb_id: id});
						movie.subtitle = subtitles[id];
						if(info) {
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
					});

					self.add(torrents.movies);
					self.hasMore = torrents.hasMore;
					self.trigger('sync', self);
					self.state = 'loaded';
					self.trigger('loaded', self, self.state);
				})
				.catch(function(err) {
					self.state = 'error';
					self.trigger('loaded', self, self.state);
					win.error(err.message, err.stack);
				});
		},

		fetchMore: function() {
			this.filter.page += 1;
			this.fetch();
		}
	});

	App.Model.MovieCollection = MovieCollection;
})(window.App);