(function (App) {
    'use strict';

    var IndieBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.IndieCollection,
        filters: {
            genres: App.Config.genres_indie,
            sorters: App.Config.sorters_indie
                //types: App.Config.types_indie
        }
    });

    App.View.IndieBrowser = IndieBrowser;
})(window.App);
