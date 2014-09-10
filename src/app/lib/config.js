(function(App) {
    'use strict';

    var Config = {
        title: 'Popcorn Time',
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
            'date',
            'year',
            'rating'
        ],

        sorters_tv: [
            'popularity',
            'updated',
            'year',
            'name'
        ],

        types_anime: [
            'All',
            'Movies',
            'TV',
            'OVH'
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

        cache: {
            name: 'cachedb',
            version: '1.7',
            tables: ['subtitle'],
            desc: 'Cache database',
            size: 10 * 1024 * 1024
        },

        cachev2: {
            name: 'cache',
            version: 3,
            tables: ['metadata']
        },

        providers: {
            movie: ['Yts'],
            tvshow: ['Eztv'],
            anime: ['Haruhichan'],
            subtitle: 'YSubs',
            metadata: 'Trakttv',

            tvshowsubtitle: 'OpenSubtitles'
        },

        getProvider: function(type) {
            var provider = App.Config.providers[type];
            if (provider instanceof Array) {
                return _.map(provider, function(t) {
                    return App.Providers.get(t);
                });
            }
            return App.Providers.get(provider);
        }
    };

    App.Config = Config;
})(window.App);
