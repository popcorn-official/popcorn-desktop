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

            providers.metadata &&
                providers.metadata.getImages(attrs)
                .then(this.set.bind(this))
                .catch(e => win.error('Error loading metadata', e));

            this.updateHealth();
            this.on('change:torrents', this.updateHealth.bind(this));
        },

        getProviders: function() {
            return {};
        },

        updateHealth: function () {
            var torrents = this.get('torrents');

            if (!torrents) {
                return false;
            }

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
