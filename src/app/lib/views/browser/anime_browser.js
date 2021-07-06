(function (App) {
    'use strict';

    var AnimeBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.AnimeCollection,
        provider: 'AnimeApi',
    });

    App.View.AnimeBrowser = AnimeBrowser;
})(window.App);
