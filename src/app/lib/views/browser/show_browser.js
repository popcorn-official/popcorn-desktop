(function (App) {
    'use strict';

    var ShowBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.ShowCollection,
        providerType: 'tvshow',
    });

    App.View.ShowBrowser = ShowBrowser;
})(window.App);
