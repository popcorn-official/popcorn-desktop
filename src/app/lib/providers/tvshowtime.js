(function (App) {
    'use strict';

    var PT_VERSION = Settings.version,
        API_ENDPOINT = URI('https://api.tvshowtime.com/v1'),
        API_CLIENT_ID = 'iM2Vxlwr93imH7nwrTEZ',
        API_CLIENT_SECRET = 'ghmK6ueMJjQLHBwsaao1tw3HUF7JVp_GQTwDwhCn';

    function TVShowTime() {
        App.Providers.CacheProviderV2.call(this, 'metadata');

        var tvstAccessToken = AdvSettings.get('tvstAccessToken');
        if (tvstAccessToken !== '') {
            this.authenticated = true;
            App.vent.trigger('system:tvstAuthenticated');
            this._credentials = {
                token: tvstAccessToken
            };

        } else {
            this.authenticated = false;
            this._credentials = {
                token: ''
            };
        }
    }
    // Inherit the Cache Provider
    inherits(TVShowTime, App.Providers.CacheProviderV2);

    TVShowTime.prototype.config = {
        name: 'TVShowTime'
    };

    TVShowTime.prototype.post = function (endpoint, postVariables) {
        var defer = Q.defer();

        postVariables = postVariables || {};

        var requestUri = API_ENDPOINT.clone()
            .segment(endpoint);

        request.post(requestUri.toString(), {
            form: postVariables
        }, function (err, res, body) {
            if (err || !body || res.statusCode >= 400) {
                defer.reject(err);
            } else {
                defer.resolve(body);
            }
        });

        return defer.promise;
    };

    TVShowTime.prototype.authenticate = function (callback) {
        var self = this;
        this
            .post('oauth/device/code', {
                'client_id': API_CLIENT_ID
            })
            .then(function (data) {
                data = Common.sanitize(JSON.parse(data));
                if (data.result === 'OK') {
                    var activateUri = data.verification_url + '?user_code=' + data.user_code;
                    self.oauthAuthorizing = setInterval(function () {
                        self.post('oauth/access_token', {
                            'client_id': API_CLIENT_ID,
                            'client_secret': API_CLIENT_SECRET,
                            'code': data.device_code
                        }).then(function (data) {
                            data = JSON.parse(data);
                            if (data.result === 'OK') {
                                clearInterval(self.oauthAuthorizing);
                                self._credentials.token = data.access_token;
                                self.authenticated = true;
                                App.vent.trigger('system:tvstAuthenticated');
                                // Store the credentials (hashed ofc)
                                AdvSettings.set('tvstAccessToken', data.access_token);
                            }
                        });
                    }, (data.interval + 1) * 1000);
                    callback(activateUri);
                }
            });
    };


    TVShowTime.prototype.disconnect = function (callback) {
        this.authenticated = false;
        AdvSettings.set('tvstAccessToken', '');
        callback();
    };


    TVShowTime.prototype.checkin = function (show) {
        this
            .post('checkin', {
                'show_id': show.tvdb_id,
                'season_number': show.season,
                'number': show.episode,
                'access_token': this._credentials.token
            })
            .then(function (data) {
                //console.log(data);
            });
    };

    TVShowTime.prototype.checkout = function (show) {
        this
            .post('checkout', {
                'show_id': show.tvdb_id,
                'season_number': show.season,
                'number': show.episode,
                'access_token': this._credentials.token
            })
            .then(function (data) {
                //console.log(data);
            });
    };

    function onShowWatched(show, channel) {
        if (App.TVShowTime.authenticated) {
            App.TVShowTime.checkin(show);
        }
    }

    function onShowUnWatched(show, channel) {
        if (App.TVShowTime.authenticated) {
            App.TVShowTime.checkout(show);
        }
    }

    App.vent.on('show:watched', onShowWatched);
    App.vent.on('show:unwatched', onShowUnWatched);

    App.Providers.TVShowTime = TVShowTime;
    App.Providers.install(TVShowTime);

})(window.App);
