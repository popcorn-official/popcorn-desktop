var Datastore = require('nedb'),
    db = {},
    TTL = 1000 * 60 * 60 * 24;

var startupTime = window.performance.now();
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

function promisifyDatastore(datastore) {
    datastore.insert = Q.denodeify(datastore.insert, datastore);
    datastore.update = Q.denodeify(datastore.update, datastore);
    datastore.remove = Q.denodeify(datastore.remove, datastore);
}

promisifyDatastore(db.bookmarks);
promisifyDatastore(db.settings);
promisifyDatastore(db.tvshows);
promisifyDatastore(db.movies);
promisifyDatastore(db.watched);

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

// This utilizes the exec function on nedb to turn function calls into promises
var promisifyDb = function (obj) {
    return Q.Promise(function (resolve, reject) {
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
        return db.movies.insert(data);
    },

    deleteMovie: function (imdb_id) {
        return db.movies.remove({
            imdb_id: imdb_id
        });
    },

    getMovie: function (imdb_id) {
        return promisifyDb(db.movies.findOne({
            imdb_id: imdb_id
        }));
    },

    addBookmark: function (imdb_id, type) {
        App.userBookmarks.push(imdb_id);
        return db.bookmarks.insert({
            imdb_id: imdb_id,
            type: type
        });
    },

    deleteBookmark: function (imdb_id) {
        App.userBookmarks.splice(App.userBookmarks.indexOf(imdb_id), 1);
        return db.bookmarks.remove({
            imdb_id: imdb_id
        });
    },

    deleteBookmarks: function () {
        return db.bookmarks.remove({}, {
            multi: true
        });
    },

    deleteWatched: function () {
        return db.watched.remove({}, {
            multi: true
        });
    },

    // format: {page: page, keywords: title}
    getBookmarks: function (data) {
        var page = data.page - 1;
        var byPage = 50;
        var offset = page * byPage;
        var query = {};

        if (data.type) {
            query.type = data.type;
        }

        return promisifyDb(db.bookmarks.find(query).skip(offset).limit(byPage));
    },

    getAllBookmarks: function () {
        return promisifyDb(db.bookmarks.find({}))
            .then(function (data) {
                var bookmarks = [];
                if (data) {
                    bookmarks = extractIds(data);
                }

                return bookmarks;
            });
    },

    markMoviesWatched: function (data) {
        return db.watched.insert(data);
    },

    markMovieAsWatched: function (data) {
        if (data.imdb_id) {
            App.watchedMovies.push(data.imdb_id);

            return db.watched.insert({
                movie_id: data.imdb_id.toString(),
                date: new Date(),
                type: 'movie'
            });
        }

        win.warn('This shouldn\'t be called');

        return Q();
    },

    markMovieAsNotWatched: function (data) {

        App.watchedMovies.splice(App.watchedMovies.indexOf(data.imdb_id), 1);

        return db.watched.remove({
            movie_id: data.imdb_id.toString()
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
        return db.tvshows.insert(data);
    },

    updateTVShow: function (data) {
        return db.tvshows.update({
            imdb_id: data.imdb_id
        }, data);
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
                return db.watched.insert({
                    tvdb_id: data.tvdb_id.toString(),
                    imdb_id: data.imdb_id.toString(),
                    season: data.season.toString(),
                    episode: data.episode.toString(),
                    type: 'episode',
                    date: new Date()
                });
            })

        .then(function () {
            App.vent.trigger('show:watched:' + data.tvdb_id, data);
        });

    },

    markEpisodesWatched: function (data) {
        return db.watched.insert(data);
    },

    markEpisodeAsNotWatched: function (data) {
        return promisifyDb(db.watched.find({
                tvdb_id: data.tvdb_id.toString()
            }))
            .then(function (response) {
                if (response.length === 1) {
                    App.watchedShows.splice(App.watchedShows.indexOf(data.imdb_id.toString()), 1);
                }
            })
            .then(function () {
                return db.watched.remove({
                    tvdb_id: data.tvdb_id.toString(),
                    imdb_id: data.imdb_id.toString(),
                    season: data.season.toString(),
                    episode: data.episode.toString()
                });
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
                return (data !== null && data.length > 0);
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

    // Used in bookmarks
    deleteTVShow: function (imdb_id) {
        return db.tvshows.remove({
            imdb_id: imdb_id
        });
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

    getSetting: function (data) {
        return promisifyDb(db.settings.findOne({
            key: data.key
        }));
    },

    getSettings: function () {
        return promisifyDb(db.settings.find({}));
    },

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

        return Q.all([bookmarks, movies, episodes]);
    },

    // format: {key: key_name, value: settings_value}
    writeSetting: function (data) {
        return Database.getSetting({
                key: data.key
            })
            .then(function (result) {
                if (result) {
                    return db.settings.update({
                        'key': data.key
                    }, {
                        $set: {
                            'value': data.value
                        }
                    }, {});
                } else {
                    return db.settings.insert(data);
                }
            });
    },

    resetSettings: function () {
        return db.settings.remove({}, {
            multi: true
        });
    },

    deleteDatabases: function () {

        fs.unlinkSync(path.join(data_path, 'data/watched.db'));

        fs.unlinkSync(path.join(data_path, 'data/movies.db'));

        fs.unlinkSync(path.join(data_path, 'data/bookmarks.db'));

        fs.unlinkSync(path.join(data_path, 'data/shows.db'));

        fs.unlinkSync(path.join(data_path, 'data/settings.db'));

        return Q.Promise(function (resolve, reject) {
            var req = indexedDB.deleteDatabase(App.Config.cache.name);
            req.onsuccess = function () {
                resolve();
            };
            req.onerror = function () {
                resolve();
            };
        });

    },

    initialize: function () {
        App.vent.on('show:watched', _.bind(this.markEpisodeAsWatched, this));
        App.vent.on('show:unwatched', _.bind(this.markEpisodeAsNotWatched, this));
        App.vent.on('movie:watched', _.bind(this.markMovieAsWatched, this));
        App.vent.on('movie:unwatched', _.bind(this.markMovieAsNotWatched, this));

        // we'll intiatlize our settings and our API SSL Validation
        // we build our settings array
        return App.bootstrapPromise
            .then(Database.getUserInfo)
            .then(Database.getSettings)
            .then(function (data) {
                if (data !== null) {
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

                /*return AdvSettings.checkApiEndpoints([
                    Settings.updateEndpoint
                ]);*/
            })
            .then(function () {
                // set app language
                window.setLanguage(Settings.language);
                // set hardware settings and usefull stuff
                return AdvSettings.setup();
            })
            .then(function () {
                App.Trakt = App.Config.getProviderForType('metadata');
                App.TVShowTime = App.Config.getProviderForType('tvst');
                // check update
                var updater = new App.Updater();

                updater.update()
                    .catch(function (err) {
                        win.error('updater.update()', err);
                    });

            })
            .catch(function (err) {
                win.error('Error starting up', err);
            });
    }
};
