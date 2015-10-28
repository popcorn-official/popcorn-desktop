(function (App) {
    'use strict';

    var MovieCollection = App.Model.Collection.extend({
        model: App.Model.Movie,
        popid: 'imdb_id',
        type: 'movies',
        getProviders: function () {
            return {
                torrents: App.Config.getProvider('movie'),
                metadata: App.Config.getProvider('metadata'),
                subtitle: App.Config.getProvider('subtitle')
            };
        }
    });

    App.Model.MovieCollection = MovieCollection;
})(window.App);
