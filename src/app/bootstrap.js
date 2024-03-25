(function(App) {
  'use strict';
  App.start();

  /* load all the things ! */
  var fs = require('fs');

  function loadLocalProviders() {
    var providerPath = './src/app/lib/providers/';

    var files = fs.readdirSync(providerPath);

    var head = document.getElementsByTagName('head')[0];
    return files
      .map(function(file) {
        if (!file.match(/\.js$/) || file.match(/generic.js$/)) {
          return null;
        }

        return new Promise((resolve, reject) => {
          var script = document.createElement('script');

          script.type = 'text/javascript';
          script.src = 'lib/providers/' + file;

          script.onload = function() {
            script.onload = null;
            win.info('Loaded local provider:', file);
            resolve(file);
          };

          head.appendChild(script);
        });
      })
      .filter(function(q) {
        return q;
      });
  }

  function loadFromNPM(name, fn) {
    const P = require(name);
    return Promise.resolve(fn(P));
  }

  function loadProvidersJSON(fn) {
    return pkJson.providers.map(function(providerPath) {
      win.info('Loaded provider:', providerPath);
      return loadFromNPM(`./${providerPath}`, fn);
    });
  }

  function loadFromPackageJSON(regex, fn) {
    var packages = Object.keys(pkJson.dependencies).filter(function(p) {
      return p.match(regex);
    });

    return packages.map(function(name) {
      win.info('Loaded npm', regex, name);
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
    return Promise.all(
      loadFromPackageJSON(/butter-settings-/, function(settings) {
        Settings = _.extend(Settings, settings);
      })
    );
  }

  function loadProviders() {
    return Promise.all(
      loadLocalProviders()
    );
  }

  function loadProvidersDelayed() {
    return Promise.all(
      loadNpmProviders().concat(loadLegacyNpmProviders())
    );
  }

  App.bootstrapPromise = loadNpmSettings()
    .then(loadProviders)
    .then(loadProvidersDelayed)
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
    });
})(window.App);
