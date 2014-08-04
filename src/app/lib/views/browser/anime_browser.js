(function(App) {
    'use strict';

    var AnimeBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.AnimeCollection,
        filters: {
            genres: App.Config.genres_tv,
            sorters: App.Config.sorters_tv
        }
    });

    App.View.AnimeBrowser = AnimeBrowser;
})(window.App);
