(function(App) {
  'use strict';

  var _this;
  App.View.PlayControl = Marionette.View.extend({
    template: '#play-control-tpl',
    ui: {
      showTorrents: '.show-all-torrents',
      bookmarkIcon: '.favourites-toggle',
      watchedIcon: '.watched-toggle'
    },
    events: {
      'click #watch-now': 'startStreaming',
      'click #watch-trailer': 'playTrailer',
      'click #download-torrent': 'downloadTorrent',
      'click #show-all-torrents': 'showAllTorrents',
      'click .favourites-toggle': 'toggleFavourite',
      'click .playerchoicemenu li a': 'selectPlayer',
      'click .playerchoicehelp': 'showPlayerList',
      'click .playerchoicerefresh': 'refreshPlayerList',
      'click .watched-toggle': 'toggleWatched',
      'mousedown #subs-dropdown': 'hideTooltipsSubs',
      'click .connect-opensubtitles': 'connectOpensubtitles',
      'click #audio-dropdown': 'hideTooltips',
      'click #quality-selector': 'hideTooltips'
    },
    regions: {
      subDropdown: '#subs-dropdown',
      audioDropdown: '#audio-dropdown',
      qualitySelector: '#quality-selector',
    },

    initialize: function() {
      _this = this;
      this.views = {};
      var providers = this.model.get('providers');
      var subtitleProvider = App.Config.getProviderForType('subtitle');
      subtitleProvider.detail(
        this.model.get('imdb_id'),
        this.model.get('title')
      );
      if (!this.model.get('langs')) {
        this.model.set('langs', { en: this.model.get('torrents') });
      } else {
        this.model.set('torrents', this.model.get('langs')[this.model.get('defaultAudio')]);
      }
      this.model.set('showTorrentsMore', providers.torrent.feature('torrents'));
      this.model.set('showTorrents', false);

      App.vent.on('sub:lang', this.switchSubtitle.bind(this));
      App.vent.on('audio:lang', this.switchAudio.bind(this));
      App.vent.on(
        'update:subtitles',
        function(subs) {
          this.views.sub.updateLangs(subs);
        }.bind(this)
      );

      this.model.on(
        'change:quality',
        function() {
          App.vent.trigger('change:quality', this.model.get('quality'));
        }.bind(this)
      );
    },

    onAttach: function() {
      this.hideUnused();

      this.loadComponents();
      this.setUiStates();
      this.model.on('change:langs', this.loadAudioDropdown.bind(this));
      this.model.on('change:subtitle', this.loadSubDropdown.bind(this));
      this.model.set('showTorrents', false);
      this.ui.showTorrents.show();

      $('.playerchoicerefresh, .playerchoicehelp').tooltip({html: true, delay: {'show': 800,'hide': 100}});

      if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
        $('.button:not(#download-torrent)').addClass('disabled');
        $('#watch-now, #watch-trailer, .playerchoice').prop('disabled', true);
      }
    },

    setQuality: function(torrent, key) {
      _this.model.set('quality', key);
      App.vent.trigger('change:quality', key);
    },

    hideUnused: function() {
      if (!this.model.get('torrents')) {
        // no torrents
        $('#player-chooser, #audio-dropdown, #subs-dropdown').hide();
      }

      if (!this.model.get('trailer')) {
        $('#watch-trailer').hide();
      }
    },

    loadDropdown: function(type, attrs) {
      this.views[type] && this.views[type].destroy();
      this.views[type] = new App.View.LangDropdown({
        model: new App.Model.Lang(Object.assign({ type: type }, attrs))
      });
      var types = type + 'Dropdown';
      this.getRegion(types).show(this.views[type]);
    },

    loadAudioDropdown: function() {
      return this.loadDropdown('audio', {
        title: i18n.__('Audio Language'),
        selected: this.model.get('defaultAudio'),
        values: this.model.get('langs')
      });
    },

    loadSubDropdown: function() {
      return this.loadDropdown('sub', {
        title: i18n.__('Subtitle'),
        selected: this.model.get('defaultSubtitle'),
        hasNull: true,
        values: this.model.get('subtitle')
      });
    },

    loadQualitySelector: function () {
      var qualitySelector = new App.View.QualitySelector({
        model: new Backbone.Model({
          torrents: this.model.get('torrents'),
          selectCallback: this.setQuality,
          required: [],
          defaultQualityKey: 'movies_default_quality',
        }),
      });
      this.getRegion('qualitySelector').show(qualitySelector);
    },

    loadComponents: function() {
      this.loadAudioDropdown();
      this.loadSubDropdown();
      this.loadQualitySelector();

      // player chooser
      App.Device.Collection.setDevice(Settings.chosenPlayer);
      App.Device.ChooserView('#player-chooser').render();
    },

    setUiStates: function() {
      $('.star-container,.movie-imdb-link,.q720,input,.magnet-link,.source-link,.show-cast').tooltip({
        html: true
      });

      // Bookmarked / not bookmarked
      if (this.model.get('bookmarked')) {
        this.ui.bookmarkIcon.addClass('selected');
      }

      // Seen / Unseen
      if (this.model.get('watched')) {
        this.ui.watchedIcon.addClass('selected');
      }
      // display stars or number
      if (!Settings.ratingStars) {
        $('.star-container').addClass('hidden');
        $('.number-container').removeClass('hidden');
      }

      // switch to default subtitle
      this.switchSubtitle(Settings.subtitle_language);

      this.setTooltips();
    },

    setTooltips: function() {
      // watched state
      var watched = this.model.get('watched');
      var textWatched = watched ? 'Seen' : 'Not Seen';
      var textWatchedHover = watched ? 'Mark as unseen' : 'Mark as Seen';
      this.ui.watchedIcon.text(i18n.__(textWatched));

      this.ui.watchedIcon.hover(
        function() {
          this.ui.watchedIcon.text(i18n.__(textWatchedHover));
        }.bind(this),
        function() {
          this.ui.watchedIcon.text(i18n.__(textWatched));
        }.bind(this)
      );

      // favorite state
      var bookmarked = this.model.get('bookmarked');
      var textBookmarked = bookmarked
        ? 'Remove from bookmarks'
        : 'Add to bookmarks';
      this.ui.bookmarkIcon.text(i18n.__(textBookmarked));
    },

    hideTooltips: function () {
      $('#subs-dropdown .flag.toggle, #audio-dropdown .flag.toggle, #quality-selector .qselect').tooltip('hide');
    },

    hideTooltipsSubs: function (e) {
      this.hideTooltips();
      if (e.button === 2) {
        nw.Shell.openExternal('https://www.opensubtitles.org/search/sublanguageid-all/' + (this.model.get('imdb_id') ? this.model.get('imdb_id').replace('tt', 'imdbid-') : ''));
      }
    },

    connectOpensubtitles: function () {
      App.vent.trigger('movie:closeDetail');
      App.vent.trigger('settings:show');
      $('.settings-container-contain').scrollTop($('.settings-container-contain')[0].scrollHeight);
      $('#opensubtitlesUsername').attr('style', 'border: 2px solid !important; animation: fadeBd .5s forwards, fa-beat 0.8s; margin-left: 9px; --fa-beat-scale: 1.2').focus().focusout(function() { this.removeAttribute('style'); });
    },

    switchSubtitle: function(lang) {
      var subtitles = this.model.get('subtitle') || this.views.sub.values;
      if (subtitles === undefined || subtitles[lang] === undefined) {
        lang = 'none';
      }
      this.subtitle_selected = lang;
    },

    switchAudio: function(lang) {
      var audios = this.model.get('langs');
      if (audios === undefined || audios[lang] === undefined) {
        lang = 'none';
      }
      this.old_audio_selected = this.audio_selected;
      this.audio_selected = lang;

      if (this.getRegion('qualitySelector').currentView) {
        this.model.set('torrents', audios[lang]);
        this.getRegion('qualitySelector').currentView.updateTorrents(audios[lang]);
      }

      if (this.model.get('showTorrents') && this.old_audio_selected !== this.audio_selected) {
        App.vent.trigger('update:torrents', this.audio_selected);
      }
    },

    downloadTorrent: function() {
      this.startStreaming('downloadOnly');
      if (Settings.showSeedboxOnDlInit) {
        App.previousview = App.currentview;
        App.currentview = 'Seedbox';
        App.vent.trigger('seedbox:show');
        $('.filter-bar').find('.active').removeClass('active');
        $('#filterbar-seedbox').addClass('active');
        $('#nav-filters, .right .search').hide();
      } else {
        $('.notification_alert').stop().text(i18n.__('Download added')).fadeIn('fast').delay(1500).fadeOut('fast');
      }
    },

    startStreaming: function(state) {
      var providers = this.model.get('providers');
      var quality = this.model.get('quality');
      var defaultTorrent = this.model.get('torrents')[quality];

      var filters = {
        quality: quality,
        lang: this.audio_selected
      };

      var torrent = providers.torrent.resolveStream
        ? providers.torrent.resolveStream(
            defaultTorrent,
            filters,
            this.model.attributes
          )
        : defaultTorrent;

      var torrentStart = new Backbone.Model({
        imdb_id: this.model.get('imdb_id'),
        torrent: torrent,
        backdrop: this.model.get('backdrop'),
        subtitle: this.model.get('subtitle'),
        defaultSubtitle: this.subtitle_selected,
        title: this.model.get('title'),
        quality: quality,
        lang: this.audio_selected,
        type: 'movie',
        device: App.Device.Collection.selected,
        cover: this.model.get('cover')
      });

      App.vent.trigger('stream:start', torrentStart, state);
    },

    playTrailer: function() {
      var trailer = new Backbone.Model({
        src: this.model.get('trailer'),
        type: 'video/youtube',
        subtitle: null,
        quality: false,
        title: this.model.get('title')
      });
      var tmpPlayer = App.Device.Collection.selected.attributes.id;
      App.Device.Collection.setDevice('local');
      App.vent.trigger('stream:ready', trailer);
      App.Device.Collection.setDevice(tmpPlayer);
    },

    toggleFavourite: function(e) {
      $(
        'li[data-imdb-id="' +
          this.model.get('imdb_id') +
          '"] .actions-favorites'
      ).click();
      this.ui.bookmarkIcon.toggleClass('selected');
      this.model.set('bookmarked', !this.model.get('bookmarked'));
      this.setTooltips();
    },

    toggleWatched: function(e) {
      $(
        'li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-watched'
      ).click();
      this.ui.watchedIcon.toggleClass('selected');
      this.model.set('watched', !this.model.get('watched'));
      this.setTooltips();
    },

    toggleQuality: function() {
      _this.getRegion('qualitySelector').currentView.selectNext();
    },

    selectPlayer: function(e) {
      var player = $(e.currentTarget)
        .parent('li')
        .attr('id')
        .replace('player-', '');
      this.model.set('device', player);
      if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/gi)) {
        AdvSettings.set('chosenPlayer', player);
      }
    },

    showPlayerList: function(e) {
      App.vent.trigger('notification:show', new App.Model.Notification({
        title: '',
        body: i18n.__('Popcorn Time currently supports') + '<div class="splayerlist">' + extPlayerlst + '.</div><br>' + i18n.__('There is also support for Chromecast, AirPlay & DLNA devices.'),
        type: 'success'
      }));
    },

    refreshPlayerList: function (e) {
      e.stopPropagation();
      $('.play-control .playerchoicerefresh').addClass('fa-spin fa-spinner spin').tooltip('hide');
      Promise.all(App.Device.loadDeviceSupport()).then(function(data) {
        App.Device.rescan();
      }).then(function() {
        setTimeout(() => {
          App.Device.ChooserView('#player-chooser').render();
          $('.playerchoicerefresh, .playerchoicehelp').tooltip({html: true, delay: {'show': 800,'hide': 100}});
          $('.play-control .playerchoice').click();
        }, 3000);
      });
    },

    showAllTorrents: function() {
      const show = !this.model.get('showTorrents');
      this.model.set('showTorrents', show);
      if (show) {
        this.ui.showTorrents.addClass('active fas fa-spinner fa-spin').html('');
      } else {
        this.ui.showTorrents.removeClass('active fas fa-spinner fa-spin').html(i18n.__('more...'));
      }
      App.vent.trigger('update:torrents', show ? this.audio_selected : null);
    },

    onBeforeDestroy: function() {
      App.vent.off('sub:lang');
      App.vent.off('audio:lang');
      App.vent.off('update:subtitles');
      this.model.off('change:quality');
      Object.values(this.views).forEach(v => v.destroy());
    }
  });
})(window.App);
