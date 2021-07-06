(function (App) {
    'use strict';

    var ShowBrowser = App.View.PCTBrowser.extend({
        collectionModel: App.Model.ShowCollection,
        provider: 'TVApi',
    });

    App.View.ShowBrowser = ShowBrowser;
})(window.App);
