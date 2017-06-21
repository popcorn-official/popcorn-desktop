(function (App) {
    'use strict';

    var ShowCollection = App.Model.Collection.extend({
        model: App.Model.Show,
        popid: 'imdb_id',
        type: 'shows',
        getProviders: function () {
            return {
                torrents: App.Config.getProviderForType('tvshow')
            };
        },
    });

    App.Model.ShowCollection = ShowCollection;
})(window.App);
