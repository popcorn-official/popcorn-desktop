(function(context) {
    "use strict";

    context.App = context.App || {};

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
        ]
    };

    context.App.Config = Config;
})(window);