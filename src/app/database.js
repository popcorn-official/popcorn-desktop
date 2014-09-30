var
	async = require('async'),
	request = require('request'),
	zlib = require('zlib'),
	Datastore = require('nedb'),
	path = require('path'),
	openSRT = require('opensrt_js'),

	db = {},
	data_path = require('nw.gui').App.dataPath,
	TTL = 1000 * 60 * 60 * 24;

console.time('App startup time');
console.debug('Database path: ' + data_path);

process.env.TZ = 'America/New_York'; // set same api tz

db.bookmarks = new Datastore({
	filename: path.join(data_path, 'data/bookmarks.db'),
	autoload: true
});
db.settings = new Datastore({
	filename: path.join(data_path, 'data/settings.db'),
	autoload: true
});
db.tvshows = new Datastore({
	filename: path.join(data_path, 'data/shows.db'),
	autoload: true
});
db.movies = new Datastore({
	filename: path.join(data_path, 'data/movies.db'),
	autoload: true
});
db.watched = new Datastore({
	filename: path.join(data_path, 'data/watched.db'),
	autoload: true
});

// Create unique indexes for the various id's for shows and movies
db.tvshows.ensureIndex({
	fieldName: 'imdb_id',
	unique: true
});
db.tvshows.ensureIndex({
	fieldName: 'tvdb_id',
	unique: true
});
db.movies.ensureIndex({
	fieldName: 'imdb_id',
	unique: true
});
db.movies.removeIndex('imdb_id');
db.movies.removeIndex('tmdb_id');
db.bookmarks.ensureIndex({
	fieldName: 'imdb_id',
	unique: true
});

// settings key uniqueness
db.settings.ensureIndex({
	fieldName: 'key',
	unique: true
});

var extractIds = function (items) {
	return _.pluck(items, 'imdb_id');
};

var extractMovieIds = function (items) {
	return _.pluck(items, 'movie_id');
};

// This generically turns single argument callback functions into promises
var promisify = function (obj, func, arg) {
	return new Promise(function (resolve, reject) {

		obj[func].call(obj, arg, function (error, result) {
			if (error) {
				return reject(error);
			} else {
				return resolve(result);
			}
		});

	});
};

// This utilizes the exec function on nedb to turn function calls into promises
var promisifyDb = function (obj) {
	return new Promise(function (resolve, reject) {
		obj.exec(function (error, result) {
			if (error) {
				return reject(error);
			} else {
				return resolve(result);
			}
		});
	});
};

var Database = {
	addMovie: function (data) {
		return promisifyDb(db.movies.insert(data));
	},

	deleteMovie: function (imdb_id) {
		return promisifyDb(db.movies.remove({
			imdb_id: imdb_id
		}));
	},

	getMovie: function (imdb_id) {
		return promisifyDb(db.movies.findOne({
			imdb_id: imdb_id
		}));
	},

	addBookmark: function (imdb_id, type) {
		App.userBookmarks.push(imdb_id);
		return promisifyDb(db.bookmarks.insert({
			imdb_id: imdb_id,
			type: type
		}));
	},

	deleteBookmark: function (imdb_id) {
		App.userBookmarks.splice(App.userBookmarks.indexOf(imdb_id), 1);
		return promisifyDb(db.bookmarks.remove({
			imdb_id: imdb_id
		}));
	},

	getBookmark: function (imdb_id) {
		win.warn('what is this even supposed to do? It isn\'t used anywhere');
		return promisifyDb(db.bookmarks.findOne({
			imdb_id: imdb_id
		}));
	},

	deleteBookmarks: function () {
		return promisifyDb(db.bookmarks.remove({}, {
			multi: true
		}));
	},

	// format: {page: page, keywords: title}
	getBookmarks: function (data) {
		var page = data.page - 1;
		var byPage = 30;
		var offset = page * byPage;
		var query = {};

		return promisifyDb(db.bookmarks.find(query).skip(offset).limit(byPage));
	},

	getAllBookmarks: function () {
		win.warn('this used to use .exec after the find');

		return promisifyDb(db.bookmarks.find({}))
			.then(function (data) {
				var bookmarks = [];
				if (data) {
					bookmarks = extractIds(data);
				}

				return bookmarks;
			});
	},

	addMovies: function (data) {
		win.warn('addTvShow in addMovies seems like a bug');
		win.warn('this isnt called anywhere');

		var promises = data.movies.map(function (movie) {
			return Database.addTVShow({
				movie: movie
			});
		});

		return Promise.all(promises);
	},

	markMoviesWatched: function (data) {
		return promisifyDb(db.watched.insert(data));
	},

	markMovieAsWatched: function (data, trakt) {
		if (data.imdb_id) {
			if (trakt !== false) {
				App.Trakt.movie.seen(data.imdb_id);
			}
			App.watchedMovies.push(data.imdb_id);

			return promisifyDb(db.watched.insert({
				movie_id: data.imdb_id.toString(),
				date: new Date(),
				type: 'movie'
			}));
		}

		win.warn('This shouldn\'t be called');

		return Promise.resolve();
	},

	markMovieAsNotWatched: function (data, trakt) {
		if (trakt !== false) {
			App.Trakt.movie.unseen(data.imdb_id);
		}

		App.watchedMovies.splice(App.watchedMovies.indexOf(data.imdb_id), 1);

		return promisifyDb(db.watched.remove({
			movie_id: data.imdb_id.toString()
		}));
	},

	isMovieWatched: function (data) {
		win.warn('this isn\'t used anywhere');

		return promisifyDb(db.watched.find({
				movie_id: data.imdb_id.toString()
			}))
			.then(function (data) {
				return (data != null && data.length > 0);
			});
	},

	getMoviesWatched: function () {
		return promisifyDb(db.watched.find({
			type: 'movie'
		}));
	},

	/*******************************
	 *******     SHOWS       ********
	 *******************************/
	addTVShow: function (data) {
		return promisifyDb(db.tvshows.insert(data));
	},

	// This calls the addTVShow method as we need to setup a blank episodes array for each
	addTVShows: function (data) {
		win.warn('this isnt called anywhere');

		var promises = data.shows.map(function (show) {
			return Database.addTVShow({
				show: show
			});
		});

		return Promise.all(promises);
	},

	markEpisodeAsWatched: function (data) {
		return promisifyDb(db.watched.find({
				tvdb_id: data.tvdb_id.toString()
			}))
			.then(function (response) {
				if (response.length === 0) {
					App.watchedShows.push(data.imdb_id.toString());
				}
			}).then(function () {


				return promisifyDb(db.watched.insert({
					tvdb_id: data.tvdb_id.toString(),
					imdb_id: data.imdb_id.toString(),
					season: data.season.toString(),
					episode: data.episode.toString(),
					type: 'episode',
					date: new Date()
				}));

			})

		.then(function () {
			App.vent.trigger('show:watched:' + data.tvdb_id, data);
		});


	},

	markEpisodesWatched: function (data) {
		return promisifyDb(db.watched.insert(data));
	},

	markEpisodeAsNotWatched: function (data, trakt) {
		if (trakt !== false) {
			App.Trakt.show.episodeUnseen(data.tvdb_id, {
				season: data.season,
				episode: data.episode
			});
		}

		return promisifyDb(db.watched.find({
				tvdb_id: data.tvdb_id.toString()
			}))
			.then(function (response) {
				if (response.length === 1) {
					App.watchedShows.splice(App.watchedShows.indexOf(data.imdb_id.toString()), 1);
				}
			})
			.then(function () {
				return promisifyDb(db.watched.remove({
					tvdb_id: data.tvdb_id.toString(),
					imdb_id: data.imdb_id.toString(),
					season: data.season.toString(),
					episode: data.episode.toString()
				}));
			})
			.then(function () {
				App.vent.trigger('show:unwatched:' + data.tvdb_id, data);
			});
	},

	checkEpisodeWatched: function (data) {
		return promisifyDb(db.watched.find({
				tvdb_id: data.tvdb_id.toString(),
				imdb_id: data.imdb_id.toString(),
				season: data.season.toString(),
				episode: data.episode.toString()
			}))
			.then(function (data) {
				return (data != null && data.length > 0);
			});
	},

	// return an array of watched episode for this
	// tvshow
	getEpisodesWatched: function (tvdb_id) {
		return promisifyDb(db.watched.find({
			tvdb_id: tvdb_id.toString()
		}));
	},

	getAllEpisodesWatched: function () {
		return promisifyDb(db.watched.find({
			type: 'episode'
		}));
	},
	// deprecated: moved to provider
	// TODO: remove once is approved
	getSubtitles: function (data) {
		win.warn('This function is deprecated, also, nothing is currently using it.');
	},

	// Used in bookmarks
	deleteTVShow: function (imdb_id) {
		return promisifyDb(db.tvshows.remove({
			imdb_id: imdb_id
		}));
	},

	// Used in bookmarks
	getTVShow: function (data) {
		win.warn('this isn\'t used anywhere');

		return promisifyDb(db.tvshows.findOne({
			_id: data.tvdb_id
		}));
	},

	// Used in bookmarks
	getTVShowByImdb: function (imdb_id) {
		return promisifyDb(db.tvshows.findOne({
			imdb_id: imdb_id
		}));
	},

	// TO BE REWRITTEN TO USE TRAKT INSTEAD
	getImdbByTVShow: function (tvshow) {
		win.warn('this isn\'t used anywhere');

		return promisifyDb(db.tvshows.findOne({
			title: tvshow
		}));
	},

	getSetting: function (data) {
		return promisifyDb(db.settings.findOne({
			key: data.key
		}));
	},

	getSettings: function () {
		win.debug('getSettings() fired');
		return promisifyDb(db.settings.find({}));
	},

	// TODO: Make this use Promise.all
	getUserInfo: function () {
		var bookmarks = Database.getAllBookmarks()
			.then(function (data) {
				App.userBookmarks = data;
			});

		var movies = Database.getMoviesWatched()
			.then(function (data) {
				App.watchedMovies = extractMovieIds(data);
			});

		var episodes = Database.getAllEpisodesWatched()
			.then(function (data) {
				App.watchedShows = extractIds(data);
			});

		return Promise.all([bookmarks, movies, episodes]);
	},

	// format: {key: key_name, value: settings_value}
	writeSetting: function (data) {
		return promisify(Database, 'getSetting', {
				key: data.key
			})
			.then(function () {
					return promisifyDb(db.settings.update({
						'key': data.key
					}, {
						$set: {
							'value': data.value
						}
					}, {}));
				},
				function () {
					return promisifyDb(db.settings.insert(data));
				});
	},

	resetSettings: function () {
		return promisifyDb(db.settings.remove({}, {
			multi: true
		}));
	},

	deleteDatabases: function () {
		var option = {
			multi: true
		};

		return promisifyDb(db.bookmarks.remove({}, option))
			.then(function () {
				return promisifyDb(db.tvshows.remove({}, option));
			})
			.then(function () {
				return promisifyDb(db.movies.remove({}, option));
			})
			.then(function () {
				return promisifyDb(db.settings.remove({}, option));
			})
			.then(function () {
				return promisifyDb(db.watched.remove({}, option));
			})
			.then(function () {
				return new Promise(function (resolve, reject) {
					var req = indexedDB.deleteDatabase(App.Config.cache.name);
					req.onsuccess = function () {
						resolve();
					};
					req.onerror = function () {
						resolve();
					};
				});
			});
	},

	initialize: function () {
		App.vent.on('show:watched', _.bind(this.markEpisodeAsWatched, this));
		App.vent.on('show:unwatched', _.bind(this.markEpisodeAsNotWatched, this));
		App.vent.on('movie:watched', _.bind(this.markMovieAsWatched, this));

		// we'll intiatlize our settings and our API SSL Validation
		// we build our settings array
		return Database.getUserInfo()
			.then(function(results) {
			})
			.then(function () {
				return Database.getSettings();
			})
			.then(function (data) {
				if (data != null) {
					for (var key in data) {
						Settings[data[key].key] = data[key].value;
					}
				} else {
					win.warn('is it possible to get here');
				}

				// new install?
				if (Settings.version === false) {
					window.__isNewInstall = true;
				}

				App.vent.trigger('initHttpApi');

				return AdvSettings.checkApiEndpoint([{
						original: 'yifyApiEndpoint',
						mirror: 'yifyApiEndpointMirror',
						fingerprint: 'D4:7B:8A:2A:7B:E1:AA:40:C5:7E:53:DB:1B:0F:4F:6A:0B:AA:2C:6C'
					}
					// TODO: Add get-popcorn.com SSL fingerprint (for update)
					// with fallback with DHT
				]);
			})
			.then(function () {
				// set app language
				detectLanguage(Settings.language);
				// set hardware settings and usefull stuff
				return AdvSettings.setup();
			})
			.then(function () {
				App.Trakt = App.Config.getProvider('metadata');
				// check update
				var updater = new App.Updater();
				updater.update()
					.catch(function (err) {
						win.error(err);
					});
				// we skip the initDB (not needed in current version)
			})
			.catch(function(err){
				win.error('Error starting up');
				win.error(err);
			});
	}
};
