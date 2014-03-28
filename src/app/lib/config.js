(function(App) {
    "use strict";

    var Config = {
        title: 'Popcorn Time',
        platform: process.platform,
        categories: [
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

        getProviders: function(type) {
            return App.Providers[App.Config.providers[type]];
        }
    };

    App.Config = Config;
})(window.App);