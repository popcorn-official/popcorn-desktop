(function(App) {
    "use strict";

    var MainWindow = Backbone.Marionette.Layout.extend({
        template: "#main-window-tpl",

        id: 'main-window',

        regions: {
            Header: '#header',
            Content: '#content',
            MovieDetail: '#movie-detail'
        },

        events: {
            'dragover': 'preventDefault',
            'drop': 'preventDefault',
            'dragstart': 'preventDefault',
        },

        initialize: function() {
            this.nativeWindow = require('nw.gui').Window.get();

            // Application events
            App.vent.on('movie:showDetail', _.bind(this.showMovieDetail, this));
            App.vent.on('movie:closeDetail', _.bind(this.MovieDetail.close, this.MovieDetail));
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
        },

        showMovieDetail: function(movieModel) {
            this.MovieDetail.show(new App.View.MovieDetail({
                model: movieModel
            }));
        }
    });

    App.View.MainWindow = MainWindow = MainWindow;
})(window.App);