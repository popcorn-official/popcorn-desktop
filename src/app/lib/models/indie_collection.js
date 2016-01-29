(function (App) {
    'use strict';

    var IndieCollection = App.Model.Collection.extend({
        model: App.Model.Movie,
        popid: 'imdb_id',
        type: 'indies',
        getProviders: function () {
            return {
                torrents: App.Config.getProviderForType('indie')
            };
        },
    });

    App.Model.IndieCollection = IndieCollection;
})(window.App);
