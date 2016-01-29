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
        return loadFromNPM (/butter-provider-/, App.Providers.install)
    }

    function loadNpmSettings() {
        return Q.all(loadFromNPM (/butter-settings-/, function (settings) {
            Settings = _.extend(Settings, settings);
        }))
    }

    function loadFromNPM(regex, fn) {
        var config = require('../../package.json')

        var packages = Object.keys(config.dependencies).filter(function (p) {
            return p.match(regex)
        })

        return packages.map(function(p) {
            console.log ('loading npm', regex, p);
            var P = require(p)

            return Q(fn(P))
        })
    }

    function loadProviders() {
        return Q.all(loadLocalProviders().concat(loadNpmProviders()))
    }

    App.bootstrapPromise = loadNpmSettings()
        .then(loadProviders)
        .then(function (values) {
            return _.keys(App.ProviderTypes).map(function (type) {
                return App.Config.getProviderForType(type);
            });
        })
        .then(function (providers) {
            console.log ('loaded', providers)
        })

})(window.App);
