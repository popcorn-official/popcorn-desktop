(function(App) {
	'use strict';

	var resizeImage = App.Providers.Trakttv.resizeImage;

	App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
		template: '#movie-detail-tpl',
		className: 'app-overlay',

		ui: {
			selected_lang: '.selected-lang',
			bookmarkIcon: '.detail-favourites'
		},

		events: {
			'click .movie-btn.watch': 'startStreaming',
			'click .movie-btn.trailer': 'playTrailer',
			'click .movie-detail-close': 'closeDetails',
			'click #switch-hd-on': 'enableHD',
			'click #switch-hd-off': 'disableHD',
			'click .sub-dropdown': 'toggleDropdown',
			'click .sub-flag-icon': 'closeDropdown',
			'click .detail-favourites': 'toggleFavourite',
			'click .movie-imdb-link': 'openIMDb'
		},

		initialize: function() {
			this.model.set('backdrop', resizeImage(this.model.get('backdrop'), '940'));
			if((ScreenResolution.SD || ScreenResolution.HD) && !ScreenResolution.Retina) {
				// Screen Resolution of 720p or less is fine to have 300x450px image
				this.model.set('image', resizeImage(this.model.get('image'), '300'));
			}

			App.vent.on('shortcuts:movie', function() {
				this.initKeyboardShortcuts();
			});

			this.initKeyboardShortcuts();
			this.model.on('change:quality', this.renderHealth, this);
		},

		initKeyboardShortcuts: function() {
			Mousetrap.bind('backspace', this.closeDetails);
            Mousetrap.bind(['enter', 'space'], function(e) {
               $('.movie-btn.watch').click();
            });
			Mousetrap.bind('q', this.toggleQuality);
		},

        unbindKeyboardShortcuts: function() { // There should be a better way to do this
        	Mousetrap.unbind('backspace');
        	Mousetrap.unbind(['enter', 'space']);
        	Mousetrap.unbind('q');
        },

        onShow: function() {
        	win.info('Show movie detail');

        	var torrents = this.model.get('torrents');
        	if (torrents['720p'] !== undefined && torrents['1080p'] !== undefined) {
        		this.model.set('quality', '1080p');
        	} else if(torrents['1080p'] !== undefined ) {
        		this.model.set('quality', '1080p');
        	} else if(torrents['720p'] !== undefined ) {
        		this.model.set('quality', '720p');
        	} else if(torrents['HDRip'] !== undefined ) {
        		this.model.set('quality', 'HDRip');
        	}

        	$('.star-container,.movie-imdb-link').tooltip();

        	var backgroundUrl = $('.movie-backdrop').attr('data-bgr');

        	var bgCache = new Image();
        	bgCache.src = backgroundUrl;
        	bgCache.onload = function() {
        		$('.movie-backdrop').css('background-image', 'url(' + backgroundUrl + ')').fadeIn(500);
        		bgCache = null;
        	};

        	var coverUrl = $('.movie-cover-image').attr('data-cover');

        	var coverCache = new Image();
        	coverCache.src = coverUrl;
        	coverCache.onload = function() {
        		$('.movie-cover-image').attr('src', coverUrl).fadeTo(500, 1);
        		coverCache = null;
        	};

			// switch to default subtitle
			this.switchSubtitle(Settings.subtitle_language);

			if (this.model.get('bookmarked') === true) {
				this.ui.bookmarkIcon.addClass('selected').text( i18n.__('Remove from bookmarks') );
			}

			// add ESC to close this popup
			Mousetrap.bind('esc', function(e) {
				App.vent.trigger('movie:closeDetail');
			});

		},

		onClose: function() {},

		toggleDropdown: function(e) {
			if($('.sub-dropdown').is('.open')) {
				this.closeDropdown(e);
				return false;
			}else{
				$('.sub-dropdown').addClass('open');
			}
			var self = this;
			$('.flag-container').fadeIn();
		},

		closeDropdown: function(e) {
			e.preventDefault();
			$('.flag-container').fadeOut();
			$('.sub-dropdown').removeClass('open');

			var value = $(e.currentTarget).attr('data-lang');
			if(value) {
				this.switchSubtitle(value);
			}
		},

		switchSubtitle: function(lang) {
			var subtitles = this.model.get('subtitle');

			if (subtitles === undefined || subtitles[lang] === undefined) {
				lang = 'none';
			}

			this.subtitle_selected = lang;
			this.ui.selected_lang.removeClass().addClass('flag toggle selected-lang').addClass(this.subtitle_selected);

			win.info('Subtitle: ' + this.subtitle_selected);
		},

		startStreaming: function() {
			var torrentStart = new Backbone.Model({
				imdb_id: this.model.get('imdb_id'),
				torrent: this.model.get('torrents')[this.model.get('quality')].url,
				backdrop: this.model.get('backdrop'),
				subtitle: this.model.get('subtitle'),
				defaultSubtitle: this.subtitle_selected,
				title: this.model.get('title'),
				type: 'movie',
			});
			this.unbindKeyboardShortcuts();
			App.vent.trigger('stream:start', torrentStart);
		},

		playTrailer: function() {
			var trailer = new Backbone.Model({
				src: this.model.get('trailer'),
				type: 'video/youtube',
				subtitle: null,
				title: this.model.get('title')
			});
			App.vent.trigger('stream:ready', trailer);
		},

		closeDetails: function() {
			this.unbindKeyboardShortcuts();
			App.vent.trigger('movie:closeDetail');
		},

		enableHD: function () {
			var torrents = this.model.get('torrents');
			win.info('HD Enabled');

			if (torrents['1080p'] !== undefined) {
				torrents = this.model.get('torrents');
				this.model.set('quality', '1080p');
				win.debug(this.model.get('quality'));
			}
		},

		disableHD: function () {
			var torrents = this.model.get('torrents');
			win.info('HD Disabled');

			if (torrents['720p'] !== undefined) {
				torrents = this.model.get('torrents');
				this.model.set('quality', '720p');
				win.debug(this.model.get('quality'));
			}
		},

		renderHealth: function () {
			var torrent = this.model.get('torrents')[this.model.get('quality')];
			var health = torrent.health.capitalize();
			var ratio = torrent.peer > 0 ? torrent.seed / torrent.peer : +torrent.seed;

			$('.health-icon').tooltip({html: true})
			.removeClass('Bad Medium Good Excellent')
			.addClass(health)
			.attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio') + ': ' + ratio.toFixed(2) + ' <br> ' + i18n.__('Seeds') + ': ' + torrent.seed + ' - ' + i18n.__('Peers') + ': ' + torrent.peer)
			.tooltip('fixTitle');
		},


		toggleFavourite: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var that = this;
			if (this.model.get('bookmarked') === true) {
				Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
					win.info('Bookmark deleted');
					that.model.set('bookmarked', false);
					that.ui.bookmarkIcon.removeClass('selected').text( i18n.__('Add to bookmarks') );
					// we'll make sure we dont have a cached movie
					App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb'), 1));
					Database.deleteMovie(that.model.get('imdb'),function(err, data) {});
				});
			} else {

				// we need to have this movie cached
				// for bookmarking
				var movie = {
					imdb: this.model.get('imdb'),
					image: this.model.get('image'),
					torrents: this.model.get('torrents'),
					title: this.model.get('title'),
					synopsis: this.model.get('synopsis'),
					runtime: this.model.get('runtime'),
					year: this.model.get('year'),
					health: this.model.get('health'),
					subtitle: this.model.get('subtitle'),
					backdrop: this.model.get('backdrop'),
					rating: this.model.get('rating'),
					trailer: this.model.get('trailer'),
				};

				Database.addMovie(movie, function(error,result) {
					Database.addBookmark(that.model.get('imdb'), 'movie', function(err, data) {
						win.info('Bookmark added');
						that.ui.bookmarkIcon.addClass('selected').text( i18n.__('Remove from bookmarks') );
						that.model.set('bookmarked', true);
						App.userBookmarks.push(that.model.get('imdb'));
					});
				});

			}
		},

		openIMDb: function() {
			gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
		},

		toggleQuality: function(e) {
			if($('#switch-hd-off').is(':checked')){
				$('#switch-hd-on').trigger('click');
			}
			else {
				$('#switch-hd-off').trigger('click');
			}

			e.preventDefault();
			e.stopPropagation();
		},

	});
})(window.App);
