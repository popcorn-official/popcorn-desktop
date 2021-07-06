(function (App) {
    'use strict';

    var MovieBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.MovieCollection,
        provider: 'MovieApi',
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);
