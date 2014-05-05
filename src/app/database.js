    var async = require('async');
    var request = require('request');

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
            db.watched.insert({show_id: data.show_id, season: data.season, episode: data.episode, date: new Date()}, cb);
        },

        checkEpisodeWatched: function(data, cb) {
            db.watched.find({show_id: data.show_id, season: data.season, episode: data.episode}, function(err, data){
                return cb(null, (data!=null && data.length > 0));
            });
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
            console.log("Extracting data from remote api " + Settings.tvshowApiEndpoint);
            db.tvshows.remove({ }, { multi: true }, function (err, numRemoved) {
                db.tvshows.loadDatabase(function (err) {
                    request.get(Settings.tvshowApiEndpoint + "shows/all", function(err, res, body) {                        
                        if(!err) {
                            db.tvshows.insert(JSON.parse(body), function (err, newDocs){
                                if(err) return cb(err, null);
                                else return cb(null, newDocs);
                            });
                        }
                        else {
                            return cb(err, null);
                        }
                    })
                });
            });
        },

        // sync with updated/:since
        syncDB: function(last_update, cb) {
            console.log("Updating data from remote api since " + last_update);
            request.get(Settings.tvshowApiEndpoint + "shows/updated/" + last_update, function(err, res, body) {
                if(!err) {
                    var toUpdate  = JSON.parse(body);
                    db.tvshows.remove({ imdb_id: { $in: extractIds(toUpdate) }}, { multi: true }, function (err, numRemoved) {
                        db.tvshows.insert(toUpdate, function (err, newDocs){
                            if(err) return cb(err, null);
                            else return cb(null, newDocs);
                        });
                    });
                } else {
                    return cb(err, null);
                }
            });
        },

        getShowsByRating: function(cb) {
            db.tvshows.find({}).sort({"rating.votes": -1, "rating.percentage": -1}).limit(10).exec(cb);
        },

        getSetting: function(data, cb) {
            db.settings.findOne({key : data.key}, cb);
        },      

        getSettings: function(cb) {
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
                
            db.tvshows.find(query).sort(sort).skip(offset).limit(byPage).exec(cb);
               
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
                                Database.syncDB(setting.value,function(err, setting) {
                                    // we write our new update time
                                    Database.writeSetting({key: "tvshow_last_sync", value: +new Date()}, callback);
                                });
                            } else {
                                console.log("Skiping synchronization TTL not meet");
                                callback();
                            }

                        }
           
                    })                       

                });

            });             
        }


    }
