(function(App) {
    'use strict';

    var Movie = Backbone.Model.extend({
        events: {
            'change:torrents': 'updateHealth',
        },

        idAttribute: 'imdb',

        initialize: function() {
            this.updateHealth();
        },

        updateHealth: function() {
            var torrents = this.get('torrents');

            _.each(torrents, function(torrent) {
                if (!torrent.url) {
                    _.each(torrent, function(episode, key) {
                        torrent[key].health = Common.healthMap[Common.calcHealth(episode)];
                    });
                } else {
                    torrent.health = Common.healthMap[Common.calcHealth(torrent)];
                }
            });

            this.set('torrents', torrents, {silent: true});
        }
    });

    App.Model.Movie = Movie;
})(window.App);