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

var extractIds = function(items) {
    return _.pluck(items, 'imdb_id');
};

var extractMovieIds = function(items) {
    return _.pluck(items, 'movie_id');
};

var Database = {

    addMovie: function(data, cb) {
        db.movies.insert(data, cb);
    },

    deleteMovie: function(imdb_id, cb) {
        db.movies.remove({
            imdb_id: imdb_id
        }, cb);
    },

    getMovie: function(imdb_id, cb) {
        db.movies.findOne({
            imdb_id: imdb_id
        }, cb);
    },

    addBookmark: function(imdb_id, type, cb) {
        App.userBookmarks.push(imdb_id);
        db.bookmarks.insert({
            imdb_id: imdb_id,
            type: type
        }, cb);
    },

    deleteBookmark: function(imdb_id, cb) {
        App.userBookmarks.splice(App.userBookmarks.indexOf(imdb_id), 1);
        db.bookmarks.remove({
            imdb_id: imdb_id
        }, cb);
    },

    getBookmark: function(imdb_id, cb) {
        db.bookmarks.findOne({
            imdb_id: imdb_id
        }, function(err, data) {
            if (err) {
                cb(true, false);
            }

            if (data != null) {
                return cb(false, true);
            } else {
                return cb(false, false);
            }
        });
    },

    deleteBookmarks: function(cb) {
        db.bookmarks.remove({}, {
            multi: true
        }, function(err, numRemoved) {
            return cb(false, true);
        });
    },

    // format: {page: page, keywords: title}
    getBookmarks: function(data, cb) {
        var page = data.page - 1;
        var byPage = 30;
        var offset = page * byPage;
        var query = {};

        db.bookmarks.find(query).skip(offset).limit(byPage).exec(cb);
    },

    getAllBookmarks: function(cb) {
        db.bookmarks.find({}).exec(function(err, data) {
            if (err) {
                return cb(err, null);
            }
            var bookmarks = [];
            if (data) {
                bookmarks = extractIds(data);
            }

            return cb(null, bookmarks);
        });
    },

    addMovies: function(data, cb) {
        async.each(data.movies, function(movie, callback) {
            Database.addTVShow({
                movie: movie
            }, function(err, show) {
                callback(err);
            });
        }, cb);
    },

    markMoviesWatched: function(data, cb) {
        db.watched.insert(data, cb);
    },

    markMovieAsWatched: function(data, trakt, cb) {
        if (!cb) {
            if (typeof trakt === 'function') {
                cb = trakt;
                trakt = undefined;
            } else {
                cb = function() {};
            }
        }

        if (trakt !== false) {
            App.Trakt.movie.seen(data.imdb_id);
        }
        App.watchedMovies.push(data.imdb_id);
        db.watched.insert({
            movie_id: data.imdb_id.toString(),
            date: new Date(),
            type: 'movie'
        }, cb);
    },

    markMovieAsNotWatched: function(data, trakt, cb) {
        if (!cb) {
            if (typeof trakt === 'function') {
                cb = trakt;
                trakt = undefined;
            } else {
                cb = function() {};
            }
        }

        if (trakt !== false) {
            App.Trakt.movie.unseen(data.imdb_id);
        }

        App.watchedMovies.splice(App.watchedMovies.indexOf(data.imdb_id), 1);

        db.watched.remove({
            movie_id: data.imdb_id.toString()
        }, cb);
    },

    checkMovieWatched: function(data, cb) {
        db.watched.find({
            movie_id: data.imdb_id.toString()
        }, function(err, data) {
            return cb((data != null && data.length > 0), data);
        });
    },

    getMoviesWatched: function(cb) {
        db.watched.find({
            type: 'movie'
        }, cb);
    },

    /*******************************
     *******     SHOWS       ********
     *******************************/
    addTVShow: function(data, cb) {
        db.tvshows.insert(data, cb);
    },

    // This calls the addTVShow method as we need to setup a blank episodes array for each
    addTVShows: function(data, cb) {
        async.each(data.shows, function(show, callback) {
            Database.addTVShow({
                show: show
            }, function(err, show) {
                callback(err);
            });
        }, cb);
    },

    markEpisodeAsWatched: function(data, trakt, cb) {
        if (!cb) {
            if (typeof trakt === 'function') {
                cb = trakt;
                trakt = undefined;
            } else {
                cb = function() {};
            }
        }

        if (trakt !== false) {
            App.Trakt.show.episodeSeen(data.show_id, {
                season: data.season,
                episode: data.episode
            });
        }

        db.watched.find({
            show_id: data.show_id.toString()
        }, function(err, response) {
            if (response.length === 0) {
                App.watchedShows.push(data.imdb_id.toString());
            }
        });

        db.watched.insert({
            show_id: data.show_id.toString(),
            imdb_id: data.imdb_id.toString(),
            season: data.season.toString(),
            episode: data.episode.toString(),
            type: 'episode',
            date: new Date()
        }, cb);
    },

    markEpisodesWatched: function(data, cb) {
        db.watched.insert(data, cb);
    },

    markEpisodeAsNotWatched: function(data, trakt, cb) {
        if (!cb) {
            if (typeof trakt === 'function') {
                cb = trakt;
                trakt = undefined;
            } else {
                cb = function() {};
            }
        }

        if (trakt !== false) {
            App.Trakt.show.episodeUnseen(data.show_id, {
                season: data.season,
                episode: data.episode
            });
        }

        db.watched.find({
            show_id: data.show_id.toString()
        }, function(err, response) {
            if (response.length === 1) {
                App.watchedShows.splice(App.watchedShows.indexOf(data.imdb_id.toString()), 1);
            }
        });

        db.watched.remove({
            show_id: data.show_id.toString(),
            imdb_id: data.imdb_id.toString(),
            season: data.season.toString(),
            episode: data.episode.toString()
        }, cb);
    },

    checkEpisodeWatched: function(data, cb) {
        db.watched.find({
            show_id: data.show_id.toString(),
            imdb_id: data.imdb_id.toString(),
            season: data.season.toString(),
            episode: data.episode.toString()
        }, function(err, data) {
            return cb((data != null && data.length > 0), data);
        });
    },

    // return an array of watched episode for this 
    // tvshow
    getEpisodesWatched: function(show_id, cb) {
        db.watched.find({
            show_id: show_id.toString()
        }, cb);
    },

    getAllEpisodesWatched: function(cb) {
        db.watched.find({
            type: 'episode'
        }, cb);
    },
    // deprecated: moved to provider 
    // TODO: remove once is approved
    getSubtitles: function(data, cb) {},

    // Used in bookmarks
    deleteTVShow: function(imdb_id, cb) {
        db.tvshows.remove({
            imdb_id: imdb_id
        }, cb);
    },

    // Used in bookmarks
    getTVShow: function(data, cb) {
        db.tvshows.findOne({
            _id: data.show_id
        }, cb);
    },

    // Used in bookmarks
    getTVShowByImdb: function(imdb_id, cb) {
        db.tvshows.findOne({
            imdb_id: imdb_id
        }, cb);
    },

    // TO BE REWRITTEN TO USE TRAKT INSTEAD
    getImdbByTVShow: function(tvshow, cb) {
        db.tvshows.findOne({
            title: tvshow
        }, cb);
    },

    getSetting: function(data, cb) {
        db.settings.findOne({
            key: data.key
        }, cb);
    },

    getSettings: function(cb) {
        win.debug('getSettings() fired');
        db.settings.find({}).exec(cb);
    },

    getUserInfo: function(cb) {
        var bookmarksDone = false;
        var watchedMoviesDone = false;
        var watchedShowsDone = false;

        Database.getAllBookmarks(function(err, data) {
            App.userBookmarks = data;
            bookmarksDone = true;
            if (bookmarksDone && watchedMoviesDone && watchedShowsDone) {
                cb();
            }
        });
        Database.getMoviesWatched(function(err, data) {
            App.watchedMovies = extractMovieIds(data);
            watchedMoviesDone = true;
            if (bookmarksDone && watchedMoviesDone && watchedShowsDone) {
                cb();
            }
        });

        Database.getAllEpisodesWatched(function(err, data) {
            App.watchedShows = extractIds(data);
            watchedShowsDone = true;
            if (bookmarksDone && watchedMoviesDone && watchedShowsDone) {
                cb();
            }
        });

    },

    // format: {key: key_name, value: settings_value}
    writeSetting: function(data, cb) {
        Database.getSetting({
            key: data.key
        }, function(err, setting) {
            if (setting == null) {
                db.settings.insert(data, cb);
            } else {
                db.settings.update({
                    'key': data.key
                }, {
                    $set: {
                        'value': data.value
                    }
                }, {}, cb);
            }
        });
    },

    resetSettings: function(cb) {
        db.settings.remove({}, {
            multi: true
        }, cb);
    },

    deleteDatabases: function(cb) {
        db.bookmarks.remove({}, {
            multi: true
        }, function(err, numRemoved) {
            db.tvshows.remove({}, {
                multi: true
            }, function(err, numRemoved) {
                db.movies.remove({}, {
                    multi: true
                }, function(err, numRemoved) {
                    db.settings.remove({}, {
                        multi: true
                    }, function(err, numRemoved) {
                        db.watched.remove({}, {
                            multi: true
                        }, function(err, numRemoved) {
                            var req = indexedDB.deleteDatabase(App.Config.cache.name);
                            req.onsuccess = function() {
                                cb(false, true);
                            };
                            req.onerror = function() {
                                cb(false, true);
                            };
                        });
                    });
                });
            });
        });
    },

    initialize: function(callback) {
        // we'll intiatlize our settings and our API SSL Validation
        // we build our settings array
        Database.getUserInfo(function() {
            Database.getSettings(function(err, data) {

                if (data != null) {
                    for (var key in data) {
                        Settings[data[key].key] = data[key].value;
                    }
                }

                // new install?    
                if (Settings.version === false) {
                    window.__isNewInstall = true;
                }

                App.vent.trigger('initHttpApi');

                AdvSettings.checkApiEndpoint([{
                        original: 'yifyApiEndpoint',
                        mirror: 'yifyApiEndpointMirror',
                        fingerprint: 'D4:7B:8A:2A:7B:E1:AA:40:C5:7E:53:DB:1B:0F:4F:6A:0B:AA:2C:6C'
                    }
                    // TODO: Add get-popcorn.com SSL fingerprint (for update)
                    // with fallback with DHT
                ], function() {
                    // set app language
                    detectLanguage(Settings.language);
                    // set hardware settings and usefull stuff
                    AdvSettings.setup(function() {
                        App.Trakt = App.Config.getProvider('metadata');
                        // check update
                        var updater = new App.Updater();
                        updater.update()
                            .catch(function(err) {
                                win.error(err);
                            });
                        // we skip the initDB (not needed in current version)
                        callback();
                    });

                });

            });
        });
        App.vent.on('shows:watched', _.bind(this.markEpisodeAsWatched, this));
        App.vent.on('shows:unwatched', _.bind(this.markEpisodeAsNotWatched, this));
        App.vent.on('movies:watched', _.bind(this.markMovieAsWatched, this));
    }
};