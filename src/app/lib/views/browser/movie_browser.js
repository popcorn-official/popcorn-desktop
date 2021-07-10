(function (App) {
    'use strict';

    var MovieBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.MovieCollection,
        providerType: 'movie',
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);
