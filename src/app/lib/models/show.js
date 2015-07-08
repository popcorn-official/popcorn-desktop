(function (App) {
    'use strict';

    var Show = App.Model.Movie.extend({
        idAttribute: 'tvdb_id',
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
