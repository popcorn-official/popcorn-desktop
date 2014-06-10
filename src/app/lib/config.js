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
            size: 10*1024*1024
        },

        cachev2: {
            name: 'cache',
            version: 3,
            tables: ['metadata']
        },

        providers: {
            movie: 'Yts',
            subtitle: 'YSubs',
            metadata: 'Trakttv',
            tvshow: 'Eztv',
            tvshowsubtitle: 'OpenSubtitles'
        },

        getProvider: function(type) {
            return App.Providers[App.Config.providers[type]];
        }
    };

    App.Config = Config;
})(window.App);