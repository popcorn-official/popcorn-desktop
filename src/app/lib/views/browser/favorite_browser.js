(function (App) {
    'use strict';

    var FavoriteBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.FavoriteCollection,
        provider: 'Favorites',
    });

    App.View.FavoriteBrowser = FavoriteBrowser;
})(window.App);
