(function (App) {
    'use strict';

    var WatchlistBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.WatchlistCollection,
        provider: 'Watchlist',
    });

    App.View.WatchlistBrowser = WatchlistBrowser;
})(window.App);
