(function(App) {
    'use strict';
    var memoize = require ('memoizee');
    var cache = {};

    var Provider = function() {
        var memopts = {
            maxAge: 3600000, /* 1 hour */
            preFetch: 0.6,
            primitive: true
        };

        this.fetch = memoize(this.fetch.bind(this), memopts);
        this.detail = memoize(this.detail.bind(this), memopts);

    };

    function getProvider (name) {
        if (!name) {
            /* XXX(xaiki): this is for debug purposes, will it bite us later ? */
            console.error ('dumping provider cache');
            return cache;
        }

        if (cache[name]) {
            win.info ('Returning cached provider', name);
            return cache[name];
        }

        var provider = App.Providers[name];
        if (! provider) {
            console.error ('couldn\'t find provider', name);
            return null;
        }

        win.info ('Spawning new provider', name);
        cache[name] = new provider();
        //HACK(xaiki): set the provider name in the returned object.
        cache[name].name = name;
        return cache[name];
    }

    App.Providers.get = getProvider;
    App.Providers.Generic =  Provider;

})(window.App);
