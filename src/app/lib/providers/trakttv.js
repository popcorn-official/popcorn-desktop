(function (App) {
    'use strict';

    var API_ENDPOINT = URI('https://api-v2launch.trakt.tv'),
        CLIENT_ID = '647c69e4ed1ad13393bf6edd9d8f9fb6fe9faf405b44320a6b71ab960b4540a2',
        CLIENT_SECRET = 'f55b0a53c63af683588b47f6de94226b7572a6f83f40bd44c58a7c83fe1f2cb1',
        REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

    var isValid = function (id) {
        if (!id || id.toString().indexOf('mal') > -1 || id.toString().indexOf('-') > -1) {
            return false;
        } else {
            return true;
        }
    };

    function TraktTv() {
        App.Providers.CacheProviderV2.call(this, 'metadata');

        this.authenticated = false;

        var self = this;
        // Bind all "sub" method calls to TraktTv
        _.each(this.calendars, function (method, key) {
            self.calendars[key] = method.bind(self);
        });
        _.each(this.movies, function (method, key) {
            self.movies[key] = method.bind(self);
        });
        _.each(this.recommendations, function (method, key) {
            self.recommendations[key] = method.bind(self);
        });
        _.each(this.shows, function (method, key) {
            self.shows[key] = method.bind(self);
        });
        _.each(this.episodes, function (method, key) {
            self.episodes[key] = method.bind(self);
        });
        _.each(this.sync, function (method, key) {
            self.sync[key] = method.bind(self);
        });

        // Bind all custom functions to TraktTv
        _.each(this.oauth, function (method, key) {
            self.oauth[key] = method.bind(self);
        });
        _.each(this.syncTrakt, function (method, key) {
            self.syncTrakt[key] = method.bind(self);
        });

        // Refresh token on startup if needed
        setTimeout(function () {
            self.oauth.checkToken();
        }, 500);
    }

    /*
     * Cache
     */

    inherits(TraktTv, App.Providers.CacheProviderV2);

    function MergePromises(promises) {
        return Q.all(promises).then(function (results) {
            return _.unique(_.flatten(results));
        });
    }

    TraktTv.prototype.config = {
        name: 'Trakttv'
    };

    TraktTv.prototype.cache = function (key, ids, func) {
        var self = this;
        return this.fetch(ids).then(function (items) {
            var nonCachedIds = _.difference(ids, _.pluck(items, key));
            return MergePromises([
                Q(items),
                func(nonCachedIds).then(self.store.bind(self, key))
            ]);
        });
    };

    /*
     * Trakt v2
     * METHODS (http://docs.trakt.apiary.io/)
     */

    TraktTv.prototype.get = function (endpoint, getVariables) {
        var defer = Q.defer();

        getVariables = getVariables || {};


        var requestUri = API_ENDPOINT.clone()
            .segment(endpoint)
            .addQuery(getVariables);

        request({
            method: 'GET',
            url: requestUri.toString(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Settings.traktToken,
                'trakt-api-version': '2',
                'trakt-api-key': CLIENT_ID
            }
        }, function (error, response, body) {
            if (error || !body) {
                defer.reject(error);
            } else if (response.statusCode >= 400) {
                defer.resolve({});
            } else {
                defer.resolve(Common.sanitize(JSON.parse(body)));
            }
        });


        return defer.promise;
    };

    TraktTv.prototype.post = function (endpoint, postVariables) {
        var defer = Q.defer();

        postVariables = postVariables || {};

        var requestUri = API_ENDPOINT.clone()
            .segment(endpoint);

        request({
            method: 'POST',
            url: requestUri.toString(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Settings.traktToken,
                'trakt-api-version': '2',
                'trakt-api-key': CLIENT_ID
            },
            body: JSON.stringify(postVariables)
        }, function (error, response, body) {
            if (error || !body) {
                defer.reject(error);
            } else if (response.statusCode >= 400) {
                defer.resolve({});
            } else {
                defer.resolve(Common.sanitize(JSON.parse(body)));
            }
        });

        return defer.promise;
    };

    TraktTv.prototype.delete = function (endpoint, getVariables) {
        var defer = Q.defer();

        getVariables = getVariables || {};


        var requestUri = API_ENDPOINT.clone()
            .segment(endpoint)
            .addQuery(getVariables);

        request({
            method: 'DELETE',
            url: requestUri.toString(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Settings.traktToken,
                'trakt-api-version': '2',
                'trakt-api-key': CLIENT_ID
            }
        }, function (error, response, body) {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve({});
            }
        });


        return defer.promise;
    };

    TraktTv.prototype.calendars = {
        myShows: function (startDate, days) {
            var endpoint = 'calendars/my/shows';

            if (startDate && days) {
                endpoint += '/' + startDate + '/' + days;
            }

            return this.get(endpoint)
                .then(function (item) {
                    var calendar = [];
                    for (var i in item) {
                        calendar.push({
                            show_title: item[i].show.title,
                            show_id: item[i].show.ids.imdb,
                            aired: item[i].first_aired.split('T')[0],
                            episode_title: item[i].episode.title,
                            season: item[i].episode.season,
                            episode: item[i].episode.number,
                        });
                    }
                    return calendar;
                });
        }
    };

    TraktTv.prototype.movies = {
        summary: function (id) {
            return this.get('movies/' + id, {
                extended: 'full,images'
            });
        },
        aliases: function (id) {
            return this.get('movies/' + id + '/aliases');
        },
        translations: function (id, lang) {
            return this.get('movies/' + id + '/translations/' + lang);
        },
        comments: function (id) {
            return this.get('movies/' + id + '/comments');
        },
        related: function (id) {
            return this.get('movies/' + id + '/related');
        }
    };

    TraktTv.prototype.recommendations = {
        movies: function () {
            return this.get('recommendations/movies', {
                extended: 'full,images'
            });
        },
        hideMovie: function (id) {
            return this.delete('recommendations/movies/' + id);
        },
        shows: function () {
            return this.get('recommendations/shows', {
                extended: 'full,images'
            });
        },
        hideShow: function (id) {
            return this.delete('recommendations/shows/' + id);
        },
    };

    TraktTv.prototype.scrobble = function (action, type, id, progress) {
        if (type === 'movie') {
            return this.post('scrobble/' + action, {
                movie: {
                    ids: {
                        imdb: id
                    }
                },
                progress: progress
            });
        }
        if (type === 'episode') {
            return this.post('scrobble/' + action, {
                episode: {
                    ids: {
                        tvdb: id
                    }
                },
                progress: progress
            });
        }
    };

    TraktTv.prototype.search = function (query, type, year) {
        return this.get('search', {
            query: query,
            type: type,
            year: year
        });
    };

    TraktTv.prototype.shows = {
        summary: function (id) {
            return this.get('shows/' + id, {
                extended: 'full,images'
            });
        },
        aliases: function (id) {
            return this.get('shows/' + id + '/aliases');
        },
        translations: function (id, lang) {
            return this.get('shows/' + id + '/translations/' + lang);
        },
        comments: function (id) {
            return this.get('shows/' + id + '/comments');
        },
        watchedProgress: function (id) {
            if (!id) {
                return Q();
            }
            return this.get('shows/' + id + '/progress/watched');
        },
        updates: function (startDate) {
            return this.get('shows/updates/' + startDate)
                .then(function (data) {
                    return data;
                });
        },
        related: function (id) {
            return this.get('shows/' + id + '/related');
        }
    };

    TraktTv.prototype.episodes = {
        summary: function (id, season, episode) {
            return this.get('shows/' + id + '/seasons/' + season + '/episodes/' + episode, {
                extended: 'full,images'
            });
        }
    };

    TraktTv.prototype.sync = {
        lastActivities: function () {
            var defer = Q.defer();
            this.get('sync/last_activities')
                .then(function (data) {
                    defer.resolve(data);
                });
            return defer.promise;
        },
        playback: function (type, id) {
            var defer = Q.defer();

            if (type === 'movie') {
                this.get('sync/playback/movies', {
                    limit: 50
                }).then(function (results) {
                    results.forEach(function (result) {
                        if (result.movie.ids.imdb.toString() === id) {
                            defer.resolve(result.progress);
                        }
                    });
                }).catch(function (err) {
                    defer.reject(err);
                });
            }

            if (type === 'episode') {
                this.get('sync/playback/episodes', {
                    limit: 50
                }).then(function (results) {
                    results.forEach(function (result) {
                        if (result.episode.ids.tvdb.toString() === id) {
                            defer.resolve(result.progress);
                        }
                    });
                }).catch(function (err) {
                    defer.reject(err);
                });
            }

            return defer.promise;
        },
        getWatched: function (type) {
            if (type === 'movies') {
                return this.get('sync/watched/movies')
                    .then(function (data) {
                        return data;
                    });
            }
            if (type === 'shows') {
                return this.get('sync/watched/shows')
                    .then(function (data) {
                        return data;
                    });
            }
        },
        addToHistory: function (type, id) {
            if (type === 'movie') {
                return this.post('sync/history', {
                    movies: [{
                        ids: {
                            imdb: id
                        }
                    }]
                });
            }
            if (type === 'episode') {
                return this.post('sync/history', {
                    episodes: [{
                        ids: {
                            tvdb: id
                        }
                    }]
                });
            }
        },
        removeFromHistory: function (type, id) {
            if (type === 'movie') {
                return this.post('sync/history/remove', {
                    movies: [{
                        ids: {
                            imdb: id
                        }
                    }]
                });
            }
            if (type === 'episode') {
                return this.post('sync/history/remove', {
                    episodes: [{
                        ids: {
                            tvdb: id
                        }
                    }]
                });
            }
        },
        getWatchlist: function (type) {
            return this.get('sync/watchlist/' + type);
        }
    };

    TraktTv.prototype.users = {
        hiddenItems: function (type) {
            return this.get('users/hidden/' + type)
                .then(function (data) {
                    return data;
                });
        }
    };

    /*
     *  General
     * FUNCTIONS
     */

    TraktTv.prototype.oauth = {
        authenticate: function () {
            var defer = Q.defer();
            var self = this;

            this.oauth.authorize()
                .then(function (token) {
                    self.post('oauth/token', {
                        code: token,
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        redirect_uri: REDIRECT_URI,
                        grant_type: 'authorization_code'
                    }).then(function (data) {
                        if (data.access_token && data.expires_in && data.refresh_token) {
                            Settings.traktToken = data.access_token;
                            trakt.import_token({
                                expires: new Date().valueOf() + data.expires_in * 1000,
                                access_token: data.access_token,
                                refresh_token: data.refresh_token
                            });
                            AdvSettings.set('traktToken', data.access_token);
                            AdvSettings.set('traktTokenRefresh', data.refresh_token);
                            AdvSettings.set('traktTokenTTL', new Date().valueOf() + data.expires_in * 1000);
                            self.authenticated = true;
                            App.vent.trigger('system:traktAuthenticated');
                            defer.resolve(true);
                        } else {
                            AdvSettings.set('traktToken', '');
                            AdvSettings.set('traktTokenTTL', '');
                            AdvSettings.set('traktTokenRefresh', '');
                            defer.reject('sent back no token');
                        }
                    });
                })
                .catch(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        },
        authorize: function () {
            var defer = Q.defer();
            var url = false;

            var API_URI = 'https://trakt.tv';
            var OAUTH_URI = API_URI + '/oauth/authorize?response_type=code&client_id=' + CLIENT_ID;

            gui.App.addOriginAccessWhitelistEntry(API_URI, 'app', 'host', true);
            window.loginWindow = gui.Window.open(OAUTH_URI + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI), {
                position: 'center',
                focus: true,
                title: 'Trakt.tv',
                icon: 'src/app/images/icon.png',
                toolbar: false,
                resizable: false,
                width: 580,
                height: 640
            });

            window.loginWindow.on('loaded', function () {
                url = window.loginWindow.window.document.URL;

                if (url.indexOf('&') === -1 && url.indexOf('auth/signin') === -1) {
                    if (url.indexOf('oauth/authorize/') !== -1) {
                        url = url.split('/');
                        url = url[url.length - 1];
                    } else {
                        gui.Shell.openExternal(url);
                    }
                    this.close(true);
                } else {
                    url = false;
                }
            });

            window.loginWindow.on('closed', function () {
                if (url) {
                    defer.resolve(url);
                } else {
                    AdvSettings.set('traktToken', '');
                    AdvSettings.set('traktTokenTTL', '');
                    AdvSettings.set('traktTokenRefresh', '');
                    defer.reject('Trakt window closed without exchange token');
                }
            });

            return defer.promise;
        },
        checkToken: function () {
            var self = this;
            if (Settings.traktTokenTTL <= new Date().valueOf() && Settings.traktTokenRefresh !== '') {
                console.info('Trakt: refreshing access token');
                this._authenticationPromise = self.post('oauth/token', {
                    refresh_token: Settings.traktTokenRefresh,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'refresh_token'
                }).then(function (data) {
                    if (data.access_token && data.expires_in && data.refresh_token) {
                        Settings.traktToken = data.access_token;
                        trakt.import_token({
                            expires: new Date().valueOf() + data.expires_in * 1000,
                            access_token: data.access_token,
                            refresh_token: data.refresh_token
                        });
                        AdvSettings.set('traktToken', data.access_token);
                        AdvSettings.set('traktTokenRefresh', data.refresh_token);
                        AdvSettings.set('traktTokenTTL', new Date().valueOf() + data.expires_in * 1000);
                        self.authenticated = true;
                        App.vent.trigger('system:traktAuthenticated');
                        return true;
                    } else {
                        AdvSettings.set('traktToken', '');
                        AdvSettings.set('traktTokenTTL', '');
                        AdvSettings.set('traktTokenRefresh', '');
                        return false;
                    }
                });
            } else if (Settings.traktToken !== '') {
                this.authenticated = true;
                trakt.import_token({
                    expires: Settings.traktTokenTTL,
                    access_token: Settings.traktToken,
                    refresh_token: Settings.traktTokenRefresh
                });
                App.vent.trigger('system:traktAuthenticated');
            }
        }
    };

    TraktTv.prototype.syncTrakt = {
        isSyncing: function () {
            return this.syncing && this.syncing.isPending();
        },
        all: function () {
            var self = this;
            AdvSettings.set('traktLastSync', new Date().valueOf());
            return this.syncing = Q.all([self.syncTrakt.movies(), self.syncTrakt.shows()]);
        },
        movies: function () {
            return this.sync.getWatched('movies')
                .then(function (data) {
                    var watched = [];

                    if (data) {
                        var movie;
                        for (var m in data) {
                            try { //some movies don't have imdbid
                                movie = data[m].movie;
                                watched.push({
                                    movie_id: movie.ids.imdb.toString(),
                                    date: new Date(),
                                    type: 'movie'
                                });
                            } catch (e) {
                                console.warn('Cannot sync a movie (' + data[m].movie.title + '), the problem is: ' + e.message + '. Continuing sync without this movie...');
                            }
                        }
                    }

                    return watched;
                })
                .then(function (traktWatched) {
                    console.debug('Trakt: marked %s movie(s) as watched', traktWatched.length);
                    return Database.markMoviesWatched(traktWatched);
                });
        },
        shows: function () {
            return this.sync.getWatched('shows')
                .then(function (data) {
                    // Format them for insertion
                    var watched = [];

                    if (data) {
                        var show;
                        var season;
                        for (var d in data) {
                            show = data[d];
                            for (var s in show.seasons) {
                                season = show.seasons[s];
                                try { //some shows don't return IMDB
                                    for (var e in season.episodes) {
                                        watched.push({
                                            tvdb_id: show.show.ids.tvdb.toString(),
                                            imdb_id: show.show.ids.imdb.toString(),
                                            season: season.number.toString(),
                                            episode: season.episodes[e].number.toString(),
                                            type: 'episode',
                                            date: new Date()
                                        });
                                    }
                                } catch (e) {
                                    console.warn('Cannot sync a show (' + show.show.title + '), the problem is: ' + e.message + '. Continuing sync without this show...');
                                    break;
                                }
                            }
                        }
                    }

                    return watched;
                })
                .then(function (traktWatched) {
                    // Insert them locally
                    console.debug('Trakt: marked %s episode(s) as watched', traktWatched.length);
                    return Database.markEpisodesWatched(traktWatched);
                });
        }
    };

    TraktTv.prototype.resizeImage = function (imageUrl, size) {
        if (imageUrl === undefined) {
            return imageUrl;
        }

        var uri = URI(imageUrl),
            ext = uri.suffix(),
            file = uri.filename().split('.' + ext)[0];

        // Don't resize images that don't come from trakt
        //  eg. YTS Movie Covers
        if (imageUrl.indexOf('placeholders/original/fanart') !== -1) {
            return 'images/bg-header.jpg'.toString();
        } else if (imageUrl.indexOf('placeholders/original/poster') !== -1) {
            return 'images/posterholder.png'.toString();
        } else if (uri.domain() !== 'trakt.us') {
            return imageUrl;
        }

        var existingIndex = 0;
        if ((existingIndex = file.search('-\\d\\d\\d$')) !== -1) {
            file = file.slice(0, existingIndex);
        }

        // reset
        uri.pathname(uri.pathname().toString().replace(/thumb|medium/, 'original'));

        if (!size) {
            if (ScreenResolution.SD || ScreenResolution.HD) {
                uri.pathname(uri.pathname().toString().replace(/original/, 'thumb'));
            } else if (ScreenResolution.FullHD) {
                uri.pathname(uri.pathname().toString().replace(/original/, 'medium'));
            } else if (ScreenResolution.QuadHD || ScreenResolution.UltraHD || ScreenResolution.Retina) {
                //keep original
            } else {
                //default to medium
                win.debug('ScreenResolution unknown, using \'medium\' image size');
                uri.pathname(uri.pathname().toString().replace(/original/, 'medium'));
            }
        } else {
            if (size === 'thumb') {
                uri.pathname(uri.pathname().toString().replace(/original/, 'thumb'));
            } else if (size === 'medium') {
                uri.pathname(uri.pathname().toString().replace(/original/, 'medium'));
            } else {
                //keep original
            }
        }

        if (imageUrl === undefined) {
            return 'images/posterholder.png'.toString();
        } else {
            return uri.filename(file + '.' + ext).toString();
        }
    };

    function onShowWatched(show, channel) {
        win.debug('Mark Episode as watched on channel:', channel);
        switch (channel) {
        case 'database':
            setTimeout(function () {
                App.Providers.get('Watchlist').fetch({
                    update: show.imdb_id
                }).then(function () {
                    App.vent.trigger('watchlist:list');
                });
            }, 2000);
            break;
        case 'seen':
            /* falls through */
        default:
            App.Trakt.sync.addToHistory('episode', show.episode_id);
            break;
        }
    }

    function onShowUnWatched(show, channel) {
        win.debug('Mark Episode as unwatched on channel:', channel);
        switch (channel) {
        case 'database':
            break;
        case 'seen':
            /* falls through */
        default:
            App.Trakt.sync.removeFromHistory('episode', show.episode_id);
            break;
        }
    }

    function onMoviesWatched(movie, channel) {
        win.debug('Mark Movie as watched on channel:', channel);
        switch (channel) {
        case 'database':
            try {
                switch (Settings.watchedCovers) {
                case 'fade':
                    $('li[data-imdb-id="' + App.MovieDetailView.model.get('imdb_id') + '"] .actions-watched').addClass('selected');
                    $('li[data-imdb-id="' + App.MovieDetailView.model.get('imdb_id') + '"]').addClass('watched');
                    break;
                case 'hide':
                    $('li[data-imdb-id="' + App.MovieDetailView.model.get('imdb_id') + '"]').remove();
                    break;
                }
                $('.watched-toggle').addClass('selected').text(i18n.__('Seen'));
                App.MovieDetailView.model.set('watched', true);
            } catch (e) {}
            break;
        case 'seen':
            /* falls through */
        default:
            App.Trakt.sync.addToHistory('movie', movie.imdb_id);
            break;
        }
    }

    function onMoviesUnWatched(movie, channel) {
        win.debug('Mark Movie as unwatched on channel:', channel);
        switch (channel) {
        case 'database':
            break;
        case 'seen':
            /* falls through */
        default:
            App.Trakt.sync.removeFromHistory('movie', movie.imdb_id);
            break;
        }
    }

    App.vent.on('show:watched', onShowWatched);
    App.vent.on('show:unwatched', onShowUnWatched);
    App.vent.on('movie:watched', onMoviesWatched);
    App.vent.on('movie:unwatched', onMoviesUnWatched);

    App.Providers.Trakttv = TraktTv;
    App.Providers.install(TraktTv);
})(window.App);
