(function(App) {
  'use strict';
  var healthButton, curSynopsis;

  var _this;
  App.View.MovieDetail = Marionette.View.extend({
    template: '#movie-detail-tpl',
    className: 'movie-detail',

    ui: {
      selected_lang: '.selected-lang',
      bookmarkIcon: '.favourites-toggle',
      watchedIcon: '.watched-toggle',
      backdrop: '.backdrop',
      poster: '.mcover-image',
    },

    events: {
      'click .close-icon': 'closeDetails',
      'mousedown .year': 'openRelInfo',
      'mousedown .certification': 'openCert',
      'mousedown .movie-imdb-link': 'openIMDb',
      'mousedown .magnet-link': 'openMagnet',
      'mousedown .source-link': 'openSource',
      'mousedown .tmdb-link': 'openTmdb',
      'click .rating-container': 'switchRating',
      'mousedown .show-cast': 'showCast',
      'click .showall-cast': 'showallCast',
      'click .health-icon': 'resetTorrentHealth',
      'mousedown .mcover-image': 'clickPoster',
      'mousedown .title': 'copytoclip'
    },

    regions: {
      PlayControl: '#play-control',
      TorrentList: '#torrent-list',
    },

    initialize: function() {
      _this = this;
      this.views = {};

      healthButton = new Common.HealthButton('.health-icon', this.retrieveTorrentHealth.bind(this));

      curSynopsis = {old: '', crew: '', cast: '', allcast: '', vstatus: null};

      //Check for missing metadata or if Translate Synopsis is enabled and the language set to something other than English and if one, or multiple are true run the corresponding function to try and fetch them
      if (((!this.model.get('synopsis') || !this.model.get('rating') || this.model.get('rating') === '0' || this.model.get('rating') === '0.0' || !this.model.get('runtime') || this.model.get('runtime') === '0' || !this.model.get('trailer') || !this.model.get('poster') || this.model.get('poster') === 'images/posterholder.png' || !this.model.get('backdrop') || this.model.get('backdrop') === 'images/posterholder.png') && !this.model.get('getmetarunned')) || (Settings.translateSynopsis && Settings.language !== 'en')) {
        this.getMetaData();
      }
      this.icons = App.Providers.get('Icons');

      //Handle keyboard shortcuts when other views are appended or removed

      //If a child was removed from above this view
      App.vent.on('viewstack:pop', function() {
        if (_.last(App.ViewStack) === _this.className) {
          _this.initKeyboardShortcuts();
        }
      });

      //If a child was added above this view
      App.vent.on('viewstack:push', function() {
        if (_.last(App.ViewStack) !== _this.className && _.last(App.ViewStack) !== 'notificationWrapper') {
          _this.unbindKeyboardShortcuts();
        }
      });

      App.vent.on('shortcuts:movies', _this.initKeyboardShortcuts);

      App.vent.on('update:torrents', _this.onUpdateTorrentsList.bind(_this));
      App.vent.on('change:quality', _this.onChangeQuality.bind(_this));
      // init fields in model
      this.model.set('displayTitle', '');
      this.model.set('displaySynopsis', '');
      this.localizeTexts();
    },

    onUpdateTorrentsList: function(lang) {
      this.getRegion('TorrentList').empty();
      if (!lang) {
        return;
      }
      const provider = App.Config.getProviderForType('movie')[0];
      const altShowAll = provider.config.noShowAll ? _.shuffle((Settings.dhtInfo.server ? Settings.dhtInfo.server.split(',') : Settings.customServers.movie).filter(a => !a.includes(provider.apiURL))) : null;
      const torrentList = new App.View.TorrentList({
        model: new Backbone.Model({
          provider,
          promise: provider.torrents(this.model.get('imdb_id'), lang, altShowAll),
        }),
      });
      this.getRegion('TorrentList').show(torrentList);
    },

    onChangeQuality: function (quality) {
      this.model.set('quality', quality);
      this.toggleSourceLink(quality);
      healthButton.render();
    },

    toggleSourceLink: function(quality) {
      const torrent = this.model.get('torrents')[quality];
      if (torrent.source) {
        const provider = App.Config.getProviderForType('movie')[0];
        this.icons.getLink(provider, torrent.provider)
            .then((icon) => torrent.icon = icon || '/src/app/images/icons/' + torrent.provider + '.png')
            .catch((error) => { !torrent.icon ? torrent.icon = '/src/app/images/icons/' + torrent.provider + '.png' : null; })
            .then(() => $('.source-link').html(`<img src="${torrent.icon}" onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.top='0'; this.parentElement.classList.add('fas', 'fa-link')" onload="this.onerror=null; this.onload=null;">`));
        $('.source-link').show().attr('data-original-title', torrent.source.split('//').pop().split('/')[0]);
      } else {
        $('.source-link').html('');
        $('.source-link').hide();
      }
    },

    onAttach: function() {
      win.info('Show movie details (' + this.model.get('imdb_id') + ')');

      App.MovieDetailView = this;

      this.localizeTexts();
      this.hideUnused();
      this.loadImages();
      this.loadComponents();
      this.initKeyboardShortcuts();
      healthButton.render();

      if (curSynopsis.vstatus !== null && curSynopsis.cast === '') {
        this.showCast();
      }

      $('[data-toggle="tooltip"]').tooltip({
        html: true
      });
    },

    localizeTexts: function() {
        const locale = this.model.get('locale');
        let title = this.model.get('title');
        if (Settings.translateTitle === 'translated-origin' || Settings.translateTitle === 'translated') {
            if (locale && locale.title) {
                title = locale.title;
            }
        }
        let synopsis = this.model.get('synopsis');
        if (Settings.translateSynopsis) {
            if (locale && locale.synopsis) {
                synopsis = locale.synopsis;
            }
        }
        this.model.set('displayTitle', title);
        this.model.set('displaySynopsis', synopsis);
    },

    loadComponents: function() {
      // play control
      var playctrl = this.getRegion('PlayControl');
      this.views.play = new App.View.PlayControl({
        model: this.model
      });
      playctrl.show(this.views.play);
    },

    loadImages: function() {
      var noimg = 'images/posterholder.png';
      var nobg = 'images/bg-header.jpg';

      var images = this.model.get('images');
      var p =
        this.model.get('image') ||
        (images ? images.poster : null) ||
        this.model.get('poster') ||
        noimg;
      var b =
        (images ? images.fanart : null) ||
        this.model.get('backdrop') ||
        this.model.get('poster') ||
        nobg;

      if (Settings.translatePosters) {
        var locale = this.model.get('locale');
        if (locale) {
          p = locale.poster ? locale.poster : p;
          b = locale.backdrop ? locale.backdrop : b;
        }
      }

      Common.loadImage(p).then((img) => {
        this.ui.poster.attr('src', img || noimg).addClass('fadein');
      });
      Common.loadImage(b).then((img) => {
        this.ui.backdrop
            .css('background-image', 'url(' + (img || nobg) + ')')
            .addClass('fadein');
      });
    },

    hideUnused: function() {
      var id = this.model.get('imdb_id');

      if (!this.model.get('torrents')) {
        // no torrents
        $('.magnet-link, .health-icon, .source-link').hide();
      }

      if (!this.model.get('rating')) {
        // no ratings
        $('.rating-container').hide();
      }

      if (!id) {
        // no id
        $('.movie-imdb-link').hide();
      }
    },

    getMetaData: function () {
      curSynopsis.vstatus = false;
      var imdb = this.model.get('imdb_id'),
      api_key = Settings.tmdb.api_key,
      lang = Settings.language,
      movie = (function () {
        var tmp = null;
        $.ajax({
          url: 'http://api.themoviedb.org/3/movie/' + imdb + '?api_key=' + api_key + '&language=' + lang + '&append_to_response=videos,credits',
          type: 'get',
          dataType: 'json',
          timeout: 5000,
          async: false,
          global: false,
          success: function (data) {
            tmp = data;
          }
        });
        return tmp;
      }());
      (!this.model.get('synopsis') || (Settings.translateSynopsis && Settings.language !== 'en')) && movie && movie.overview ? this.model.set('synopsis', movie.overview) : null;
      (!this.model.get('rating') || this.model.get('rating') === '0' || this.model.get('rating') === '0.0') && movie && movie.vote_average ? this.model.set('rating', movie.vote_average) : null;
      (!this.model.get('runtime') || this.model.get('runtime') === '0') && movie && movie.runtime ? this.model.set('runtime', movie.runtime) : null;
      !this.model.get('trailer') && movie && movie.videos && movie.videos.results && movie.videos.results[0] ? this.model.set('trailer', 'http://www.youtube.com/watch?v=' + movie.videos.results[0].key) : null;
      (!this.model.get('poster') || this.model.get('poster') === 'images/posterholder.png') && movie && movie.poster_path ? this.model.set('poster', 'http://image.tmdb.org/t/p/w500' + movie.poster_path) : null;
      (!this.model.get('backdrop') || this.model.get('backdrop') === 'images/posterholder.png') && movie && movie.backdrop_path ? this.model.set('backdrop', 'http://image.tmdb.org/t/p/w500' + movie.backdrop_path) : ((!this.model.get('backdrop') || this.model.get('backdrop') === 'images/posterholder.png') && movie && movie.poster_path ? this.model.set('backdrop', 'http://image.tmdb.org/t/p/w500' + movie.poster_path) : null);
      !this.model.get('tmdb_id') && movie && movie.id ? this.model.set('tmdb_id', movie.id) : null;
      if (movie && movie.credits && movie.credits.cast && movie.credits.crew && (movie.credits.cast[0] || movie.credits.crew[0])) {
        curSynopsis.old = this.model.get('synopsis');
        curSynopsis.crew = movie.credits.crew.filter(function (el) {return el.job === 'Director';}).map(function (el) {return '<span>' + el.job + '&nbsp;-&nbsp;</span><span' + (el.profile_path ? ` data-toggle="tooltip" title="<img src='https://image.tmdb.org/t/p/w154${el.profile_path}' class='toolcimg'/>" ` : ' ') + `class="cname" onclick="nw.Shell.openExternal('https://www.imdb.com/find?s=nm&q=${el.name.replace(/\'/g, ' ').replace(/\ /g, '+')}')" oncontextmenu="nw.Shell.openExternal('https://yts.mx/browse-movies/${el.name.replace(/\'/g, ' ').replace(/\ /g, '+')}')">${el.name.replace(/\ /g, '&nbsp;')}</span>`;}).join('&nbsp;&nbsp; ') + '<p class="sline">&nbsp;</p>';
        curSynopsis.allcast = movie.credits.cast.map(function (el) {return '<span' + (el.profile_path ? ` data-toggle="tooltip" title="<img src='https://image.tmdb.org/t/p/w154${el.profile_path}' class='toolcimg'/>" ` : ' ') + `class="cname" onclick="nw.Shell.openExternal('https://www.imdb.com/find?s=nm&q=${el.name.replace(/\'/g, ' ').replace(/\ /g, '+')}')" oncontextmenu="nw.Shell.openExternal('https://yts.mx/browse-movies/${el.name.replace(/\'/g, ' ').replace(/\ /g, '+')}')">${el.name.replace(/\ /g, '&nbsp;')}</span><span>&nbsp;-&nbsp;${el.character.replace(/\ /g, '&nbsp;')}</span>`;}).join('&nbsp;&nbsp; ') + '<p>&nbsp;</p>';
        curSynopsis.cast = movie.credits.cast.slice(0,10).map(function (el) {return '<span' + (el.profile_path ? ` data-toggle="tooltip" title="<img src='https://image.tmdb.org/t/p/w154${el.profile_path}' class='toolcimg'/>" ` : ' ') + `class="cname" onclick="nw.Shell.openExternal('https://www.imdb.com/find?s=nm&q=${el.name.replace(/\'/g, ' ').replace(/\ /g, '+')}')" oncontextmenu="nw.Shell.openExternal('https://yts.mx/browse-movies/${el.name.replace(/\'/g, ' ').replace(/\ /g, '+')}')">${el.name.replace(/\ /g, '&nbsp;')}</span><span>&nbsp;-&nbsp;${el.character.replace(/\ /g, '&nbsp;')}</span>`;}).join('&nbsp;&nbsp; ') + (movie.credits.cast.length > 10 ? '&nbsp;&nbsp;&nbsp;<span class="showall-cast">more...</span>' : '') + '<p>&nbsp;</p>';
      }
      // Fallback to english when source and TMDb call in default language that is other than english fail to fetch synopsis
      if (!this.model.get('synopsis') && Settings.language !== 'en') {
        movie = (function () {
          var tmp = null;
          $.ajax({
            url: 'http://api.themoviedb.org/3/movie/' + imdb + '?api_key=' + api_key,
            type: 'get',
            dataType: 'json',
            timeout: 5000,
            async: false,
            global: false,
            success: function (data) {
              tmp = data;
            }
          });
          return tmp;
        }());
        movie && movie.overview ? this.model.set('synopsis', movie.overview) : null;
      }
    },

    showCast: function (e) {
      if (e && e.button === 2) {
        Common.openOrClipboardLink(e, 'https://www.imdb.com/title/' + this.model.get('imdb_id') + '/fullcredits', i18n.__('full cast & crew link'));
      } else {
        if (curSynopsis.vstatus == null) {
          this.getMetaData();
        }
        if (curSynopsis.vstatus === false) {
          if (curSynopsis.cast !== '') {
            $('.overview').html(curSynopsis.crew + curSynopsis.cast + curSynopsis.old);
            $('.show-cast').attr('title', i18n.__('Hide cast')).tooltip('hide').tooltip('fixTitle');
            $('.overview *').tooltip({html: true, sanitize: false, container: 'body', placement: 'bottom', delay: {show: 200, hide: 0}, template: '<div class="tooltip" style="opacity:1"><div class="tooltip-inner" style="background-color:rgba(0,0,0,0);width:118px"></div></div>'});
            curSynopsis.vstatus = true;
          } else {
            $('.show-cast').css({cursor: 'default', opacity: 0.4}).attr('title', i18n.__('Cast not available')).tooltip('hide').tooltip('fixTitle');
            curSynopsis.vstatus = 'not available';
          }
        } else if (curSynopsis.vstatus === true) {
          $('.overview').html(curSynopsis.old);
          $('.show-cast').attr('title', i18n.__('Show cast')).tooltip('hide').tooltip('fixTitle');
          curSynopsis.vstatus = false;
        }
      }
    },

    showallCast: function () {
      $('.overview').html(curSynopsis.crew + curSynopsis.allcast + curSynopsis.old);
      $('.overview *').tooltip({html: true, sanitize: false, container: 'body', placement: 'bottom', delay: {show: 200, hide: 0}, template: '<div class="tooltip" style="opacity:1"><div class="tooltip-inner" style="background-color:rgba(0,0,0,0);width:118px"></div></div>'});
    },

    clickPoster: (e) => Common.openOrClipboardLink(e, $('.mcover-image')[0].src, i18n.__('image url'), true),

    copytoclip: (e) => Common.openOrClipboardLink(e, $(e.target)[0].textContent, i18n.__($(e.target)[0].className), true),

    onBeforeDestroy: function() {
      $('[data-toggle="tooltip"]').tooltip('hide');
      App.vent.off('update:torrents');
      App.vent.off('change:quality');
      this.unbindKeyboardShortcuts();
      Object.values(this.views).forEach(v => v.destroy());
    },

    toggleQuality: function () {
      _this.getRegion('PlayControl').currentView.toggleQuality();
    },

    initKeyboardShortcuts: function() {
      Mousetrap.bind(['esc', 'backspace'], this.closeDetails);
      Mousetrap.bind(['enter', 'space'], function(e) {
        $('#watch-now').click();
      });
      Mousetrap.bind('q', this.toggleQuality, 'keydown');
      Mousetrap.bind(
        'f',
        function() {
          $('.favourites-toggle').click();
        },
        'keydown'
      );
    },

    unbindKeyboardShortcuts: function() {
      // There should be a better way to do this
      Mousetrap.unbind(['esc', 'backspace']);
      Mousetrap.unbind(['enter', 'space']);
      Mousetrap.unbind('q');
      Mousetrap.unbind('f');
    },

    switchRating: function() {
      var numberContainer = $('.number-container');
      numberContainer.toggleClass('hidden');
      $('.star-container').toggleClass('hidden');
      AdvSettings.set('ratingStars', numberContainer.hasClass('hidden'));
    },

    closeDetails: function() {
      App.vent.trigger('movie:closeDetail');
    },

    retrieveTorrentHealth: function(cb) {
      const torrent = this.model.get('torrents')[this.model.get('quality')];
      Common.retrieveTorrentHealth(torrent, cb);
    },

    resetTorrentHealth: function () {
      healthButton.reset();
      healthButton.render();
    },

    openRelInfo: function (e) {
      Common.openOrClipboardLink(e, 'https://www.imdb.com/title/' + this.model.get('imdb_id') + '/releaseinfo', i18n.__('release info link'));
    },

    openCert: function (e) {
      Common.openOrClipboardLink(e, 'https://www.imdb.com/title/' + this.model.get('imdb_id') + '/parentalguide', i18n.__('parental guide link'));
    },

    openIMDb: function (e) {
      Common.openOrClipboardLink(e, 'https://www.imdb.com/title/' + this.model.get('imdb_id'), i18n.__('IMDb page link'));
    },

    openMagnet: function(e) {
      var torrent = this.model.get('torrents')[this.model.get('quality')],
        magnetLink;

      if (torrent.magnet) {
        // Movies
        magnetLink = torrent.magnet.replace(/\&amp;/g, '&');
      } else {
        // Anime
        magnetLink = torrent.url.replace(/\&amp;/g, '&');
      }
      magnetLink = magnetLink.split('&tr=')[0] + _.union(decodeURIComponent(magnetLink).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
      Common.openOrClipboardLink(e, magnetLink, i18n.__('magnet link'));
    },

    openSource: function(e) {
      var torrent = this.model.get('torrents')[this.model.get('quality')],
          sourceLink;

      if (torrent.source) {
        // Movies
        sourceLink = torrent.source.replace(/\&amp;/g, '&');
      } else {
        return;
      }
      if (sourceLink) {
        Common.openOrClipboardLink(e, sourceLink, i18n.__('source link'));
      }
    },

    openTmdb: function(e) {
      let imdb = this.model.get('imdb_id'),
      tmdb = this.model.get('tmdb_id'),
      api_key = Settings.tmdb.api_key;

      if (!tmdb && !this.model.get('getmetarunned')) {
        let movie = (function () {
          let tmp = null;
          $.ajax({
            url: 'http://api.themoviedb.org/3/find/' + imdb + '?api_key=' + api_key + '&external_source=imdb_id',
            type: 'get',
            dataType: 'json',
            timeout: 5000,
            async: false,
            global: false,
            success: function (data) {
              tmp = data;
            }
          });
          return tmp;
        }());
        movie && movie.movie_results && movie.movie_results[0] && movie.movie_results[0].id ? this.model.set('tmdb_id', movie.movie_results[0].id) : null;
        tmdb = this.model.get('tmdb_id');
      }

      if (tmdb) {
        let tmdbLink = 'https://www.themoviedb.org/movie/' + tmdb + '/edit?language=' + Settings.language;
        Common.openOrClipboardLink(e, tmdbLink, i18n.__('submit metadata & translations link'));
      } else {
        $('.tmdb-link').addClass('disabled').prop('disabled', true).attr('title', i18n.__('Not available')).tooltip('hide').tooltip('fixTitle');
      }
    }

  });
})(window.App);
