(function (App) {
    'use strict';

    var Movie = Backbone.Model.extend({
        events: {
            'change:torrents': 'updateHealth',
        },

        idAttribute: 'imdb_id',

        initialize: function () {
            this.updateHealth();
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

    App.Model.Movie = Movie;
})(window.App);
