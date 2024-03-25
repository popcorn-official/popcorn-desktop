(function (App) {
    'use strict';

    var WatchlistCollection = App.Model.Collection.extend({
        initialize: function (model, options) {
            this.hasMore = false;
            this.providers = {
                torrents: [App.Providers.get('Watchlist')]
            };
        },
        fetch: function () {
            return App.Providers.get('Watchlist').fetch().then((items) => {
                for (var i in items.results) { //hack FIXME - #557
                    items.results[i].providers = {
                        torrent: App.Providers.get('Watchlist')
                    };
                }
                this.add(items.results);
                this.state = 'loaded';
                this.trigger('loaded', this, this.state);
            }).catch((error) => {
                this.state = 'error';
                this.trigger('loaded', this, this.state);
                win.error('WatchlistCollection.fetch()', error);
            });
        },
        fetchMore: function () {
            return;
        }

    });

    App.Model.WatchlistCollection = WatchlistCollection;
})(window.App);
