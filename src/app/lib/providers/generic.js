(function(App) {
  'use strict';
  var fs = require('fs');
  var cache = (App.Providers._cache = {});
  var registry = (App.Providers._registry = {});

  App.Providers.Generic = require('butter-provider');

  function updateProviderConnection (moviesServer, seriesServer, animeServer, proxy) {
    if (moviesServer && moviesServer.includes('://yts')) {
      var MovieBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.MovieCollection,
        filters: {
          genres: App.Config.genres,
          sorters: App.Config.sorters,
          types: App.Config.types_yts
        }
      });
      App.View.MovieBrowser = MovieBrowser;
      cache[Object.keys(App.Providers._cache)[0]] = App.Providers.get('YTSApi');
    }
    moviesServer ? cache[Object.keys(App.Providers._cache)[0]].apiURL = [moviesServer] : null;
    seriesServer ? cache[Object.keys(App.Providers._cache)[1]].apiURL = [seriesServer] : null;
    animeServer ? cache[Object.keys(App.Providers._cache)[2]].apiURL = [animeServer] : null;
    for (let provider in cache) {
      cache[provider].proxy = proxy;
    }
  }

  function delProvider(name) {
    if (cache[name]) {
      win.info('Delete provider cache', name);
      return delete cache[name];
    }
  }

  function installProvider(PO) {
    var name = PO.prototype.config ? PO.prototype.config.name : null;

    if (!name) {
      return win.error(PO, PO.prototype.config, 'doesn\'t have a name');
    }

    if (registry[name]) {
      return win.error(
        'double definition of',
        name,
        PO,
        PO.prototype.config,
        'is the same as',
        registry[name]
      );
    }

    win.debug('added', name, 'to provider registry');
    registry[name] = PO;

    return name;
  }

  function getProviderFromRegistry(name) {
    return registry[name];
  }

  function getProvider(name) {
    if (!name) {
      /* XXX(xaiki): this is for debug purposes, will it bite us later ? */
      /* XXX(vankasteelj): it did. */
      win.error(
        'asked for an empty provider, this should never happen, dumping provider cache and registry',
        cache,
        registry
      );
      return cache;
    }

    var config = App.Providers.Generic.parseArgs(name);

    if (cache[name]) {
      win.info('Returning cached provider', name);
      return cache[name];
    }

    var provider = getProviderFromRegistry(config.name);

    if (!provider) {
      if (installProvider(require('butter-provider-' + config.name))) {
        win.warn(
          'I loaded',
          config.name,
          'from npm but you didn\'t add it to your package.json'
        );
        provider = getProviderFromRegistry(config.name);
      } else {
        win.error('couldn\'t find provider', config.name);
        return null;
      }
    }

    win.info('Spawning new provider', name, config);
    var p = (cache[name] = new provider(config));

    //HACK(xaiki): set the provider name in the returned object.
    p.name = name;
    return p;
  }

  App.Providers.get = getProvider;
  App.Providers.delete = delProvider;
  App.Providers.install = installProvider;
  App.Providers.updateConnection = updateProviderConnection;

  App.Providers.getFromRegistry = getProviderFromRegistry;
})(window.App);
