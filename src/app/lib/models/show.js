(function (App) {
    'use strict';

    var Show = Backbone.Model.extend({
        events: {
            'change:torrents': 'updateHealth'
        },

        idAttribute: 'tvdb_id',

        initialize: function (attrs) {
            this.set('providers', Object.assign(attrs.providers,
                                                this.getProviders()));
            this.updateHealth();
        },

        getProviders: function() {
            return {};
        },

        updateHealth: function () {
            var torrents = this.get('torrents');

            _.each(torrents, function (torrent) {
                _.each(torrent, function (episode, key) {
                    torrent[key].health = Common.healthMap[Common.calcHealth(episode)];
                });
            });

            this.set('torrents', torrents, {
                silent: true
            });
        }
    });

    App.Model.Show = Show;
})(window.App);
