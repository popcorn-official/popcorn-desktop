(function(App) {
    'use strict';

    var _this;

    var MainWindow = Backbone.Marionette.Layout.extend({
        template: '#main-window-tpl',

        id: 'main-window',

        regions: {
            Header: '#header',
            Content: '#content',
            MovieDetail: '#movie-detail',
            FileSelector: '#file-selector-container',
            Player: '#player',
            Settings: '#settings-container',
            InitModal: '#initializing',
            Disclaimer: '#disclaimer-container',
            About: '#about-container',
            Help: '#help-container'
        },

        events: {
            'dragover': 'preventDefault',
            'drop': 'preventDefault',
            'dragstart': 'preventDefault',
        },

        initialize: function() {
            _this = this;

            this.nativeWindow = require('nw.gui').Window.get();

            // Application events
            App.vent.on('movies:list', _.bind(this.showMovies, this));
            App.vent.on('shows:list', _.bind(this.showShows, this));
            App.vent.on('favorites:list', _.bind(this.showFavorites, this));
            App.vent.on('shows:update', _.bind(this.updateShows, this));
            App.vent.on('shows:init', _.bind(this.initShows, this));

            // Add event to show disclaimer
            App.vent.on('show:disclaimer', _.bind(this.showDisclaimer, this));
            App.vent.on('close:disclaimer', _.bind(this.Disclaimer.close, this.Disclaimer));

            // Add event to show about
            App.vent.on('about:show', _.bind(this.showAbout, this));
            App.vent.on('about:close', _.bind(this.About.close, this.About));

            // Help
            App.vent.on('help:show', _.bind(this.showHelp, this));
            App.vent.on('help:close', _.bind(this.Help.close, this.Help));
            App.vent.on('help:toggle', _.bind(this.toggleHelp, this));

            // Movies
            App.vent.on('movie:showDetail', _.bind(this.showMovieDetail, this));
            App.vent.on('movie:closeDetail', _.bind(this.closeMovieDetail, this.MovieDetail));

            // Tv Shows
            App.vent.on('show:showDetail', _.bind(this.showShowDetail, this));
            App.vent.on('show:closeDetail', _.bind(this.closeShowDetail, this.MovieDetail));

            // Settings events
            App.vent.on('settings:show', _.bind(this.showSettings, this));
            App.vent.on('settings:close', _.bind(this.Settings.close, this.Settings));

            App.vent.on('system:openFileSelector', _.bind(this.showFileSelector, this));
            App.vent.on('system:closeFileSelector', _.bind(this.FileSelector.close, this.FileSelector));

            // Stream events
            App.vent.on('stream:started', _.bind(this.streamStarted, this));
            App.vent.on('stream:ready', _.bind(this.showPlayer, this));
            App.vent.on('player:close', _.bind(this.showViews, this));
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

                // we check if the disclaimer is accepted

                if( ! AdvSettings.get('disclaimerAccepted') ) {

                    that.showDisclaimer();

                }

                that.InitModal.close();
                that.showMovies();
                // Focus the window when the app opens
                that.nativeWindow.focus();


            });

            // Cancel all new windows (Middle clicks / New Tab)
            this.nativeWindow.on('new-win-policy', function (frame, url, policy) {
                policy.ignore();
            });

            App.vent.trigger('main:ready');
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

        updateShows: function(e) {
            var that = this;
            App.vent.trigger('show:closeDetail');
            this.Content.show(new App.View.InitModal());
            App.db.syncDB(function() {
                    that.InitModal.close();
                    that.showShows();
                    // Focus the window when the app opens
                    that.nativeWindow.focus();

            });
        },

        // used in app to re-triger a api resync
        initShows: function(e) {
            var that = this;
            App.vent.trigger('settings:close');
            this.Content.show(new App.View.InitModal());
            App.db.initDB(function(err,data) {
                    that.InitModal.close();

                    if (!err) {
                        // we write our new update time
                        AdvSettings.set('tvshow_last_sync', +new Date());
                    }

                    App.vent.trigger('shows:list');
                    // Focus the window when the app opens
                    that.nativeWindow.focus();

            });
        },

        showFavorites: function(e) {
            this.Settings.close();
            this.MovieDetail.close();

            this.Content.show(new App.View.FavoriteBrowser());
        },

        showDisclaimer: function(e) {
            this.Disclaimer.show(new App.View.DisclaimerModal());
        },

        showAbout: function(e) {
            this.About.show(new App.View.About());
        },

        showHelp: function(e) {
            this.Help.show(new App.View.Help());
        },

        toggleHelp: function(e) {
            if($('.help-container').length > 0) {
                App.vent.trigger('help:close');
            }
            else {
                this.showHelp();
            }
        },

        preventDefault: function(e) {
            e.preventDefault();
        },

        showMovieDetail: function(movieModel) {
            this.MovieDetail.show(new App.View.MovieDetail({
                model: movieModel
            }));
        },

        closeMovieDetail: function(movieModel) {
            _this.MovieDetail.close();
            App.vent.trigger('shortcuts:movies');
        },

        showShowDetail: function(showModel) {
            this.MovieDetail.show(new App.View.ShowDetail({
                model: showModel
            }));
        },

        closeShowDetail: function(showModel) {
            _this.MovieDetail.close();
            App.vent.trigger('shortcuts: shows');
        },

        showFileSelector: function(fileModel) {
            App.vent.trigger('stream:stop');
            App.vent.trigger('player:close');
            this.FileSelector.show(new App.View.FileSelector({
                model: fileModel
            }));
        },

        showSettings: function(settingsModel) {
            this.Settings.show(new App.View.Settings({
                model: settingsModel
            }));
        },

        streamStarted: function(stateModel) {

            // People wanted to keep the active
            // modal (tvshow/movie) detail open when
            // the streaming start.
            //
            // this.MovieDetail.close();
            //
            // uncomment previous line to close it

            this.Player.show(new App.View.Loading({
                model: stateModel
            }));
        },

        showPlayer: function(streamModel) {
            this.Player.show(new App.View.Player({
                model: streamModel
            }));
            this.Content.$el.hide();
            if(this.MovieDetail.$el !== undefined) {
                this.MovieDetail.$el.hide();
            }
        },

        showViews: function(streamModel) {

            this.Content.$el.show();
            if(this.MovieDetail.$el !== undefined) {
                this.MovieDetail.$el.show();
            }
            $(window).trigger('resize');

        }
    });

    App.View.MainWindow = MainWindow = MainWindow;
})(window.App);