(function (App) {
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
			Keyboard: '#keyboard-container',
			Help: '#help-container',
			TorrentCollection: '#torrent-collection-container',
			Issue: '#issue-container'
		},

		ui: {
			posterswidth_alert: '.notification_alert'
		},

		events: {
			'dragover': 'preventDefault',
			'drop': 'preventDefault',
			'dragstart': 'preventDefault',
			'click .links': 'links'
		},

		initialize: function () {
			_this = this;

			_.each(_this.regionManager._regions, function (element, index) {
				element.on('show', function (view) {
					if (view.className) {
						App.ViewStack.push(view.className);
					}
					App.vent.trigger('viewstack:push', view.className);
				});

				element.on('close', function (view) {
					App.ViewStack.pop();
					App.vent.trigger('viewstack:pop', view.className);
				});
			});

			this.nativeWindow = require('nw.gui').Window.get();

			// Application events
			App.vent.on('movies:list', _.bind(this.showMovies, this));
			App.vent.on('shows:list', _.bind(this.showShows, this));
			App.vent.on('anime:list', _.bind(this.showAnime, this));
			App.vent.on('favorites:list', _.bind(this.showFavorites, this));
			App.vent.on('favorites:render', _.bind(this.renderFavorites, this));
			App.vent.on('watchlist:list', _.bind(this.showWatchlist, this));
			App.vent.on('shows:update', _.bind(this.updateShows, this));
			App.vent.on('shows:init', _.bind(this.initShows, this));

			// Add event to show disclaimer
			App.vent.on('show:disclaimer', _.bind(this.showDisclaimer, this));
			App.vent.on('close:disclaimer', _.bind(this.Disclaimer.close, this.Disclaimer));

			// Add event to show about
			App.vent.on('about:show', _.bind(this.showAbout, this));
			App.vent.on('about:close', _.bind(this.About.close, this.About));

			// Keyboard
			App.vent.on('keyboard:show', _.bind(this.showKeyboard, this));
			App.vent.on('keyboard:close', _.bind(this.Keyboard.close, this.Keyboard));
			App.vent.on('keyboard:toggle', _.bind(this.toggleKeyboard, this));

			// Help
			App.vent.on('help:show', _.bind(this.showHelp, this));
			App.vent.on('help:close', _.bind(this.Help.close, this.Help));
			App.vent.on('help:toggle', _.bind(this.toggleHelp, this));

			// Issue
			App.vent.on('issue:new', _.bind(this.showIssue, this));
			App.vent.on('issue:close', _.bind(this.Issue.close, this.Issue));

			// Movies
			App.vent.on('movie:showDetail', _.bind(this.showMovieDetail, this));
			App.vent.on('movie:closeDetail', _.bind(this.closeMovieDetail, this.MovieDetail));

			// Torrent collection
			App.vent.on('torrentCollection:show', _.bind(this.showTorrentCollection, this));
			App.vent.on('torrentCollection:close', _.bind(this.TorrentCollection.close, this.TorrentCollection));

			// Tv Shows
			App.vent.on('show:showDetail', _.bind(this.showShowDetail, this));
			App.vent.on('show:closeDetail', _.bind(this.closeShowDetail, this.MovieDetail));

			// Settings events
			App.vent.on('settings:show', _.bind(this.showSettings, this));
			App.vent.on('settings:close', _.bind(this.Settings.close, this.Settings));

			App.vent.on('system:openFileSelector', _.bind(this.showFileSelector, this));
			App.vent.on('system:closeFileSelector', _.bind(this.FileSelector.close, this.FileSelector));

			App.vent.on('system:traktAuthenticated', _.bind(this.syncTraktOnStart, this));

			// Stream events
			App.vent.on('stream:started', _.bind(this.streamStarted, this));
			App.vent.on('stream:ready', _.bind(this.streamReady, this));
			App.vent.on('stream:local', _.bind(this.showPlayer, this));
			App.vent.on('player:close', _.bind(this.showViews, this));
			App.vent.on('player:close', _.bind(this.Player.close, this.Player));

			App.vent.on('vpn:connect', _.bind(this.connectVpn, this));

			App.vent.on('updatePostersSizeStylesheet', _.bind(this.updatePostersSizeStylesheet, this));
		},

		showSubtitles: function (model) {
			win.debug('Show subs', model);
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
						fs.mkdir(Settings.tmpLocation, function (err) {
							if (!err || err.errno === '-4075') {
								//success
							} else {
								Settings.tmpLocation = path.join(os.tmpDir(), 'Popcorn-Time');
								fs.mkdir(Settings.tmpLocation);
							}
						});
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

					that.InitModal.close();

					var lastOpen = (Settings.startScreen === 'Last Open') ? true : false;

					if (Settings.startScreen === 'Watchlist' || (lastOpen && Settings.lastTab === 'Watchlist')) {
						that.showWatchlist();
					} else if (Settings.startScreen === 'Favorites' || (lastOpen && Settings.lastTab === 'Favorites')) {
						that.showFavorites();
					} else if (Settings.startScreen === 'TV Series' || (lastOpen && Settings.lastTab === 'TV Series')) {
						that.showShows();
					} else if (Settings.startScreen === 'Anime' || (lastOpen && Settings.lastTab === 'Anime')) {
						that.showAnime();
					} else {
						that.showMovies();
					}

					// do we celebrate events?
					if (AdvSettings.get('events')) {
						$('.events').css('display', 'block');
					}

					// set player from settings
					var players = App.Device.Collection.models;
					for (var i in players) {
						if (players[i].id === AdvSettings.get('chosenPlayer')) {
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
			this.Settings.close();
			this.MovieDetail.close();

			this.Content.show(new App.View.MovieBrowser());
		},

		showShows: function (e) {
			this.Settings.close();
			this.MovieDetail.close();

			this.Content.show(new App.View.ShowBrowser());
		},

		showAnime: function (e) {
			this.Settings.close();
			this.MovieDetail.close();

			this.Content.show(new App.View.AnimeBrowser());
		},

		updateShows: function (e) {
			var that = this;
			App.vent.trigger('show:closeDetail');
			this.Content.show(new App.View.InitModal());
			App.db.syncDB(function () {
				that.InitModal.close();
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

		showFavorites: function (e) {
			this.Settings.close();
			this.MovieDetail.close();

			this.Content.show(new App.View.FavoriteBrowser());
		},

		renderFavorites: function (e) {
			this.Content.show(new App.View.FavoriteBrowser());
			App.currentview = 'Favorites';
			$('.right .search').hide();
			$('.filter-bar').find('.active').removeClass('active');
			$('#filterbar-favorites').addClass('active');
		},

		showWatchlist: function (e) {
			this.Settings.close();
			this.MovieDetail.close();

			this.Content.show(new App.View.WatchlistBrowser());
		},

		showDisclaimer: function (e) {
			this.Disclaimer.show(new App.View.DisclaimerModal());
		},

		showAbout: function (e) {
			this.About.show(new App.View.About());
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
			_this.MovieDetail.close();
			App.vent.trigger('shortcuts:movies');
		},

		showShowDetail: function (showModel) {
			this.MovieDetail.show(new App.View.ShowDetail({
				model: showModel
			}));
		},

		closeShowDetail: function (showModel) {
			_this.MovieDetail.close();
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
			// this.MovieDetail.close();
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
			try {
				this.MovieDetail.$el.show();
				this.MovieDetail.el.firstElementChild.classList == "shows-container-contain" ? App.vent.trigger('shortcuts:shows'): App.vent.trigger('shortcuts:movies');
			} catch (err) {};
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
		},

		links: function (e) {
			e.preventDefault();
			gui.Shell.openExternal($(e.currentTarget).attr('href'));
		}
	});

	App.View.MainWindow = MainWindow = MainWindow;
})(window.App);
