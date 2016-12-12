(function (App) {
    'use strict';

    var ContentItem = Backbone.Model.extend({
        events: {
            'change:torrents': 'updateHealth'
        },

        idAttribute: 'imdb_id',

        initialize: function (attrs) {
            var providers = Object.assign(attrs.providers,
                                                this.getProviders());
            this.set('providers', providers);
            this.updateHealth();

            !attrs.poster && providers.metadata &&
                providers.metadata.getImages(attrs)
                .then(this.set.bind(this))
                .catch(e => console.error('error loading metadata', e));
        },

        getProviders: function() {
            return {};
        },

        updateHealth: function () {
            var torrents = this.get('torrents');

            _.each(torrents, function (torrent) {
                torrent.health = Common.healthMap[Common.calcHealth(torrent)];
            });

            this.set('torrents', torrents, {
                silent: true
            });
        }
    });

    App.Model.ContentItem = ContentItem;
})(window.App);
