(function (App) {
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

        types_anime: [
            'All',
            'Movies',
            'TV',
            'OVA',
            'ONA'
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

        providers: {
            movie: ['Yts'],
            tvshow: ['TVApi'],
            anime: ['Haruhichan'],
            subtitle: 'YSubs',
            metadata: 'Trakttv',
            tvst: 'TVShowTime',

            tvshowsubtitle: 'OpenSubtitles',
            torrentCache: 'TorrentCache'
        },

        getProvider: function (type) {
            var provider = App.Config.providers[type];
            if (provider instanceof Array) {
                return _.map(provider, function (t) {
                    return App.Providers.get(t);
                });
            }
            return App.Providers.get(provider);
        }
    };

    App.Config = Config;
})(window.App);
