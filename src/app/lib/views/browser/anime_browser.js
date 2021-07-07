(function (App) {
    'use strict';

    var AnimeBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.AnimeCollection,
        providerType: 'anime',
    });

    App.View.AnimeBrowser = AnimeBrowser;
})(window.App);
