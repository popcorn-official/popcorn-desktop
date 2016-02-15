(function (App) {
    'use strict';

    var Config = {
        title: Settings.projectName,
        platform: process.platform,
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
            'popularity',
            'trending',
            'last added',
            'year',
            'title',
            'rating'
        ],

        sorters_tv: [
            'popularity',
            'trending',
            'updated',
            'year',
            'name',
            'rating'
        ],

        sorters_fav: [
            'watched items',
            'year',
            'title',
            'rating'
        ],

        sorters_anime: [
            'popularity',
            'name'
        ],

        types_anime: [
            'All',
            'Movies',
            'TV',
            'OVA',
            'ONA'
        ],

        types_fav: [
            'All',
            'Movies',
            'TV',
            'Anime'
        ],

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

        genres_indie: [
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
        sorters_indie: [
            'popularity',
            'updated',
            'year',
            'alphabet',
            'rating'
        ],
        types_indie: [],

        cache: {
            name: 'cachedb',
            version: '1.7',
            tables: ['subtitle'],
            desc: 'Cache database',
            size: 10 * 1024 * 1024
        },

        cachev2: {
            name: 'cache',
            version: 5,
            tables: ['metadata']
        },

        getTabTypes: function () {
            return _.sortBy(_.filter(_.map(Settings.providers, function (p, t) {
                return {
                    name: p.name,
                    order: p.order || 1,
                    type: t
                };
            }), function (p) {
                return p.name;
            }), 'order');
        },

        getProviderForType: function (type) {
            var provider = Settings.providers[type];
            if (typeof provider !== 'string') {
                if (provider.uri) {
                    provider = provider.uri;
                }
            }

            if (!provider) {
                win.warn('Provider type: \'%s\' isn\'t defined in App.Config.providers', type);
                return;
            } else if (provider instanceof Array || typeof provider === 'object') {
                return _.map(provider, function (t) {
                    return App.Providers.get(t);
                });
            } else {
                return App.Providers.get(provider);
            }
        },

        getProviderNameForType: function (type) {
            return this.getProviderForType(type).map(function (p) {
                return p.config.tabName;
            });
        },

        getFiltredProviderNames: function (type) {
            var ret = {};
            this.getProviderNameForType(type).map(function (n) {
                ret[n] = ret[n] ? ret[n] + 1 : 1;
            });

            return _.map(ret, function (v, k) {
                return k.concat((v > 1) ? ':' + v : '');
            });
        }

    };

    App.Config = Config;
})(window.App);
