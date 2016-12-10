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

            var id = attrs.imdb_id;
            providers.metadata && providers.metadata.getMetadata(id)
                .then(this.applyMetadata.bind(this))
                .catch(e => console.error('error loading metadata', e));
        },

        getProviders: function() {
            return {};
        },

        applyMetadata: function (info) {
            if (!info) {
                return;
            }

            if (info.overview) {
                info.synopsis = info.overview;
            }

            return this.set(info);
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
