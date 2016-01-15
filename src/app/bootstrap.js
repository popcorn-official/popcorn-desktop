(function (App) {
    'use strict';
    App.start();

    /* load all the things ! */
    var Q = require ('q');
    var fs = require('fs');

    function loadLocalProviders() {
        var appPath = '';
        var providerPath = './src/app/lib/providers/';

        var files = fs.readdirSync(providerPath);

        return files.map (function (file) {
            if (! file.match(/\.js$/))
                return null;

            if (file.match(/generic.js$/))
                return null;

            console.log ('loading local provider', file);

            var q = Q.defer();

            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = 'lib/providers/' + file;

            script.onload = function () {
                console.log ('loaded', file)
                q.resolve(file);
            };

            head.appendChild(script);

            return q.promise;
        }).filter (function (q) { return q});
    }

    function loadNpmProviders() {
        var config = require('../../package.json')

        var packages = Object.keys(config.dependencies).filter(function (p) {
            return p.match(/butter-provider-/)
        })

        return packages.map(function(p) {
            console.log ('loading npm provider', p);
            var provider = require(p)

            return Q(App.Providers.install(provider))
        })
    }

    function loadProviders() {
        return loadLocalProviders().concat(loadNpmProviders())
    }

    App.bootstrapPromise = Q.all(loadProviders())
        .then(function (values) {
            return _.keys(App.ProviderTypes).map(function (p) {
                return App.Config.getProvider(p);
            });
        })
        .then(function (providers) {
            console.log ('loaded', providers)
        })

})(window.App);
