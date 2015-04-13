(function (App) {
    'use strict';

    var request = require('request'),
        URI = require('URIjs'),
        Q = require('q'),
        _ = require('underscore'),
        inherits = require('util').inherits,
        sha1 = require('sha1');

    // Trakt v1 for metadata
    var API_ENDPOINT_v1 = URI('https://api.trakt.tv/'),
        API_KEY_v1 = '515a27ba95fbd83f20690e5c22bceaff0dfbde7c',
        API_PLUGIN_VERSION = AdvSettings.get('traktTvVersion'),
        PT_VERSION = AdvSettings.get('version');

    // Trakt v2
    var API_ENDPOINT = URI('https://api-v2launch.trakt.tv'),
        CLIENT_ID = 'c7e20abc718e46fc75399dd6688afca9ac83cd4519c9cb1fba862b37b8640e89',
        CLIENT_SECRET = '476cf15ed52542c2c8dc502821280aa5f61a012db57f1ed1f479aaf88ab385cb',
        REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

    function TraktTv() {
        App.Providers.CacheProviderV2.call(this, 'metadata');

        this.authenticated = false;

        this.watchlist = App.Providers.get('Watchlist');

        // Refresh token on startup
        // TODO: use traktTokenTTL to calc when to refresh
        if (AdvSettings.get('traktTokenRefresh') !== '') {
            this._authenticationPromise = this.post('oauth/token', {
                refresh_token: AdvSettings.get('traktTokenRefresh'),
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'refresh_token'
            }).then(function (data) {
                if (data.access_token && data.expires_in && data.refresh_token) {
                    self.authenticated = true;
                    App.vent.trigger('system:traktAuthenticated');
                    AdvSettings.set('traktToken', data.access_token);
                    AdvSettings.set('traktTokenTTL', data.expires_in);
                    AdvSettings.set('traktTokenRefresh', data.refresh_token);
                    return true;
                } else {
                    AdvSettings.set('traktToken', '');
                    AdvSettings.set('traktTokenTTL', '');
                    AdvSettings.set('traktTokenRefresh', '');
                    return false;
                }
            });
        }

        var self = this;
        // Bind all "sub" method calls to TraktTv
        _.each(this.movie, function (method, key) {
            self.movie[key] = method.bind(self);
        });
        _.each(this.show, function (method, key) {
            self.show[key] = method.bind(self);
        });
    }

    // Inherit the Cache Provider
    inherits(TraktTv, App.Providers.CacheProviderV2);

    function MergePromises(promises) {
        return Q.all(promises).then(function (results) {
            return _.unique(_.flatten(results));
        });
    }

    TraktTv.prototype.isAuthenticating = function () {
        return this._authenticationPromise && this._authenticationPromise.isPending();
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

    TraktTv.prototype.movie = {
        summary: function (id) {
            return this.callv1(['movie/summary.json', '{KEY}', id]);
        },
        listSummary: function (ids) {
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
        }
    };

    TraktTv.prototype.show = {
        summary: function (id) {
            return this.callv1(['show/summary.json', '{KEY}', id]);
        },
        listSummary: function (ids) {
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
        episodeSummary: function (id, season, episode) {
            return this.callv1(['show/episode/summary.json', '{KEY}', id, season, episode])
                .then(function (data) {
                    if (data.show && data.episode) {
                        return data;
                    } else {
                        return undefined;
                    }
                });
        }
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

        console.log(requestUri.toString());
        request({
            method: 'GET',
            url: requestUri.toString(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AdvSettings.get('traktToken'),
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

        console.log(requestUri.toString());
        request({
            method: 'POST',
            url: requestUri.toString(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AdvSettings.get('traktToken'),
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
                        self.authenticated = true;
                        App.vent.trigger('system:traktAuthenticated');
                        AdvSettings.set('traktToken', data.access_token);
                        AdvSettings.set('traktTokenTTL', data.expires_in);
                        AdvSettings.set('traktTokenRefresh', data.refresh_token);
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
            this.call('sync/playback/movies', {limit: 50}).then(function (results) {
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
            this.call('sync/playback/episodes', {limit: 50}).then(function (results) {
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

    App.Providers.Trakttv = TraktTv;

})(window.App);
