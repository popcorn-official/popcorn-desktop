(function (App) {
    'use strict';

    var FavoriteBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.FavoriteCollection,
        filters: {
            types: App.Config.types_fav
        }
    });

    App.View.FavoriteBrowser = FavoriteBrowser;
})(window.App);
