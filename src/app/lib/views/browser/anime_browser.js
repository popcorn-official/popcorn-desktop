(function (App) {
    'use strict';

    var AnimeBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.AnimeCollection,
        filters: {
            genres: App.Config.genres_anime,
            sorters: App.Config.sorters_anime,
            types: App.Config.types_anime
        }
    });

    App.View.AnimeBrowser = AnimeBrowser;
})(window.App);
