(function(App) {
    "use strict";

    var MainWindow = Backbone.View.extend({
        id: "main-window",

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
            this.titleBar = new App.View.TitleBar({
                el: this.$el.find('#header')
            });

            this.movieBrowser = new App.View.MovieBrowser({
                el: this.$el.find('#movie-browser')
            });

            this.nativeWindow = require('nw.gui').Window.get();
        },

        render: function() {
            this.titleBar.render();
            this.movieBrowser.render();

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