    var async = require('async');
    var request = require('request');
	var zlib = require('zlib');

    var Datastore = require('nedb');
    var path = require('path');
    var openSRT = require('opensrt_js');
    var db = {};

    var data_path = require('nw.gui').App.dataPath;;
    console.log("Database path: " + data_path);

    // TTL for popcorn-api DB sync
    var TTL = 1000 * 60 * 60 * 24;

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
            async.each(data.movies,
                function(movie, callback) {
                    addTVShow({movie: movie}, function(err, show) {callback(err)})
                },
                cb);
        },

        markMovieAsWatched: function(data, cb) {
            if (!cb)
                cb = function () {};
            db.movies.update({"_id": data.movie_id}, {$set : {"watched.watched": true, "watched.date": new Date()}}, {}, cb);
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
            async.each(data.shows,
                function(show, callback) {
                    addTVShow({show:show}, function(err, show) {callback(err)})
                },
                cb);
        },

        addEpisodeToShow: function(data, cb) {
            if(!data.episode.watched) data.episode.watched = {};
            db.tvshows.update({imdb_id: data.imdb_id}, { $addToSet: {episodes: data.episode}}, cb);
        },

        addEpisodesToShow: function(data, cb) {
            async.each(data.episodes,
                function(episode, callback) {
                    addEpisodeToShow({imdb_id: data.imdb_id, episode: episode}, function(err, episode) {callback(err)})
                },
                cb);
        },

        markEpisodeAsWatched: function(data, cb) {
            if (!cb)
                cb = function () {};
            db.watched.insert({show_id: data.show_id, season: data.season, episode: data.episode, date: new Date()}, cb);
        },

        markEpisodeAsNotWatched: function(data, cb) {
            if (!cb)
                cb = function () {};
            db.watched.remove({show_id: data.show_id, season: data.season, episode: data.episode}, cb);
        },

        checkEpisodeWatched: function(data, cb) {
            db.watched.find({show_id: data.show_id, season: data.season, episode: data.episode}, function(err, data){
                return cb((data!=null && data.length > 0), data);
            });
        },

        // return an array of watched episode for this 
        // tvshow
        getEpisodesWatched: function(show_id, cb) {
            db.watched.find({show_id: show_id}, cb);
        },

        getEpisodesPerSeason: function(data, cb) {
            db.tvshows.find({_id : data.show_id, "episodes.season": data.season}, cb);
        },

        getSubtitles : function(data, cb) {
            openSRT.searchEpisode(data, function(err, subs) {
                if(subs) {
                    for(var lang in subs) {
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
			$("#init-status").html("Status: Creating Database");
			$("#initbar-contents").css("width","20%");

			db.tvshows.remove({ }, { multi: true }, function (err, numRemoved) {
                db.tvshows.loadDatabase(function (err) {
					function processJSON(data){
						db.tvshows.insert(JSON.parse(data), function (err, newDocs){
							if(err){
								console.log("Procession failed!");
								return cb(err, null);
							}else{
								console.log("Done! Processed data.");
								return cb(null, newDocs);
							}
						});
					}

					var gunzip = zlib.createGunzip();            
					var buffer = [];

					gunzip.on('data', function(data) {
						buffer.push(data.toString())
					}).on("end", function() {
						console.log("Done! Processing data.");
						processJSON(buffer.join("")); 
					}).on("error", function(e) {
						console.log("Uncompression failed!");
						return cb(err, null);
					})
					console.log("Downloading and uncompressing gzip data from: " + Settings.tvshowApiEndpoint);
					request({
						url: Settings.tvshowApiEndpoint + 'shows/all',
						headers: { 'accept-encoding': 'gzip,deflate' }
					}).pipe(gunzip);

				});
			});
		},

        // sync with updated/:since
        syncDB: function(cb) {
            Database.getSetting({key: "tvshow_last_sync"}, function(err, setting) {
                var last_update = setting.value;
                console.log("Updating database from remote api since " + last_update);
                document.getElementById("init-status").innerHTML = "Status: Updating database";
                document.getElementById("initbar-contents").style.width="20%";
                request.get(Settings.tvshowApiEndpoint + "shows/updated/" + last_update, function(err, res, body) {
                    if(!err) {
                        var toUpdate  = JSON.parse(body);
                        db.tvshows.remove({ imdb_id: { $in: extractIds(toUpdate) }}, { multi: true }, function (err, numRemoved) {
                            db.tvshows.insert(toUpdate, function (err, newDocs){
                                if(err) return cb(err, null);
                                else {
                                    // we write our new update time
                                    Database.writeSetting({key: "tvshow_last_sync", value: +new Date()}, function(err, setting) { 
                                        return cb(null, newDocs);
                                    })
                                }
                            });
                        });
                    } else {
                        return cb(err, null);
                    }
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
        	console.log("getSettings fired");
            db.settings.find({}).exec(cb);
        },

        // todo make sure to overwrite
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
            var sort = {"rating.votes": -1, "rating.percentage": -1}

            if (data.keywords) 
                query = {title: new RegExp(data.keywords.toLowerCase(),"gi")};
            if (data.sorter) {
                if(data.sorter == "year") sort = {year: -1};
                if(data.sorter == "updated") sort = {last_updated: -1};
                if(data.sorter == "name") sort = {title: 1};
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
                        // TODO: If Settings.tvshowApiEndpoint == popcorn-api.com make a fallback to check if
                        // its not blocked
                        
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
                        if (setting == null ) {
                            // we need to do a complete update
                            // this is our first launch
                            
                            Database.initDB(function(err, setting) {
                                // we write our new update time
                                Database.writeSetting({key: "tvshow_last_sync", value: +new Date()}, callback);
                            });
                        } else {

                            // we set a TTL of 24 hours for the DB
                            if ( (+new Date() - setting.value) > TTL ) {
                                Database.syncDB(callback);
                            } else {
                                console.log("Skiping synchronization TTL not meet");
                                document.getElementById("initbar-contents").style.width="100%";
                                document.getElementById("init-status").innerHTML = "Status: Skiping synchronization TTL not met";
				setTimeout(function() { callback(); },500); //so user sees bar move :P

                            }

                        }

                    })                       

                });

            });

            App.vent.on('shows:watched',   _.bind(this.markEpisodeAsWatched, this));
            App.vent.on('shows:unwatched', _.bind(this.markEpisodeAsNotWatched, this));
            App.vent.on('movies:watched',  _.bind(this.markMovieAsWatched, this));
        }


    }
