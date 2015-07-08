(function (App) {
    'use strict';

    var Q = require('q');

    var MovieCollection = App.Model.Collection.extend({
        model: App.Model.Movie,
        popid: 'imdb_id',
        type: 'movies',
        getProviders: function () {
            return {
                torrents: App.Config.getProvider('movie'),
                subtitle: App.Config.getProvider('subtitle')
            };
        }
    });

    App.Model.MovieCollection = MovieCollection;
})(window.App);
