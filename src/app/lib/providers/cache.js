(function(App) {
    'use strict';

    var cache = {};

    function getProvider (name) {
        if (!name) {
            /* XXX(xaiki): this is for debug purposes, will it bite us later ? */
            console.error ('dumping provider cache');
            /* cache is actually private we need to copy it, this is a hack */
            return cache;
//            return _.map (cache, function (i) {return i;});
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
})(window.App);
