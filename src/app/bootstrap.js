(function (App) {
    'use strict';
    App.start();

    ['movie', 'tvshow', 'anime', 'indie'].forEach (function (p) {
        App.Config.getProvider(p);
    })

})(window.App);
