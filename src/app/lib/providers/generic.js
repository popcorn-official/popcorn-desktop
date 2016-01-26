(function (App) {
    'use strict';
    var fs=require('fs');
    var cache = App.Providers._cache = {};
    var registry = App.Providers._registry = {};

    App.Providers.Generic = require('butter-provider');

    App.ProviderTypes = {
        'tvshow': 'Series',
        'movie': 'Movies',
        'anime': 'Anime',
        'indie': 'Indie'
    };

    function getProvider(name) {
        if (!name) {
            /* XXX(xaiki): this is for debug purposes, will it bite us later ? */
            /* XXX(vankasteelj): it did. */
            win.error('asked for an empty provider, this should never happen, dumping provider cache and registry', cache, registry);
            return cache;
        }

        var tokenize = name.split('?');

        // XXX:reimplement querystring.parse to not escape
        var args = {}
        tokenize[1] && tokenize[1].split('&').map(function (v){
            var m = v.split('=')
            args[m[0]]= m[1]
        })

        var config = {
            name: tokenize[0],
            args: args
        }

        if (cache[name]) {
            win.info('Returning cached provider', name);
            return cache[name];
        }

        var provider = registry[config.name];
        if (!provider) {
            win.error('couldn\'t find provider', config.name);
            return null;
        }

        win.info('Spawning new provider', name);
        var p = cache[name] = new provider(config.args);

        if (p && p.config && p.config.type) {
            App.TabTypes[p.config.type] = App.ProviderTypes[p.config.type];
        }

        //HACK(xaiki): set the provider name in the returned object.
        p.name = name;
        return p;
    }

    function delProvider(name) {
        if (cache[name]) {
            win.info('Delete provider cache', name);
            return delete cache[name];
        }
    }

    function installProvider(PO) {
        var name = PO.prototype.config?PO.prototype.config.name:null;

        if (!name) {
            return console.error (PO, PO.prototype.config, 'doesnt have a name')
        }

        if (registry[name]) {
            return console.error ('double definition of', name, PO, PO.prototype.config, 'is the same as', registry[name]);
        }

        console.log ('added', name, 'to provider registry')
        registry[name] = PO;
    }

    App.Providers.get = getProvider;
    App.Providers.delete = delProvider;
    App.Providers.install = installProvider;

    App.TabTypes = {};
})(window.App);
