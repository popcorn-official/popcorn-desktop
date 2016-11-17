(function (App) {
    'use strict';

    var WatchlistCollection = App.Model.Collection.extend({
        model: App.Model.Movie,
        initialize: function () {
            this.hasMore = false;
            this.providers = {
                torrents: [App.Providers.get('Watchlist')]
            }
        },
        fetchMore: function () {
            return;
        }

    });

    App.Model.WatchlistCollection = WatchlistCollection;
})(window.App);
