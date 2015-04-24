(function (App) {
    'use strict';

    var request = require('request'),
        URI = require('URIjs'),
        Q = require('q'),
        _ = require('underscore'),
        inherits = require('util').inherits;

    // Trakt v1 for metadata
    var API_ENDPOINT_v1 = URI('https://api.trakt.tv/'),
        API_KEY_v1 = '515a27ba95fbd83f20690e5c22bceaff0dfbde7c',
        API_PLUGIN_VERSION = Settings.traktTvVersion,
        PT_VERSION = Settings.version;

    // Trakt v2
    var API_ENDPOINT = URI('https://api-v2launch.trakt.tv'),
        CLIENT_ID = 'c7e20abc718e46fc75399dd6688afca9ac83cd4519c9cb1fba862b37b8640e89',
        CLIENT_SECRET = '476cf15ed52542c2c8dc502821280aa5f61a012db57f1ed1f479aaf88ab385cb',
        REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

    function TraktTv() {
        App.Providers.CacheProviderV2.call(this, 'metadata');

        this.authenticated = false;

        this.watchlist = App.Providers.get('Watchlist');

        var self = this;
        // Bind all "sub" method calls to TraktTv
        _.each(this.movie, function (method, key) {
            self.movie[key] = method.bind(self);
        });
        _.each(this.show, function (method, key) {
            self.show[key] = method.bind(self);
        });

        // Refresh token on startup if needed
        setTimeout(function () {
            self.checkToken();
        }, 500);
    }

    // Inherit the Cache Provider
    inherits(TraktTv, App.Providers.CacheProviderV2);

    function MergePromises(promises) {
        return Q.all(promises).then(function (results) {
            return _.unique(_.flatten(results));
        });
    }

    TraktTv.prototype.checkToken = function () {
        var self = this;
        var today = new Date();
        if (Settings.traktTokenTTL <= today.valueOf() && Settings.traktTokenRefresh !== '') {
            win.debug('Trakt: refreshing access token');
            this._authenticationPromise = self.post('oauth/token', {
                refresh_token: Settings.traktTokenRefresh,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'refresh_token'
            }).then(function (data) {
                if (data.access_token && data.expires_in && data.refresh_token) {
                    Settings.traktToken = data.access_token;
                    AdvSettings.set('traktToken', data.access_token);
                    AdvSettings.set('traktTokenRefresh', data.refresh_token);
                    AdvSettings.set('traktTokenTTL', today.valueOf() + data.expires_in);
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
            App.vent.trigger('system:traktAuthenticated');
        }
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
     * Trakt v1
     * METHODS
     */

    TraktTv.prototype.callv1 = function (endpoint, getVariables) {
        var defer = Q.defer();

        getVariables = getVariables || {};

        if (Array.isArray(endpoint)) {
            endpoint = endpoint.map(function (val) {
                if (val === '{KEY}') {
                    return API_KEY_v1;
                }
                return val.toString();
            });
        } else {
            endpoint = endpoint.replace('{KEY}', API_KEY_v1);
        }

        var requestUri = API_ENDPOINT_v1.clone()
            .segment(endpoint)
            .addQuery(getVariables);

        request(requestUri.toString(), {
            json: true
        }, function (err, res, body) {
            if (err) {
                defer.reject(err);
            } else if (res.statusCode >= 400 || !body) {
                defer.resolve({});
            } else {
                defer.resolve(body);
            }
        });

        return defer.promise;
    };

    /*
     * Trakt v2
     * METHODS
     */

    TraktTv.prototype.call = function (endpoint, getVariables) {
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
                defer.resolve(JSON.parse(body));
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
                defer.resolve(JSON.parse(body));
            }
        });

        return defer.promise;
    };

    TraktTv.prototype.authorize = function () {
        var defer = Q.defer();
        var url = false;

        var API_URI = 'http://trakt.tv';
        var OAUTH_URI = API_URI + '/oauth/authorize?response_type=code&client_id=' + CLIENT_ID;

        var gui = require('nw.gui');
        gui.App.addOriginAccessWhitelistEntry(API_URI, 'app', 'host', true);
        window.loginWindow = gui.Window.open(OAUTH_URI + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI), {
            position: 'center',
            frame: true,
            focus: true,
            toolbar: false,
            resizable: false,
            show_in_taskbar: false,
            width: 600,
            height: 600
        });

        window.loginWindow.on('loaded', function () {
            url = window.loginWindow.window.document.URL;

            if (url.indexOf('&') === -1 && url.indexOf('auth/signin') === -1) {
                url = url.split('/');
                url = url[url.length - 1];
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
                defer.reject('window closed without exchange token');
            }
        });

        return defer.promise;
    };

    TraktTv.prototype.authenticate = function () {
        var defer = Q.defer();
        var self = this;

        this.authorize()
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
                        AdvSettings.set('traktToken', data.access_token);
                        AdvSettings.set('traktTokenRefresh', data.refresh_token);
                        var today = new Date();
                        AdvSettings.set('traktTokenTTL', today.valueOf() + data.expires_in);
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
    };

    TraktTv.prototype.sync = function () {
        var that = this;
        var now = new Date();

        return Q()
            .then(function () {
                AdvSettings.set('traktLastSync', now.valueOf());
                return Q.all([that.movie.sync(), that.show.sync()]);
            });
    };

    TraktTv.prototype.movie = {
        summary /* still v1 */ : function (id) {
            return this.callv1(['movie/summary.json', '{KEY}', id]);
        },
        listSummary /* still v1 */ : function (ids) {
            if (_.isEmpty(ids)) {
                return Q([]);
            }

            var self = this;
            return this.cache('imdb_id', ids, function (ids) {
                if (_.isEmpty(ids)) {
                    return Q([]);
                }
                return self.callv1(['movie/summaries.json', '{KEY}', ids.join(','), 'full']);
            });
        },
        seen: function (id) {
            return this.post('sync/history', {
                movies: [{
                    ids: {
                        imdb: id
                    }
                }]
            });
        },
        unseen: function (id) {
            return this.post('sync/history/remove', {
                movies: [{
                    ids: {
                        imdb: id
                    }
                }]
            });
        },
        getWatched: function () {
            return this.call('sync/watched/movies')
                .then(function (data) {
                    return data;
                });
        },
        sync: function () {
            return this.movie.getWatched()
                .then(function (data) {
                    var watched = [];

                    if (data) {
                        var movie;
                        for (var m in data) {
                            movie = data[m].movie;
                            watched.push({
                                movie_id: movie.ids.imdb.toString(),
                                date: new Date(),
                                type: 'movie'
                            });
                        }
                    }

                    return watched;
                })
                .then(function (traktWatched) {
                    win.debug('Trakt: marked %s movie(s) as watched', traktWatched.length);
                    return Database.markMoviesWatched(traktWatched);
                });
        }
    };

    TraktTv.prototype.show = {
        summary /* still v1 */ : function (id) {
            return this.callv1(['show/summary.json', '{KEY}', id]);
        },
        listSummary /* still v1 */ : function (ids) {
            if (_.isEmpty(ids)) {
                return Q([]);
            }

            var self = this;
            return this.cache(ids, function (ids) {
                if (_.isEmpty(ids)) {
                    return Q([]);
                }
                return self.callv1(['show/summaries.json', '{KEY}', ids.join(','), 'full']);
            });
        },
        episodeSummary /* still v1 */ : function (id, season, episode) {
            return this.callv1(['show/episode/summary.json', '{KEY}', id, season, episode])
                .then(function (data) {
                    if (data.show && data.episode) {
                        return data;
                    } else {
                        return undefined;
                    }
                });
        },
        episodeSeen: function (id) {
            return this.post('sync/history', {
                episodes: [{
                    ids: {
                        tvdb: id
                    }
                }]
            });
        },
        episodeUnseen: function (id) {
            return this.post('sync/history/remove', {
                episodes: [{
                    ids: {
                        tvdb: id
                    }
                }]
            });
        },
        getWatched: function () {
            return this.call('sync/watched/shows')
                .then(function (data) {
                    return data;
                });
        },
        sync: function () {
            return this.show.getWatched()
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
                                    win.warn('Cannot sync a show (' + show.show.title + '), the problem is: ' + e.message + '. Continuing sync without this show...');
                                    break;
                                }
                            }
                        }
                    }

                    return watched;
                })
                .then(function (traktWatched) {
                    // Insert them locally
                    win.debug('Trakt: marked %s episode(s) as watched', traktWatched.length);
                    return Database.markEpisodesWatched(traktWatched);
                });
        },
        calendar: function (startDate) {
            var endpoint = 'calendars/my/shows';

            if (startDate) {
                endpoint += '/' + startDate;
            }

            return this.call(endpoint)
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

    TraktTv.prototype.playback = function (type, id) {
        var defer = Q.defer();

        if (type === 'movie') {
            this.call('sync/playback/movies', {
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
            this.call('sync/playback/episodes', {
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
    };


    /*
     *  General
     * FUNCTIONS
     */

    TraktTv.resizeImage = function (imageUrl, size) {
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
            break;
        case 'seen':
            /* falls through */
        default:
            App.Trakt.show.episodeSeen(show.episode_id);
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
            App.Trakt.show.episodeUnseen(show.episode_id);
            break;
        }
    }

    function onMoviesWatched(movie, channel) {
        win.debug('Mark Movie as watched on channel:', channel);
        switch (channel) {
        case 'database':
            break;
        case 'seen':
            /* falls through */
        default:
            App.Trakt.movie.seen(movie.imdb_id);
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
            App.Trakt.movie.unseen(movie.imdb_id);
            break;
        }
    }

    App.vent.on('show:watched', onShowWatched);
    App.vent.on('show:unwatched', onShowUnWatched);
    App.vent.on('movie:watched', onMoviesWatched);
    App.vent.on('movie:unwatched', onMoviesUnWatched);

    App.Providers.Trakttv = TraktTv;

})(window.App);
