(function (App) {
    'use strict';
    App.start();

    /* load all the things ! */
    var Q = require ('q');
    var fs = require('fs');

    function loadProviders() {
        var appPath = '';
        var providerPath = './src/app/lib/providers/';

        var files = fs.readdirSync(providerPath);

        return files.map (function (file) {
            if (! file.match(/\.js$/))
                return null;

            if (file.match(/generic.js$/))
                return null;

            console.log ('loading', file);

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

    var deferred = loadProviders();
    App.bootstrapPromise = Q.all(deferred)
        .then(function (values) {
            return _.keys(App.ProviderTypes).map(function (p) {
                return App.Config.getProvider(p);
            });
        })
        .then(function (providers) {
            console.log ('loaded', providers)
        })

})(window.App);
