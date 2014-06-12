(function(App) {
    'use strict';

    var healthMap = {
        0: 'bad',
        1: 'medium',
        2: 'good',
        3: 'excellent'
    };

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

                    // we have a tv show
                    _.each(torrent, function(episode, key) {
                        // ok we have a movie
                        var seeds = episode.seeds;
                        var peers = episode.peers;
                        var ratio = peers > 0 ? (seeds / peers) : seeds;
                        var health = 0;
                        if (seeds >= 100 && seeds < 1000) {
                            if( ratio > 5 ) {
                                health = 2;
                            } else if( ratio > 3 ) {
                                health = 1;
                            }
                        } else if (seeds >= 1000) {
                            if( ratio > 5 ) {
                                health = 3;
                            } else if( ratio > 3 ) {
                                health = 2;
                            } else if( ratio > 2 ) {
                                health = 1;
                            }
                        }

                        torrent[key].health = healthMap[health];

                    });

                } else {

                    // we have a movie
                    var seeds = torrent.seeds;
                    var peers = torrent.peers;
                    var ratio = peers > 0 ? (seeds / peers) : seeds;
                    var health = 0;
                    if (seeds >= 100 && seeds < 1000) {
                        if( ratio > 5 ) {
                            health = 2;
                        } else if( ratio > 3 ) {
                            health = 1;
                        }
                    } else if (seeds >= 1000) {
                        if( ratio > 5 ) {
                            health = 3;
                        } else if( ratio > 3 ) {
                            health = 2;
                        } else if( ratio > 2 ) {
                            health = 1;
                        }
                    }

                    torrent.health = healthMap[health];
                }


            });

            this.set('torrents', torrents, {silent: true});
        }
    });

    App.Model.Movie = Movie;
})(window.App);