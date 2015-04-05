(function (App) {
    'use strict';
    var memoize = require('memoizee');
    var cache = {};

    var Provider = function () {
        var memopts = {
            maxAge: 10 * 60 * 1000,
            /* 10 minutes */
            preFetch: 0.5,
            /* recache every 5 minutes */
            primitive: true
        };

        this.memfetch = memoize(this.fetch.bind(this), memopts);
        this.fetch = this._fetch.bind(this);

        this.detail = memoize(this.detail.bind(this), _.extend(memopts, {
            async: true
        }));
    };

    Provider.prototype._fetch = function (filters) {
        filters.toString = this.toString;
        var promise = this.memfetch(filters),
            _this = this;
        promise.catch(function (error) {
            // Delete the cached result if we get an error so retry will work
            _this.memfetch.delete(filters);
        });
        return promise;
    };

    Provider.prototype.toString = function (arg) {
        return JSON.stringify(this);
    };

    function getProvider(name) {
        if (!name) {
            /* XXX(xaiki): this is for debug purposes, will it bite us later ? */
            win.error('dumping provider cache');
            return cache;
        }

        if (cache[name]) {
            win.info('Returning cached provider', name);
            return cache[name];
        }

        var provider = App.Providers[name];
        if (!provider) {
            win.error('couldn\'t find provider', name);
            return null;
        }

        win.info('Spawning new provider', name);
        cache[name] = new provider();
        //HACK(xaiki): set the provider name in the returned object.
        cache[name].name = name;
        return cache[name];
    }

    function delProvider(name) {
        if (cache[name]) {
            win.info('Delete provider cache', name);
            return delete cache[name];
        }
    }

    App.Providers.get = getProvider;
    App.Providers.delete = delProvider;
    App.Providers.Generic = Provider;

})(window.App);
