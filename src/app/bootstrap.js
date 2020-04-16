(function(App) {
  'use strict';
  App.start();

  /* load all the things ! */
  var Q = require('q');
  var fs = require('fs');

  function loadLocalProviders() {
    var appPath = '';
    var providerPath = './src/app/lib/providers/';

    var files = fs.readdirSync(providerPath);

    return files
      .map(function(file) {
        if (!file.match(/\.js$/)) {
          return null;
        }

        if (file.match(/generic.js$/)) {
          return null;
        }

        win.info('loading local provider', file);

        var q = Q.defer();

        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');

        script.type = 'text/javascript';
        script.src = 'lib/providers/' + file;

        script.onload = function() {
          win.info('loaded', file);
          q.resolve(file);
        };

        head.appendChild(script);

        return q.promise;
      })
      .filter(function(q) {
        return q;
      });
  }

  function loadFromNPM(name, fn) {
    var P = require(name);
    return Q(fn(P));
  }

  function loadProvidersJSON(fn) {
    App.Npm = require('../../package.json');

    return App.Npm.providers.map(function(providerPath) {
      win.info('loading npm', providerPath);
      return loadFromNPM(`./${providerPath}`, fn);
    });
  }

  function loadFromPackageJSON(regex, fn) {
    App.Npm = require('../../package.json');

    var packages = Object.keys(App.Npm.dependencies).filter(function(p) {
      return p.match(regex);
    });

    return packages.map(function(name) {
      win.info('loading npm', regex, name);
      return loadFromNPM(name, fn);
    });
  }

  function loadNpmProviders() {
    return loadProvidersJSON(App.Providers.install);
  }

  function loadLegacyNpmProviders() {
    return loadFromPackageJSON(/butter-provider-/, App.Providers.install);
  }

  function loadNpmSettings() {
    return Q.all(
      loadFromPackageJSON(/butter-settings-/, function(settings) {
        Settings = _.extend(Settings, settings);
      })
    );
  }

  function loadProviders() {
    return Q.all(
      loadLocalProviders()
        .concat(loadNpmProviders())
        .concat(loadLegacyNpmProviders())
    );
  }

  App.bootstrapPromise = loadNpmSettings()
    .then(loadProviders)
    .then(function(values) {
      return _.filter(
        _.keys(Settings.providers).map(function(type) {
          return {
            provider: App.Config.getProviderForType(type),
            type: type
          };
        }),
        function(p) {
          return p.provider;
        }
      );
    })
    .then(function(providers) {
      App.TabTypes = {};

      _.each(providers, function(provider) {
        var p = Settings.providers[provider.type];
        if (!p.name) {
          return;
        }

        App.TabTypes[provider.type] = p.name;
      });

      return providers;
    })
    .then(function(providers) {
      win.info('loaded', providers);
    });
})(window.App);
