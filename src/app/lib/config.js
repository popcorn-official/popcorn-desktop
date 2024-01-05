(function(App) {
  'use strict';

  var Config = {
    title: Settings.projectName,
    platform: process.platform,

    // TODO: remote api usage - need rewrite
    genres: [
      'All',
      'Action',
      'Adventure',
      'Animation',
      'Biography',
      'Comedy',
      'Crime',
      'Documentary',
      'Drama',
      'Family',
      'Fantasy',
      'Film-Noir',
      'History',
      'Horror',
      'Music',
      'Musical',
      'Mystery',
      'Romance',
      'Sci-Fi',
      'Short',
      'Sport',
      'Thriller',
      'War',
      'Western'
    ],

    sorters: [
      'trending',
      'popularity',
      'last added',
      'year',
      'title',
      'rating'
    ],

    sorters_tv: ['trending', 'popularity', 'updated', 'year', 'name', 'rating'],

    sorters_fav: ['watched items', 'year', 'title', 'rating'],

    sorters_anime: ['popularity', 'name', 'year'],

    types_anime: ['All', 'Movies', 'TV', 'OVA', 'ONA'],

    types_fav: ['All', 'Movies', 'Series', 'Anime'],

    types_yts: ['All', '720p', '1080p', '2160p', '3D'],

    ratings_yts: ['All', '9', '8', '7', '6', '5', '4', '3', '2', '1'],

    genres_anime: [
      'All',
      'Action',
      'Adventure',
      'Cars',
      'Comedy',
      'Dementia',
      'Demons',
      'Drama',
      'Ecchi',
      'Fantasy',
      'Game',
      'Harem',
      'Historical',
      'Horror',
      'Josei',
      'Kids',
      'Magic',
      'Martial Arts',
      'Mecha',
      'Military',
      'Music',
      'Mystery',
      'Parody',
      'Police',
      'Psychological',
      'Romance',
      'Samurai',
      'School',
      'Sci-Fi',
      'Seinen',
      'Shoujo',
      'Shoujo Ai',
      'Shounen',
      'Shounen Ai',
      'Slice of Life',
      'Space',
      'Sports',
      'Super Power',
      'Supernatural',
      'Thriller',
      'Vampire'
    ],

    genres_tv: [
      'All',
      'Action',
      'Adventure',
      'Animation',
      'Children',
      'Comedy',
      'Crime',
      'Documentary',
      'Drama',
      'Family',
      'Fantasy',
      'Game Show',
      'Home and Garden',
      'Horror',
      'Mini Series',
      'Mystery',
      'News',
      'Reality',
      'Romance',
      'Science Fiction',
      'Soap',
      'Special Interest',
      'Sport',
      'Suspense',
      'Talk Show',
      'Thriller',
      'Western'
    ],

    getTabTypes: function() {
      return _.sortBy(
        _.filter(
          _.map(Settings.providers, function(p, t) {
            return {
              name: p.name,
              order: p.order || 1,
              type: t
            };
          }),
          function(p) {
            if (
              (p.name === 'Movies' && !Settings.moviesTabEnable) ||
              (p.name === 'Series' && !Settings.seriesTabEnable) ||
              (p.name === 'Anime' && !Settings.animeTabEnable)
            ) {
              return false;
            }

            return p.name;
          }
        ),
        'order'
      );
    },

    getProviderForType: function(type) {
      var provider = Settings.providers[type];
      if (typeof provider !== 'string') {
        if (provider && provider.uri) {
          provider = provider.uri;
        }
      }

      if (!provider) {
        win.warn(
          'Provider type: "%s" isn\'t defined in App.Config.providers',
          type
        );
        return;
      } else if (provider instanceof Array || typeof provider === 'object') {
        return _.map(provider, function(t) {
          return App.Providers.get(t);
        });
      } else {
        return App.Providers.get(provider);
      }
    },

    getProviderNameForType: function(type) {
      return this.getProviderForType(type).map(function(p) {
        return p.config.tabName;
      });
    },

    getFiltredProviderNames: function(type) {
      var ret = {};
      this.getProviderNameForType(type).map(function(n) {
        ret[n] = ret[n] ? ret[n] + 1 : 1;
      });

      return _.map(ret, function(v, k) {
        return k.concat(v > 1 ? ':' + v : '');
      });
    }
  };

  App.Config = Config;
})(window.App);
