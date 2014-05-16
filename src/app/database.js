var async = require('async');
var request = require('request');
var zlib = require('zlib');

var Datastore = require('nedb');
var path = require('path');
var openSRT = require('opensrt_js');
var db = {};

console.time("App startup time");
var data_path = require('nw.gui').App.dataPath;
console.debug("Database path: " + data_path);

// TTL for popcorn-api DB sync
var TTL = 1000 * 60 * 60 * 24;

process.env.TZ = "America/New_York"; // set same api tz

db.bookmarks = new Datastore({ filename: path.join(data_path, 'data/bookmarks.db'), autoload: true });
db.settings = new Datastore({ filename: path.join(data_path, 'data/settings.db'), autoload: true });
db.tvshows = new Datastore({ filename: path.join(data_path, 'data/shows.db'), autoload: true });
db.movies = new Datastore({ filename: path.join(data_path, 'data/movies.db'), autoload: true });
db.watched = new Datastore({ filename: path.join(data_path, 'data/watched.db'), autoload: true });

// Create unique indexes for the various id's for shows and movies
db.tvshows.ensureIndex({fieldName: 'imdb_id' , unique: true });
db.tvshows.ensureIndex({fieldName: 'tvdb_id' , unique: true });
db.movies.ensureIndex({fieldName: 'imdb' , unique: true });
db.movies.removeIndex('imdb_id');
db.movies.removeIndex('tmdb_id');
db.bookmarks.ensureIndex({fieldName: 'imdb_id' , unique: true });

// settings key uniqueness
db.settings.ensureIndex({fieldName: 'key' , unique: true });

var extractIds = function(items) {
	return _.pluck(items, 'imdb_id');
};

var Database = {

	addMovie: function(data, cb) {
		db.movies.insert(data, cb);
	},

	deleteMovie: function(imdb_id, cb) {
		db.movies.remove({imdb: imdb_id}, cb);
	},

	getMovie: function(imdb_id, cb) {
		db.movies.findOne({imdb : imdb_id}, cb);
	}, 

	addBookmark: function(imdb_id, type, cb) {
		db.bookmarks.insert({imdb_id: imdb_id, type: type}, cb);
	},

	deleteBookmark: function(imdb_id, cb) {
		db.bookmarks.remove({imdb_id: imdb_id}, cb);
	},

	getBookmark: function(imdb_id, cb) {
		db.bookmarks.findOne({imdb_id : imdb_id}, function(err,data) {
			if (err) cb(true,false);
			if (data != null) {
				return cb(false,true);
			} else {
				return cb(false,false);
			}
		});
	},

	deleteBookmarks: function(cb) {
		db.bookmarks.remove({ }, { multi: true }, function (err, numRemoved) {
			return cb(false,true);
		});
	},

	// format: {page: page, keywords: title}
	getBookmarks: function(data, cb) {
		var page = data.page-1;
		var byPage = 30;
		var offset = page*byPage;
		var query = {};
			
		db.bookmarks.find(query).skip(offset).limit(byPage).exec(cb);
	},        

	addMovies: function(data, cb) {
		async.each(data.movies, function(movie, callback) {
			addTVShow({movie: movie}, function(err, show) {callback(err)})
		},cb);
	},

	markMovieAsWatched: function(data, cb) {
		if (!cb) cb = function () {};
		db.watched.insert({movie_id: data.imdb_id.toString(), date: new Date(), type: 'movie'}, cb);
	},

	markMovieAsNotWatched: function(data, cb) {
		if (!cb) cb = function () {};
		db.watched.remove({movie_id: data.movie_id.toString()}, cb);
	},

	checkMovieWatched: function(data, cb) {
		db.watched.find({movie_id: data.movie_id.toString()}, function(err, data){
			return cb((data!=null && data.length > 0), data);
		});
	},

	/*******************************
	*******     SHOWS       ********
	*******************************/
	addTVShow: function(data, cb) {
		if(!data.show.episodes) data.show.episodes = [];
		db.tvshows.insert(data.show, cb);
	},

	// This calls the addTVShow method as we need to setup a blank episodes array for each
	addTVShows: function(data, cb) {
		async.each(data.shows, function(show, callback) {
			addTVShow({show:show}, function(err, show) {callback(err)})
		},cb);
	},

	addEpisodeToShow: function(data, cb) {
		if(!data.episode.watched) data.episode.watched = {};
		db.tvshows.update({imdb_id: data.imdb_id}, { $addToSet: {episodes: data.episode}}, cb);
	},

	addEpisodesToShow: function(data, cb) {
		async.each(data.episodes, function(episode, callback) {
			addEpisodeToShow({imdb_id: data.imdb_id, episode: episode}, function(err, episode) {callback(err)})
		},cb);
	},

	markEpisodeAsWatched: function(data, cb) {
		if (!cb) cb = function () {};
		db.watched.insert({show_id: data.show_id.toString(), season: data.season.toString(), episode: data.episode.toString(), type: 'episode', date: new Date()}, cb);
	},

	markEpisodeAsNotWatched: function(data, cb) {
		if (!cb) cb = function () {};
		db.watched.remove({show_id: data.show_id.toString(), season: data.season.toString(), episode: data.episode.toString()}, cb);
	},

	checkEpisodeWatched: function(data, cb) {
		db.watched.find({show_id: data.show_id.toString(), season: data.season.toString(), episode: data.episode.toString()}, function(err, data){
			return cb((data!=null && data.length > 0), data);
		});
	},

	// return an array of watched episode for this 
	// tvshow
	getEpisodesWatched: function(show_id, cb) {
		db.watched.find({show_id: show_id.toString()}, cb);
	},

	getEpisodesPerSeason: function(data, cb) {
		db.tvshows.find({_id : data.show_id, "episodes.season": data.season}, cb);
	},

	getSubtitles: function(data, cb) {
		//console.log(data);
		openSRT.searchEpisode(data, function(err, subs) {
			if(subs) {
				for(var lang in subs) {
					//if(subs[lang].lang == "es") console.log(subs[lang]);
					subs[lang] = subs[lang].url;
				}
				return cb(null, subs);
			}
			else return cb(null, {});
		});
	},

	getTVShow: function(data, cb) {
		db.tvshows.findOne({_id : data.show_id}, cb);
	},

	getTVShowByImdb: function(imdb_id, cb) {
		db.tvshows.findOne({imdb_id : imdb_id}, cb);
	},        

	getNumSeasons: function(data, cb) {
		db.tvshows.findOne({_id : data.show_id}).sort({"episodes.season": -1}).exec(function(err, doc) {
			if(err) return cb(err, null);
			else {
				var episodes = doc.episodes;
				episodes.sort(function(a,b) {
					if(a.season == b.season) return 0;
					if(a.season < b.season) return 1;
					if(a.season > b.season) return -1;
				})
				var numSeasons = episodes[0].season;
				cb(null, numSeasons);
			}
		})
	},

	getShowsCount: function(cb) {
		db.tvshows.count({}, cb);
	},

	initDB: function(cb) {
		console.time('initDB time');
		$("#init-status").html(i18n.__("Status: Creating Database..."));
		db.tvshows.remove({ }, { multi: true }, function (err, numRemoved) {

			// JSON Processing
			function processJSON(data, callback){

				db.tvshows.insert(data, function (err, newDocs){
					if(err){
						win.error("Procession failed!");
						return callback(err, null);
					}else{
						win.info("Done! Processed data.");
						return callback(null, newDocs);
					}
				});
			}
				
			$("#initbar-contents").animate({ width: "35%" }, 3000, 'swing');

			// we extract our remote dbz and save it locally
			// we'll not use memory to prevent error / flood

			var out = fs.createWriteStream('./src/app/db/latest.zip');
			var req = request({
				method: 'GET',
				uri: Settings.tvshowApiEndpoint + 'db/latest.zip'
			});

			req.pipe(out);

			req.on('data', function (chunk) {
				$("#init-status").html(i18n.__("Status: Downloading API archive...") + " " + chunk.length);
			});

			req.on('error', function(err) {
				console.timeEnd('initDB time');
				win.error("ZIP Download Failed");
				return cb(err, null);
			});

			req.on('end', function() {


				$("#initbar-contents").animate({ width: "75%" }, 4000, 'swing');
				$("#init-status").html(i18n.__("Status: Archive downloaded successfully..."));

				var AdmZip = require('adm-zip');

				try { 

					var zip = new AdmZip("./src/app/db/latest.zip");
					var zipEntries = zip.getEntries();

					zip.extractAllTo("./src/app/db/", true);
					async.eachSeries(zipEntries, function(zipEntry, callback) {
						
						fs.readFile("./src/app/db/"+zipEntry.name, function (err, data) {
		
							if (err) callback();
							win.debug(zipEntry.name);
							$("#init-status").html(i18n.__("Status: Importing file") + " " +  zipEntry.name);

							processJSON(JSON.parse(data), function(err,data) {
									
								$("#init-status").html(i18n.__("Status: Imported successfully") + " " +  zipEntry.name);

								fs.unlink("./src/app/db/"+zipEntry.name);
								callback();
							});						

						});

					}, function(err) {
					
						console.timeEnd('initDB time');
						$("#init-status").html(i18n.__("Status: Launching applicaion... "));
						$("#initbar-contents").animate({ width: "90%" }, 4000, 'swing');
						fs.unlink("./src/app/db/latest.zip");
						win.info("initDB done!");
						cb(null,true);

					});

				} catch ( e ) {
					console.timeEnd('initDB time');
					win.error("initDB failed: " + e);
					cb(e,null);
				
				}

			});

		});
	},

	// sync with updated/:since
	syncDB: function(cb) {
		console.time('syncDB time');
		Database.getSetting({key: "tvshow_last_sync"}, function(err, setting) {
			var last_update = setting.value;
			win.info("Updating database from remote api since " + last_update);
			$("#init-status").html(i18n.__("Status: Updating database..."));
			$("#initbar-contents").animate({ width: "90%" }, 3000, 'swing');

			// we'll get number of page
			request(Settings.tvshowApiEndpoint + 'shows/update/' + last_update, {json: true}, function(err, res, allPages) {

				// api is down? we continue anyways...
           		if(err || !allPages) {
					console.timeEnd('syncDB time');
					win.warn("syncDB failed:", err.message);
					return cb("empty", null);
				}

				// we'll make a query for each page
				async.eachSeries(allPages, function(page, callback) {
					
					$("#init-status").html(i18n.__("Status: Updating database...") + " " + page);

					win.info("Extract: " + Settings.tvshowApiEndpoint + page);
					request(Settings.tvshowApiEndpoint + page, {json: true}, function(err, res, toUpdate) {

						db.tvshows.remove({ imdb_id: { $in: extractIds(toUpdate) }}, { multi: true }, function (err, numRemoved) {
							db.tvshows.insert(toUpdate, function (err, newDocs){
								 callback(err, newDocs);
							});
						});							

					});

				}, function(err,data) {
					console.timeEnd('syncDB time');
					Database.writeSetting({key: "tvshow_last_sync", value: +new Date()}, function(err, setting) { 
						return cb(null, setting);
					})					
				});

            });

		});
	},

	getShowsByRating: function(cb) {
		db.tvshows.find({}).sort({"rating.votes": -1, "rating.percentage": -1}).limit(10).exec(cb);
	},

	getSetting: function(data, cb) {
		db.settings.findOne({key : data.key}, cb);
	},      

	getSettings: function(cb) {
		win.debug("getSettings() fired");
		db.settings.find({}).exec(cb);
	},

	// format: {key: key_name, value: settings_value}
	writeSetting: function(data, cb) {
		Database.getSetting({key: data.key}, function(err, setting) {
			if (setting == null) {
				db.settings.insert(data, cb);
			} else {
				db.settings.update({"key": data.key}, {$set : {"value": data.value}}, {}, cb);
			}
		})
	},

	// format: {page: page, keywords: title}
	getShows: function(data, cb) {
		var page = data.page-1;    
		var byPage = 30;
		var offset = page*byPage;
		var query = {};
		var sort = {"rating.votes": data.order, "rating.percentage": data.order}

		if (data.keywords) {
			var words = data.keywords.split(" ");
			var regex = data.keywords.toLowerCase();
			if(words.length > 1) {
				var regex = "^";
				for(var w in words) {
					regex += "(?=.*\\b"+words[w].toLowerCase()+"\\b)";
				}
				regex += ".+";
			}
			query = {title: new RegExp(regex,"gi")};
		}
		if (data.sorter) {
			if(data.sorter == "year") sort = {year: data.order};
			if(data.sorter == "updated") sort = {last_updated: data.order};
			if(data.sorter == "name") sort = {title: data.order * -1};
		}
		if(data.genre && data.genre != "All") {
			query = {genres : data.genre}
		}
			
		db.tvshows.find(query).sort(sort).skip(offset).limit(byPage).exec(cb);
		   
	},

	deleteDatabases: function(cb) {
		db.bookmarks.remove({ }, { multi: true }, function (err, numRemoved) {
			db.tvshows.remove({ }, { multi: true }, function (err, numRemoved) {
				db.movies.remove({ }, { multi: true }, function (err, numRemoved) {
					db.settings.remove({ }, { multi: true }, function (err, numRemoved) {
						db.watched.remove({ }, { multi: true }, function (err, numRemoved) {
							return cb(false,true);
						});
					});
				});
			});
		});
	},
	// Test Method to get list of Genres, never called in production
	getGenres: function() {
		db.tvshows.find({}, function(err, shows){
			var genres = [];
			async.each(shows, function(show, cb) {
				for(var g in show.genres) {
					var genre = show.genres[g];
					if(genres.indexOf(genre) == -1) genres.push(genre);
				}
				cb();
			},
			function(err, res){
				console.log(genres.sort());
			})
		})
	},

	initialize : function(callback){

		// we'll intiatlize our settings and our API SSL Validation
		// we build our settings array
		Database.getSettings(function(err, data) {
			
			if (data != null) {
				for(var key in data) {
					Settings[data[key].key] = data[key].value;
				}
			}

			// new install?    
			if( Settings.version == false ) {
				window.__isNewInstall = true;
			};

			AdvSettings.checkApiEndpoint(
				[
					{
						original: 'yifyApiEndpoint',
						mirror: 'yifyApiEndpointMirror', 
						fingerprint: 'D4:7B:8A:2A:7B:E1:AA:40:C5:7E:53:DB:1B:0F:4F:6A:0B:AA:2C:6C'
					}
					// TODO: Add get-popcorn.com SSL fingerprint (for update)
					// with fallback with DHT
				]
				, function() {

				// set app language
				detectLanguage(Settings['language']);

				// set hardware settings and usefull stuff
				AdvSettings.setup();

				// db sync with remote endpoint
				Database.getSetting({key: "tvshow_last_sync"}, function(err, setting) {
					Database.getShowsCount(function(err, count) {
						if (setting == null || count == 0) {
							// we need to do a complete update
							// this is our first launch
							Database.initDB(function(err, setting) {

								// if failed we didnt write our last update
								if (err) return callback();

								// we write our new update time
								Database.writeSetting({key: "tvshow_last_sync", value: +new Date()}, callback);
							});
						} else {

							// we set a TTL of 24 hours for the DB	
							if ( (+new Date() - setting.value) > TTL ) {
								Database.syncDB(callback);
							} else {
								win.info("Skiping synchronization TTL not meet");
								$("#init-status").html(i18n.__("Status: Skipping synchronization TTL not met"));
								$("#initbar-contents").animate({ width: "100%" }, 500, 'swing');
								setTimeout(function() { callback(); },500);
							}

						}
					});
				})
			});

		});
		App.vent.on('shows:watched',   _.bind(this.markEpisodeAsWatched, this));
		App.vent.on('shows:unwatched', _.bind(this.markEpisodeAsNotWatched, this));
		App.vent.on('movies:watched',  _.bind(this.markMovieAsWatched, this));
	}
	
}