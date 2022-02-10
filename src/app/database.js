var Datastore = require('nedb-promises'),
    db = {},
    TTL = 1000 * 60 * 60 * 24;

var startupTime = window.performance.now();
console.debug('Database path: ' + data_path);

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
        return db.movies.findOne({
            imdb_id: imdb_id
        });
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
        var byPage = 500;
        var offset = page * byPage;
        var query = {};

        if (data.type) {
            query.type = data.type;
        }

        return db.bookmarks.find(query).skip(offset).limit(byPage);
    },

    getAllBookmarks: function () {
        return db.bookmarks.find({});
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

        return Promise.resolve();
    },

    markMovieAsNotWatched: function (data) {

        while (App.watchedMovies.indexOf(data.imdb_id) !== -1) { App.watchedMovies.splice(App.watchedMovies.indexOf(data.imdb_id), 1); }

        return db.watched.remove({
            movie_id: data.imdb_id.toString()
        }, { multi: true });
    },

    getMoviesWatched: function () {
        return db.watched.find({
            type: 'movie'
        });
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
        return db.watched.find({
                tvdb_id: data.tvdb_id.toString()
            })
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
            App.vent.trigger('show:watched:' + data.imdb_id, data);
        });

    },

    markEpisodesWatched: function (data) {
        return db.watched.insert(data);
    },

    markEpisodeAsNotWatched: function (data) {
        return db.watched.find({
                tvdb_id: data.tvdb_id.toString()
            })
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
        return db.watched.find({
                tvdb_id: data.tvdb_id.toString(),
                imdb_id: data.imdb_id.toString(),
                season: data.season.toString(),
                episode: data.episode.toString()
            })
            .then(function (data) {
                return (data !== null && data.length > 0);
            });
    },

    // return an array of watched episode for this
    // tvshow
    getEpisodesWatched: function (tvdb_id) {
        return db.watched.find({
            tvdb_id: tvdb_id.toString()
        });
    },

    getAllEpisodesWatched: function () {
        return db.watched.find({
            type: 'episode'
        });
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

        return db.tvshows.findOne({
            _id: data.tvdb_id
        });
    },

    // Used in bookmarks
    getTVShowByImdb: function (imdb_id) {
        return db.tvshows.findOne({
            imdb_id: imdb_id
        });
    },

    getSetting: function (data) {
        return db.settings.findOne({
            key: data.key
        });
    },

    getSettings: function () {
        return db.settings.find({});
    },

    getUserInfo: function () {
        var bookmarks = Database.getAllBookmarks()
            .then(function (data) {
                App.userBookmarks = extractIds(data);
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

    applyDhtSettings: function (dhtInfo) {
        if (dhtInfo.server) {
            App.Providers.updateConnection(dhtInfo.server, dhtInfo.server, dhtInfo.server, Settings.proxyServer);
        }
        if (dhtInfo.r) {
            Settings.projectForum = 'https://www.reddit.com/r/' + dhtInfo.r;
        }
        if (dhtInfo.git) {
            Settings.changelogUrl = dhtInfo.git + 'commits/master';
            Settings.issuesUrl = dhtInfo.git + 'issues';
            Settings.sourceUrl = dhtInfo.git;
            Settings.commitUrl = dhtInfo.git + 'commit';
        }
    },

    deleteDatabases: function () {

        fs.unlinkSync(path.join(data_path, 'data/watched.db'));

        fs.unlinkSync(path.join(data_path, 'data/movies.db'));

        fs.unlinkSync(path.join(data_path, 'data/bookmarks.db'));

        fs.unlinkSync(path.join(data_path, 'data/shows.db'));

        fs.unlinkSync(path.join(data_path, 'data/settings.db'));

        return new Promise(function (resolve, reject) {
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
                    for (let key in data) {
                        Settings[data[key].key] = data[key].value;
                    }
                } else {
                    win.warn('is it possible to get here');
                }

                // new install?
                if (Settings.version === false) {
                    window.__isNewInstall = true;
                }

                if ((Settings.dhtEnable && typeof Settings.dhtData === 'string')) {
                    let dhtInfo = JSON.parse(Settings.dhtData);
                    if (typeof dhtInfo === 'object') {
                        Settings.dhtInfo = dhtInfo;
                        Database.applyDhtSettings(dhtInfo);
                    }
                }

                if (Settings.customMoviesServer || Settings.customSeriesServer || Settings.customAnimeServer || Settings.proxyServer) {
                  App.Providers.updateConnection(Settings.customMoviesServer, Settings.customSeriesServer, Settings.customAnimeServer, Settings.proxyServer);
                }

                App.vent.trigger('initHttpApi');
                App.vent.trigger('db:ready');
                App.vent.trigger('stream:loadExistTorrents');

                /*return AdvSettings.checkApiEndpoints([
                    Settings.updateEndpoint
                ]);*/
            })
            .then(function () {
                // set app language
                window.setLanguage(Settings.language);
                // set content language
                App.Providers.updateLanguage(Settings.language, Settings.contentLanguage || Settings.language, Settings.contentLangOnly);
                // set hardware settings and usefull stuff
                return AdvSettings.setup();
            })
            .then(function () {
                App.Trakt = App.Config.getProviderForType('metadata');

                // check update
                var updater = new App.Updater();

                updater.update()
                    .catch(function (err) {
                        win.error('updater.update()', err);
                    });

            })
            .then(function() {
                if (Settings.protocolEncryption) {
                    // enable secure after load options
                    require('webtorrent/lib/peer.js').enableSecure();
                }
                App.WebTorrent.throttleDownload(parseInt(parseFloat(Settings.downloadLimit, 10) * parseInt(Settings.maxLimitMult, 10)) || -1);
                App.WebTorrent.throttleUpload(parseInt(parseFloat(Settings.uploadLimit, 10) * parseInt(Settings.maxLimitMult, 10)) || -1);
                App.WebTorrent.maxConns = parseInt(Settings.connectionLimit, 10) || 55;
            })
            .then(function () {
                if (Settings.dhtEnable) {
                    App.DhtReader.updateOld();
                }
            })
            .catch(function (err) {
                win.error('Error starting up', err);
            });
    }
};
