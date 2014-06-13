(function(App) {
	'use strict';

	var resizeImage = App.Providers.Trakttv.resizeImage;

	var _this;
	var ShowDetail = Backbone.Marionette.ItemView.extend({
		template: '#show-detail-tpl',
		className: 'shows-container-contain',

		ui: {
			startStreaming: '.startStreaming',
			qselector: '.quality-selector',
			qinfo: '.quality-info'
		},

		events: {
			'click .watched': 'toggleWatched',
			'click .startStreaming': 'startStreaming',
			'click .tv-container-close': 'closeDetails',
			'click .tab-season': 'clickSeason',
			'click .tab-episode': 'clickEpisode',
			'dblclick .tab-episode': 'dblclickEpisode',
			'click #switch-hd-on': 'enableHD',
			'click #switch-hd-off': 'disableHD'
		},

		initialize: function() {
			_this = this;
			Mousetrap.bind('esc', function(e) {
				_this.closeDetails();
			});
			App.vent.on('shows:watched', this.markWatched);

			var images = this.model.get('images');
			images.fanart = resizeImage(images.fanart, '940');
			if((ScreenResolution.SD || ScreenResolution.HD) && !ScreenResolution.Retina) {
				// Screen Resolution of 720p or less is fine to have 300x450px image
				images.poster = resizeImage(images.poster, '300');
			}

			App.vent.on('shortcuts:show', function() {
				_this.initKeyboardShortcuts();
			});
			_this.initKeyboardShortcuts();
		},

		initKeyboardShortcuts: function() {
			Mousetrap.bind('backspace', _this.closeDetails);

			Mousetrap.bind('up', _this.previousEpisode);

			Mousetrap.bind('down', _this.nextEpisode);

			Mousetrap.bind('ctrl+up', _this.previousSeason);

			Mousetrap.bind('ctrl+down', _this.nextSeason);

			Mousetrap.bind(['enter', 'space'], _this.playEpisode);

			Mousetrap.bind('q', _this.toggleQuality);

			Mousetrap.bind('w', _this.toggleEpisodeWatched);
		},

        unbindKeyboardShortcuts: function() { // There should be a better way to do this
        	Mousetrap.unbind('backspace');

        	Mousetrap.unbind('up');

        	Mousetrap.unbind('down');

        	Mousetrap.unbind('ctrl+up');

        	Mousetrap.unbind('ctrl+down');

        	Mousetrap.unbind(['enter', 'space']);

        	Mousetrap.unbind('q');

        	Mousetrap.unbind('w');
        },

        onShow: function() {

        	this.selectSeason($('.tab-season:first'));
        	$('.star-container-tv').tooltip();

        	var background = $('.tv-poster-background').attr('data-bgr');
        	var bgCache = new Image();
        	bgCache.src = background;
        	bgCache.onload = function() {
        		$('.tv-poster-background')
        		.css('background-image', 'url(' + background + ')')
        		.fadeIn( 300 );
        		bgCache = null;
        	};

			// we'll mark episode already watched
			Database.getEpisodesWatched( this.model.get('tvdb_id') ,function(err, data) {
				_.each(data, _this.markWatched);
			});

		},

		toggleWatched: function (e) {
			var edata = e.currentTarget.id.split('-');
			var value = {
				show_id : _this.model.get('tvdb_id'),
				season  : edata[1],
				episode : edata[2],
				from_browser: true
			};

			Database.checkEpisodeWatched(value, function (watched, data) {
				if(watched) {
					App.vent.trigger ('shows:unwatched', value);
				} else {
					App.vent.trigger ('shows:watched', value);
				}
				_this.markWatched(value, !watched);
			});
		},

		markWatched: function (value, state) {
			state = (state === undefined) ? true : state;
			// we should never get any shows that aren't us, but you know, just in case.
			if (value.show_id === _this.model.get('tvdb_id')) {
				$('#watched-'+value.season+'-'+value.episode).toggleClass('true', state);
			} else {
				console.error ('something fishy happened with the watched signal', this.model, value);
			}
		},

		startStreaming: function(e) {
			e.preventDefault();
			var that = this;
			var title = that.model.get('title');
			var episode = $(e.currentTarget).attr('data-episode');
			var season = $(e.currentTarget).attr('data-season');
			var name = $(e.currentTarget).attr('data-title');

			title += ' - ' + i18n.__('Season') + ' '+ season + ', ' + i18n.__('Episode') + ' '+ episode +' - '+ name;
			var epInfo = {
				type: 'tvshow',
				imdbid: that.model.get('imdb_id'),
				tvdbid: that.model.get('tvdb_id'),
				season: season,
				episode: episode
			};

			var torrentStart = new Backbone.Model({
				torrent: $(e.currentTarget).attr('data-torrent'),
				backdrop: that.model.get('images').fanart,
				type: 'episode',
				show_id: that.model.get('tvdb_id'),
				episode: episode,
				season: season,
				title: title,
				status: that.model.get('status'),
				extract_subtitle: epInfo,
				defaultSubtitle: Settings.subtitle_language
			});
			_this.unbindKeyboardShortcuts();
			App.vent.trigger('stream:start', torrentStart);
		},

		closeDetails: function(e) {
			e.preventDefault();
			_this.unbindKeyboardShortcuts();
			App.vent.trigger('show:closeDetail');
		},

		clickSeason: function(e) {
			e.preventDefault();
			this.selectSeason($(e.currentTarget));
		},

		clickEpisode: function(e) {
			e.preventDefault();
			this.selectEpisode($(e.currentTarget));
		},

		dblclickEpisode: function(e) {
			e.preventDefault();
			this.selectEpisode($(e.currentTarget));
			$('.startStreaming').trigger('click');
		},
		 // Helper Function
		 selectSeason: function($elem) {
		 	$('.tab-season.active').removeClass('active');
		 	$elem.addClass('active');
		 	$('.tab-episodes').hide();
		 	$('.tab-episodes.current').removeClass('current');
		 	$('.tab-episode.active').removeClass('active');
			$('.tab-episodes.'+$elem.attr('data-tab')).addClass('current').scrollTop(0).show(); //pull the scroll always to top to
			this.selectEpisode($('.tab-episodes.'+$elem.attr('data-tab')+' li:first'));
		},

		selectEpisode: function($elem) {
			var tvdbid = $elem.attr('data-id');
			var torrents = {};
			torrents.q480 = $('.template-'+tvdbid+' .q480').text();
			torrents.q720 = $('.template-'+tvdbid+' .q720').text();
			if(torrents.q720 !== ''){
				torrents.def = torrents.q720;
			}else{
				torrents.def = torrents.q480;
			}
			if(torrents.q480 !== '' && torrents.q720 !== ''){
				if($('#switch-hd-off').is(':checked')){
					torrents.def = torrents.q480;
				}
				this.ui.qselector.show();
				this.ui.qinfo.hide();
			}else if(torrents.q720 !== ''){
				this.ui.qselector.hide();
				this.ui.qinfo.text('720p');
				this.ui.qinfo.show();
			}else{
				this.ui.qselector.hide();
				this.ui.qinfo.text('480p');
				this.ui.qinfo.show();
			}

			$('.tab-episode.active').removeClass('active');
			$elem.addClass('active');
			$('.episode-info-number').text(i18n.__('Episode') + ' '+$('.template-'+tvdbid+' .episode').html());
			$('.episode-info-title').text($('.template-'+tvdbid+' .title').text());
			$('.episode-info-date').text(i18n.__('Aired Date') + ': '+$('.template-'+tvdbid+' .date').html());
			$('.episode-info-description').text($('.template-'+tvdbid+' .overview').text());

			//pull the scroll always to top
			$('.episode-info-description').scrollTop(0);

			$('.movie-btn-watch-episode').attr('data-torrent', torrents.def);
			$('.movie-btn-watch-episode').attr('data-episodeid', tvdbid);

			// set var for player
			$('.movie-btn-watch-episode').attr('data-episode', $('.template-'+tvdbid+' .episode').html());
			$('.movie-btn-watch-episode').attr('data-season', $('.template-'+tvdbid+' .season').html());
			$('.movie-btn-watch-episode').attr('data-title', $('.template-'+tvdbid+' .title').html());

			this.ui.startStreaming.show();
		},

		enableHD: function () {
			win.info('HD Enabled');
			var tvdbid = $('.movie-btn-watch-episode').attr('data-episodeid'),
			torrent = $('.template-'+tvdbid+' .q720').text();
			$('.movie-btn-watch-episode').attr('data-torrent', torrent);
			win.debug(torrent);
		},

		disableHD: function () {
			win.info('HD Disabled');
			var tvdbid = $('.movie-btn-watch-episode').attr('data-episodeid'),
			torrent = $('.template-'+tvdbid+' .q480').text();
			$('.movie-btn-watch-episode').attr('data-torrent', torrent);
			win.debug(torrent);
		},

		nextEpisode: function(e) {
			var index = $('.tab-episode.active').index();
			if(index === $('.tab-episode:visible').length - 1) {
				return;
			}
			var $nextEpisode = $('.tab-episode:visible').eq(++index);
			_this.selectEpisode($nextEpisode);
			if(!_this.isElementVisible($nextEpisode[0])) {
				$nextEpisode[0].scrollIntoView(false);
			}
			e.preventDefault();
			e.stopPropagation();

		},

		previousEpisode: function(e) {
			var index = $('.tab-episode.active').index();
			if(index === 0) {
				return;
			}
			var $prevEpisode = $('.tab-episode:visible').eq(--index);
			_this.selectEpisode($prevEpisode);
			if(!_this.isElementVisible($prevEpisode[0])) {
				$prevEpisode[0].scrollIntoView(true);
			}
			e.preventDefault();
			e.stopPropagation();

		},

		nextSeason: function(e) {
			var index = $('.tab-season.active').index();
			if(index === $('.tab-season').length - 1) {
				return;
			}
			var $nextSeason = $('.tab-season').eq(++index);
			_this.selectSeason($nextSeason);
			if(!_this.isElementVisible($nextSeason[0])) {
				$nextSeason[0].scrollIntoView(false);
			}
			e.preventDefault();
			e.stopPropagation();
		},

		previousSeason: function(e) {
			var index = $('.tab-season.active').index();
			if(index === 0) {
				return;
			}
			var $prevSeason = $('.tab-season').eq(--index);
			_this.selectSeason($prevSeason);
			if(!_this.isElementVisible($prevSeason[0])) {
				$prevSeason[0].scrollIntoView(true);
			}
			e.preventDefault();
			e.stopPropagation();

		},

		playEpisode: function(e) {
			$('.startStreaming').trigger('click');
			e.preventDefault();
			e.stopPropagation();
		},

		toggleQuality: function(e) {

			if($('.quality').is(':visible')) {
				if($('#switch-hd-off').is(':checked')){
					$('#switch-hd-on').trigger('click');
				}
				else {
					$('#switch-hd-off').trigger('click');
				}
			}

		},

		toggleEpisodeWatched: function(e) {
			var data = {};
			data.currentTarget = $('.tab-episode.active span.watched')[0];
			_this.toggleWatched(data);
		},


		isElementVisible: function(el) {
			var eap,
			rect     = el.getBoundingClientRect(),
			docEl    = document.documentElement,
			vWidth   = window.innerWidth || docEl.clientWidth,
			vHeight  = window.innerHeight || docEl.clientHeight,
			efp      = function (x, y) {
				return document.elementFromPoint(x, y);
			},
			contains = 'contains' in el ? 'contains' : 'compareDocumentPosition',
			has      = contains === 'contains' ? 1 : 0x14;

            // Return false if it's not in the viewport
            if (rect.right < 0 || rect.bottom < 0
            	|| rect.left > vWidth || rect.top > vHeight) {
            	return false;
        }

            // Return true if any of its four corners are visible
            return (
            	(eap = efp(rect.left,  rect.top)) === el || el[contains](eap) === has
            	||  (eap = efp(rect.right, rect.top)) === el || el[contains](eap) === has
            	||  (eap = efp(rect.right, rect.bottom)) === el || el[contains](eap) === has
            	||  (eap = efp(rect.left,  rect.bottom)) === el || el[contains](eap) === has
            	);
        }

    });

App.View.ShowDetail = ShowDetail;
})(window.App);
