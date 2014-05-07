(function(App) {
    "use strict";

    var Config = {
        title: 'Popcorn Time',
        platform: process.platform,
        genres: [
            "all",
            "action",
            "adventure",
            "animation",
            "biography",
            "comedy",
            "crime",
            "documentary",
            "drama",
            "family",
            "fantasy",
            "film",
            "history",
            "horror",
            "music",
            "musical",
            "mystery",
            "romance",
            "sci-fi",
            "short",
            "sport",
            "thriller",
            "war",
            "western"
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
            "All",
            "Action",
            "Adventure",
            "Animation",
            "Children",
            "Comedy",
            "Crime",
            "Documentary",
            "Drama",
            "Family",
            "Fantasy",
            "Game Show",
            "Home and Garden",
            "Horror",
            "Mini Series",
            "Mystery",
            "News",
            "Reality",
            "Romance",
            "Science Fiction",
            "Soap",
            "Special Interest",
            "Sport",
            "Suspense",
            "Talk Show",
            "Thriller",
            "Western"
        ],

        cache: {
            name: 'cachedb',
            version: '1.5',
            desc: 'Cache database',
            size: 10*1024*1024,
            tables: ['subtitle', 'metadata']
        },

        providers: {
            torrent: 'Yts',
            subtitle: 'YSubs',
            metadata: 'Trakttv'
        },

        getProvider: function(type) {
            return App.Providers[App.Config.providers[type]];
        }
    };

    App.Config = Config;
})(window.App);