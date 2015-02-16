(function (App) {
	'use strict';

	var _this;

	var MainWindow = Backbone.Marionette.LayoutView.extend({
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
			Keyboard: '#keyboard-container',
			Help: '#help-container',
			TorrentCollection: '#torrent-collection-container',
			Issue: '#issue-container',
			Calendar: '#calendar-container'
		},

		ui: {
			posterswidth_alert: '.notification_alert'
		},

		events: {
			'dragover': 'preventDefault',
			'drop': 'preventDefault',
			'dragstart': 'preventDefault',
		},

		initialize: function () {
			_this = this;

			_.each(_this.regionManager._regions, function (element, index) {
				
				element.on('show', function (view) {
					console.log('viewstack:push', view.className);
					if (view.className) {
						App.ViewStack.push(view.className);
					}
					App.vent.trigger('viewstack:push', view.className);

					// console.log('viewstack.push.after', App.ViewStack);
				});

				/**
				 * Marionette 2.x changed close to destroy, and doesn't pass along a view anymore.
				 * TODO: Find better solution
				 */
				element.on('destroy', function (view) {
					console.info('### destroy.view ###', view);
					if (typeof view === 'undefined' && element.currentView !== null) {
						view = element.currentView;
					}
					var viewName = (typeof view !== 'undefined' ? view.className : 'unknown');
					App.ViewStack.pop();
					App.vent.trigger('viewstack:pop', viewName);
					console.log('viewstack:pop', viewName);
					if (typeof element.currentView !== 'undefined') element.currentView.destroy();

					// console.log('viewstack.pop.after', App.ViewStack);
				});
			});

			this.nativeWindow = require('nw.gui').Window.get();

			// Application events
			App.vent.on('movies:list', _.bind(this.showMovies, this));
			App.vent.on('shows:list', _.bind(this.showShows, this));
			App.vent.on('anime:list', _.bind(this.showAnime, this));
			App.vent.on('favorites:list', _.bind(this.showFavorites, this));
			App.vent.on('watchlist:list', _.bind(this.showWatchlist, this));
			App.vent.on('shows:update', _.bind(this.updateShows, this));
			App.vent.on('shows:init', _.bind(this.initShows, this));

			// Add event to show disclaimer
			App.vent.on('disclaimer:show', _.bind(this.showDisclaimer, this));
			App.vent.on('disclaimer:close', _.bind(this.Disclaimer.destroy, this.Disclaimer));

			// Add event to show about
			App.vent.on('about:show', _.bind(this.showAbout, this));
			App.vent.on('about:close', _.bind(this.About.destroy, this.About));

			// Keyboard
			App.vent.on('keyboard:show', _.bind(this.showKeyboard, this));
			App.vent.on('keyboard:close', _.bind(this.Keyboard.destroy, this.Keyboard));
			App.vent.on('keyboard:toggle', _.bind(this.toggleKeyboard, this));

			// Help
			App.vent.on('help:show', _.bind(this.showHelp, this));
			App.vent.on('help:close', _.bind(this.Help.destroy, this.Help));
			App.vent.on('help:toggle', _.bind(this.toggleHelp, this));

			// Issue
			App.vent.on('issue:new', _.bind(this.showIssue, this));
			App.vent.on('issue:close', _.bind(this.Issue.destroy, this.Issue));

			// Calendar
			App.vent.on('calendar:show', _.bind(this.showCalendar, this));
			App.vent.on('calendar:close', _.bind(this.Calendar.destroy, this.Calendar));

			// Movies
			App.vent.on('movie:showDetail', _.bind(this.showMovieDetail, this));
			App.vent.on('movie:closeDetail', _.bind(this.closeMovieDetail, this.MovieDetail));
			
			// Torrent collection
			App.vent.on('torrentCollection:show', _.bind(this.showTorrentCollection, this));
			App.vent.on('torrentCollection:close', _.bind(this.TorrentCollection.destroy, this.TorrentCollection));

			// Tv Shows
			App.vent.on('show:showDetail', _.bind(this.showShowDetail, this));
			App.vent.on('show:closeDetail', _.bind(this.closeShowDetail, this.MovieDetail));

			// Settings events
			App.vent.on('settings:show', _.bind(this.showSettings, this));
			App.vent.on('settings:close', _.bind(this.Settings.destroy, this.Settings));

			App.vent.on('system:openFileSelector', _.bind(this.showFileSelector, this));
			App.vent.on('system:closeFileSelector', _.bind(this.FileSelector.destroy, this.FileSelector));

			App.vent.on('system:traktAuthenticated', _.bind(this.syncTraktOnStart, this));

			// Stream events
			App.vent.on('stream:started', _.bind(this.streamStarted, this));
			App.vent.on('stream:ready', _.bind(this.streamReady, this));
			App.vent.on('stream:local', _.bind(this.showPlayer, this));
			App.vent.on('player:close', _.bind(this.showViews, this));
			App.vent.on('player:close', _.bind(this.Player.destroy, this.Player));

			App.vent.on('vpn:connect', _.bind(this.connectVpn, this));

			App.vent.on('updatePostersSizeStylesheet', _.bind(this.updatePostersSizeStylesheet, this));
		},

		showSubtitles: function (model) {
			console.log('Show subs', model);
			var s = new App.View.Subtitles({
				model: model
			});
			s.render();
		},

		onShow: function () {
			this.Header.show(new App.View.TitleBar());
			// Set the app title (for Windows mostly)
			this.nativeWindow.title = App.Config.title;

			// Show loading modal on startup
			var that = this;
			this.Content.show(new App.View.InitModal());
			App.db.initialize()
				.then(function () {

					// Create the System Temp Folder. This is used to store temporary data like movie files.
					if (!fs.existsSync(Settings.tmpLocation)) {
						fs.mkdir(Settings.tmpLocation);
					}

					try {
						require('fs').statSync('src/app/themes/' + Settings.theme + '.css');
					} catch (e) {
						Settings.theme = 'Official_-_Dark_theme';
						AdvSettings.set('theme', 'Official_-_Dark_theme');
					}

					$('link#theme').attr('href', 'themes/' + Settings.theme + '.css');
					// Always on top
					win.setAlwaysOnTop(App.settings.alwaysOnTop);

					// we check if the disclaimer is accepted
					if (!AdvSettings.get('disclaimerAccepted')) {
						that.showDisclaimer();
					}

					that.InitModal.destroy();

					if (AdvSettings.get('startScreen') === 'Watchlist') {
						that.showWatchlist();
					} else if (AdvSettings.get('startScreen') === 'Favorites') {
						that.showFavorites();
					} else if (AdvSettings.get('startScreen') === 'TV Series') {
						that.showShows();
					} else if (AdvSettings.get('startScreen') === 'Anime') {
						that.showAnime();
					} else {
						that.showMovies();
					}

					// do we celebrate events?
					if (AdvSettings.get('events')) {
						$('.events').css('display','block');
					}

					// set player from settings
					var players = App.Device.Collection.models;
					for (var i in players) {
						if (players[i].id == AdvSettings.get('chosenPlayer')) {
							App.Device.Collection.setDevice(AdvSettings.get('chosenPlayer'));
						}
					}

					// Focus the window when the app opens
					that.nativeWindow.focus();

				});

			// Cancel all new windows (Middle clicks / New Tab)
			this.nativeWindow.on('new-win-policy', function (frame, url, policy) {
				policy.ignore();
			});

			App.vent.trigger('updatePostersSizeStylesheet');
			App.vent.trigger('main:ready');

		},

		showMovies: function (e) {
			this.Settings.destroy();
			this.MovieDetail.destroy();

			this.Content.show(new App.View.MovieBrowser());
		},

		showShows: function (e) {
			this.Settings.destroy();
			this.MovieDetail.destroy();

			this.Content.show(new App.View.ShowBrowser());
		},

		showAnime: function (e) {
			this.Settings.destroy();
			this.MovieDetail.destroy();

			this.Content.show(new App.View.AnimeBrowser());
		},

		updateShows: function (e) {
			var that = this;
			App.vent.trigger('show:closeDetail');
			this.Content.show(new App.View.InitModal());
			App.db.syncDB(function () {
				that.InitModal.destroy();
				that.showShows();
				// Focus the window when the app opens
				that.nativeWindow.focus();

			});
		},

		connectVpn: function (e) {
			App.VPNClient.launch();
		},

		// used in app to re-triger a api resync
		initShows: function (e) {
			var that = this;
			App.vent.trigger('settings:close');
			this.Content.show(new App.View.InitModal());
			App.db.initDB(function (err, data) {
				that.InitModal.destroy();

				if (!err) {
					// we write our new update time
					AdvSettings.set('tvshow_last_sync', +new Date());
				}

				App.vent.trigger('shows:list');
				// Focus the window when the app opens
				that.nativeWindow.focus();

			});
		},

		showFavorites: function (e) {
			this.Settings.destroy();
			this.MovieDetail.destroy();

			this.Content.show(new App.View.FavoriteBrowser());
		},

		showWatchlist: function (e) {
			this.Settings.destroy();
			this.MovieDetail.destroy();

			this.Content.show(new App.View.WatchlistBrowser());
		},

		showDisclaimer: function (e) {
			this.Disclaimer.show(new App.View.DisclaimerModal());
		},

		showAbout: function (e) {
			this.About.show(new App.View.About());
		},

		showCalendar: function(e) {
			this.Calendar.show(new App.View.Calendar());
		},

		showTorrentCollection: function (e) {
			this.TorrentCollection.show(new App.View.TorrentCollection());
		},

		showKeyboard: function (e) {
			this.Keyboard.show(new App.View.Keyboard());
		},

		toggleKeyboard: function (e) {
			if ($('.keyboard-container').length > 0) {
				App.vent.trigger('keyboard:close');
			} else {
				this.showKeyboard();
			}
		},

		showHelp: function (e) {
			this.Help.show(new App.View.Help());
		},

		toggleHelp: function (e) {
			if ($('.help-container').length > 0) {
				App.vent.trigger('help:close');
			} else {
				this.showHelp();
			}
		},

		showIssue: function (e) {
			this.Issue.show(new App.View.Issue());
		},

		preventDefault: function (e) {
			e.preventDefault();
		},

		showMovieDetail: function (movieModel) {
			this.MovieDetail.show(new App.View.MovieDetail({
				model: movieModel
			}));
		},

		closeMovieDetail: function (movieModel) {
			_this.MovieDetail.destroy();
			App.vent.trigger('shortcuts:movies');
		},

		showShowDetail: function (showModel) {
			this.MovieDetail.show(new App.View.ShowDetail({
				model: showModel
			}));
		},

		closeShowDetail: function (showModel) {
			_this.MovieDetail.destroy();
			App.vent.trigger('shortcuts:shows');
		},

		showFileSelector: function (fileModel) {
            App.vent.trigger('about:close');
			App.vent.trigger('stream:stop');
			App.vent.trigger('player:close');
			this.FileSelector.show(new App.View.FileSelector({
				model: fileModel
			}));
		},

		showSettings: function (settingsModel) {
			this.Settings.show(new App.View.Settings({
				model: settingsModel
			}));
		},

		syncTraktOnStart: function () {
			if (Settings.syncOnStart) {
				Database.deleteWatched();
				App.Trakt.sync();
			}
		},

		streamStarted: function (stateModel) {

			// People wanted to keep the active
			// modal (tvshow/movie) detail open when
			// the streaming start.
			//
			// this.MovieDetail.destroy();
			//
			// uncomment previous line to close it

			this.Player.show(new App.View.Loading({
				model: stateModel
			}));
		},

		streamReady: function (streamModel) {
			App.Device.Collection.startDevice(streamModel);
		},

		showPlayer: function (streamModel) {
			this.Player.show(new App.View.Player({
				model: streamModel
			}));
			this.Content.$el.hide();
			if (this.MovieDetail.$el !== undefined) {
				this.MovieDetail.$el.hide();
			}
		},

		showViews: function (streamModel) {

			this.Content.$el.show();
			if (this.MovieDetail.$el !== undefined) {
				this.MovieDetail.$el.show();
			}
			$(window).trigger('resize');
		},

		updatePostersSizeStylesheet: function () {

			var that = this;

			App.db.getSetting({
					key: 'postersWidth'
				})
				.then(function (doc) {
					var postersWidth = doc.value;
					var postersHeight = Math.round(postersWidth * Settings.postersSizeRatio);
					var postersWidthPercentage = (postersWidth - Settings.postersMinWidth) / (Settings.postersMaxWidth - Settings.postersMinWidth) * 100;
					var fontSize = ((Settings.postersMaxFontSize - Settings.postersMinFontSize) * postersWidthPercentage / 100) + Settings.postersMinFontSize;

					var stylesheetContents = [
						'.list .items .item {',
						'width:', postersWidth, 'px;',
						'}',

						'.list .items .item .cover,',
						'.load-more {',
						'background-size: cover;',
						'width: ', postersWidth, 'px;',
						'height: ', postersHeight, 'px;',
						'}',

						'.item {',
						'font-size: ' + fontSize + 'em;',
						'}'
					].join('');

					$('#postersSizeStylesheet').remove();

					$('<style>', {
						'id': 'postersSizeStylesheet'
					}).text(stylesheetContents).appendTo('head');

					// Copy the value to Settings so we can get it from templates
					Settings.postersWidth = postersWidth;

					// Display PostersWidth
					var humanReadableWidth = Number(postersWidthPercentage + 100).toFixed(0) + '%';
					if (typeof App.currentview !== 'undefined') {
						that.ui.posterswidth_alert.show().text(i18n.__('Posters Size') + ': ' + humanReadableWidth).delay(3000).fadeOut(400);
					}
				});
		}
	});

	App.View.MainWindow = MainWindow = MainWindow;
})(window.App);
