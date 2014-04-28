(function(App) {
    "use strict";

    var MainWindow = Backbone.Marionette.Layout.extend({
        template: "#main-window-tpl",

        id: 'main-window',

        regions: {
            Header: '#header',
            Content: '#content',
            MovieDetail: '#movie-detail',
            Player: '#player',
            Settings: '#settings-container',
            InitModal: '#initializing'
        },

        events: {
            'dragover': 'preventDefault',
            'drop': 'preventDefault',
            'dragstart': 'preventDefault',
        },

        initialize: function() {
            this.nativeWindow = require('nw.gui').Window.get();

            // Application events
            App.vent.on('movies:list', _.bind(this.showMovies, this));
            App.vent.on('shows:list', _.bind(this.showShows, this));
            

            // Movies
            App.vent.on('movie:showDetail', _.bind(this.showMovieDetail, this));
            App.vent.on('movie:closeDetail', _.bind(this.MovieDetail.close, this.MovieDetail));

            // Tv Shows
            App.vent.on('show:showDetail', _.bind(this.showShowDetail, this));
            App.vent.on('show:closeDetail', _.bind(this.MovieDetail.close, this.MovieDetail));

            // Settings events
            App.vent.on('settings:show', _.bind(this.showSettings, this));
            App.vent.on('settings:close', _.bind(this.Settings.close, this.Settings));

            // Stream events
            App.vent.on('stream:started', _.bind(this.streamStarted, this));
            App.vent.on('stream:ready', _.bind(this.showPlayer, this));
            App.vent.on('player:close', _.bind(this.Player.close, this.Player));
        },

        onShow: function() {
            this.Header.show(new App.View.TitleBar());
            // Set the app title (for Windows mostly)
            this.nativeWindow.title = App.Config.title;

            // Show loading modal on startup
            var that = this;
            this.Content.show(new App.View.InitModal());
            App.db.initialize(function() {
                that.InitModal.close();
                that.showMovies();
                // Focus the window when the app opens
                that.nativeWindow.focus();
            });

            // Cancel all new windows (Middle clicks / New Tab)
            this.nativeWindow.on('new-win-policy', function (frame, url, policy) {
                policy.ignore();
            });
        },

        showMovies: function(e) {
            this.Settings.close();
            this.MovieDetail.close();

            this.Content.show(new App.View.MovieBrowser());
        },

        showShows: function(e) {
            this.Settings.close();
            this.MovieDetail.close();

            this.Content.show(new App.View.ShowBrowser());
        },

        preventDefault: function(e) {
            e.preventDefault();
        },
   
        showMovieDetail: function(movieModel) {
            this.MovieDetail.show(new App.View.MovieDetail({
                model: movieModel
            }));
        },

        showShowDetail: function(showModel) {
            this.MovieDetail.show(new App.View.ShowDetail({
                model: showModel
            }));
        },  

        showSettings: function(settingsModel) {            
            this.Settings.show(new App.View.Settings({
                model: settingsModel
            }));
        },

        streamStarted: function(stateModel) {
            this.MovieDetail.close();
            this.Player.show(new App.View.Loading({
                model: stateModel
            }));
        },

        showPlayer: function(streamModel) {
            this.Player.show(new App.View.Player({
                model: streamModel
            }));
        }
    });

    App.View.MainWindow = MainWindow = MainWindow;
})(window.App);