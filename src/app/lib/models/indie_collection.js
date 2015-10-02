(function (App) {
    'use strict';

    var IndieCollection = App.Model.Collection.extend({
        model: App.Model.Movie,
        popid: 'mal_id',
        type: 'indies',
        getProviders: function () {
            return {
                torrents: App.Config.getProvider('indie')
            };
        },
    });

    App.Model.IndieCollection = IndieCollection;
})(window.App);
