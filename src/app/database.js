    var async = require('async');
    var request = require('request');

    var Datastore = require('nedb');
    var path = require('path');
    var db = {};

    var data_path = require('nw.gui').App.dataPath;;

    // TTL for popcorn-api DB sync
    var TTL = 1000 * 60 * 60 * 24;

    db.bookmarks = new Datastore({ filename: path.join(data_path, 'data/bookmarks.db'), autoload: true });
    db.settings = new Datastore({ filename: path.join(data_path, 'data/settings.db'), autoload: true });
    db.tvshows = new Datastore({ filename: path.join(data_path, 'data/shows.db'), autoload: true });
    db.movies = new Datastore({ filename: path.join(data_path, 'data/movies.db'), autoload: true });
    db.queue = new Datastore({ filename: path.join(data_path, 'data/queue.db'), autoload: true });

    // Create unique indexes for the various id's for shows and movies
    db.tvshows.ensureIndex({fieldName: 'imdb_id' , unique: true });
    db.tvshows.ensureIndex({fieldName: 'tvdb_id' , unique: true });
    db.movies.ensureIndex({fieldName: 'imdb_id' , unique: true });
    db.movies.ensureIndex({fieldName: 'tmdb_id' , unique: true });

    // settings key uniqueness
    db.settings.ensureIndex({fieldName: 'key' , unique: true });

    var extractIds = function(items) {
        return _.pluck(items, 'imdb_id');
    };

    var Database = {

        addMovie: function(data, cb) {
            if(!data.movie.watched) data.movie.watched = {};
            db.movies.insert(data.movie, cb);
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
            db.tvshows.update({"episodes._id": data.episode_id}, {$set : {"watched.watched": true, "watched.date": new Date()}}, {}, cb);
        },

        getEpisodesPerSeason: function(data, cb) {
            db.tvshows.find({_id : data.show_id, "episodes.season": data.season}, cb);
        },

        getTVShow: function(data, cb) {
            db.tvshows.find({_id : data.show_id}, cb);
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
            console.log("Extracting data from remote api");
            db.tvshows.remove({ }, { multi: true }, function (err, numRemoved) {
                db.tvshows.loadDatabase(function (err) {
                    request.get("http://popcorn-api.com/shows/all", function(err, res, body) {
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
            request.get("http://popcorn-api.com/shows/updated/"+last_update, function(err, res, body) {
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

            if (data.keywords) 
                // SUGGESTION : Paging for search result. Actually we clear the filter when we have a search result
                // so this should change and add a paging on result 
                db.tvshows.find({title: new RegExp(data.keywords.toLowerCase(),"gi")}).sort({"rating.votes": -1, "rating.percentage": -1}).exec(cb);
            
            else 
                db.tvshows.find({}).sort({"rating.votes": -1, "rating.percentage": -1}).skip(offset).limit(byPage).exec(cb);
               
        },

        initialize : function(callback){
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
                        console.log("skiping synchronization TTL not meet");
                        callback();
                    }

                }
   
            })
        }   
    }
