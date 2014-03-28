(function(App) {
    "use strict";

    var MainWindow = Backbone.Marionette.Layout.extend({
        template: "#main-window-tpl",

        id: 'main-window',

        regions: {
            Header: '#header',
            Content: '#content'
        },

        events: {
            '.btn-os.max click': 'maximize',
            '.btn-os.min click': 'minimize',
            '.btn-os.close click': 'close',
            '.btn-os.fullscreen click': 'toggleFullscreen',

            'dragover': 'preventDefault',
            'drop': 'preventDefault',
            'dragstart': 'preventDefault',
        },

        initialize: function() {
            this.nativeWindow = require('nw.gui').Window.get();
        },

        onShow: function() {
            this.Header.show(new App.View.TitleBar());
            this.Content.show(new App.View.MovieBrowser());

            // Set the app title (for Windows mostly)
            this.nativeWindow.title = App.Config.title;

            // Focus the window when the app opens
            this.nativeWindow.focus();

            // Cancel all new windows (Middle clicks / New Tab)
            this.nativeWindow.on('new-win-policy', function (frame, url, policy) {
                policy.ignore();
            });
        },

        preventDefault: function(e) {
            e.preventDefault();
        }
    });

    App.View.MainWindow = MainWindow = MainWindow;
})(window.App);