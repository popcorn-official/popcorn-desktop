(function (App) {
    'use strict';

    var MovieCollection = App.Model.Collection.extend({
        model: App.Model.Movie,
        popid: 'imdb_id',
        type: 'movies',
        getProviders: function () {
            return {
                torrents: App.Config.getProviderForType('movie'),
                metadata: App.Config.getProviderForType('metadata')
            };
        }
    });

    App.Model.MovieCollection = MovieCollection;
})(window.App);
