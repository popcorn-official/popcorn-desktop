(function(App) {
  'use strict';
  // Torrent Health
  var torrentHealth = require('webtorrent-health'),
    healthButton,
    curSynopsis;

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
      q2160p: '.q2160',
      q1080p: '.q1080',
      q720p: '.q720'
    },

    events: {
      'click .close-icon': 'closeDetails',
      'click .movie-imdb-link': 'openIMDb',
      'mousedown .magnet-link': 'openMagnet',
      'click .rating-container': 'switchRating',
      'click .show-cast': 'showCast',
      'click .showall-cast': 'showallCast',
      'click .q2160': 'toggleShowQuality',
      'click .q1080': 'toggleShowQuality',
      'click .q720': 'toggleShowQuality'
    },

    regions: {
      PlayControl: '#play-control'
    },

    initialize: function() {
      _this = this;
      this.views = {};

      healthButton = new Common.HealthButton('.health-icon', this.retrieveTorrentHealth.bind(this));

      curSynopsis = {old: '', crew: '', cast: '', allcast: '', vstatus: null};

      //Check for missing metadata or if Translate Synopsis is enabled and the language set to something other than English and if one, or multiple are true run the corresponding function to try and fetch them
      if (!this.model.get('synopsis') || !this.model.get('rating') || this.model.get('rating') == '0' || this.model.get('rating') == '0.0' || !this.model.get('runtime') || this.model.get('runtime') == '0' || !this.model.get('trailer') || !this.model.get('poster') || this.model.get('poster') == 'images/posterholder.png' || !this.model.get('backdrop') || this.model.get('backdrop') == 'images/posterholder.png' || (Settings.translateSynopsis && Settings.language != 'en')) {
        this.getMetaData();
      }
      
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

      App.vent.on('change:quality', healthButton.render, this);
    },

    toggleShowQuality: function(e) {
      if ($(e.currentTarget).hasClass('disabled')) {
        return;
      }
      var quality = $(e.currentTarget);
      var currentQuality = quality.text();
      if (currentQuality === '4K') {
        currentQuality = '2160p';
      }
      this.updateQuality(currentQuality);
    },

    updateQuality: function(quality) {
      this.model.set('quality', quality);
      this.refreshUiQuality();
    },

    refreshUiQuality: function() {
      win.debug('quality changed');
      const quality = this.model.get('quality');
      const torrents = this.model.get('torrents');

      if (torrents['2160p'] === undefined) {
        $('.q2160').addClass('disabled');
      }

      if (torrents['1080p'] === undefined) {
        $('.q1080').addClass('disabled');
      }

      if (torrents['720p'] === undefined) {
        $('.q720').addClass('disabled');
      }

      if (quality === '2160p') {
        $('.q2160').addClass('active');

        $('.q1080').removeClass('active');
        $('.q720').removeClass('active');
      } else if (quality === '1080p') {
        $('.q1080').addClass('active');

        $('.q2160').removeClass('active');
        $('.q720').removeClass('active');
      } else {
        $('.q720').addClass('active');

        $('.q2160').removeClass('active');
        $('.q1080').removeClass('active');
      }

      win.debug('about to render health button');
      healthButton.render();
    },

    onAttach: function() {
      win.info('Show movie detail (' + this.model.get('imdb_id') + ')');

      App.MovieDetailView = this;

      this.hideUnused();
      this.loadImages();
      this.loadComponents();
      this.initKeyboardShortcuts();
      healthButton.render();

      this.refreshUiQuality();

      if (curSynopsis.vstatus !== null && curSynopsis.cast == '') {
        this.showCast();
      }
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

      var setImage = {
        poster: function(img) {
          this.ui.poster.attr('src', img || noimg).addClass('fadein');
        }.bind(this),
        backdrop: function(img) {
          this.ui.backdrop
            .css('background-image', 'url(' + (img || nobg) + ')')
            .addClass('fadein');
        }.bind(this)
      };

      var loadImage = function(img, type) {
        var cache = new Image();
        cache.src = img;

        cache.onload = function() {
          if (img.indexOf('.gif') !== -1) {
            // freeze gifs
            var c = document.createElement('canvas');
            var w = (c.width = img.width);
            var h = (c.height = img.height);

            c.getContext('2d').drawImage(cache, 0, 0, w, h);
            img = c.toDataURL();
          }
          setImage[type](img);
        };

        cache.onerror = function(e) {
          setImage[type](null);
        };
      };
      var images = this.model.get('images');
      var p =
        this.model.get('image') ||
        images.poster ||
        this.model.get('poster') ||
        noimg;
      var b =
        images.fanart ||
        this.model.get('backdrop') ||
        this.model.get('poster') ||
        nobg;
      loadImage(p, 'poster');
      loadImage(b, 'backdrop');
    },

    hideUnused: function() {
      var id = this.model.get('imdb_id');
      win.info('hideunused (' + this.model.get('imdb_id') + ')');

      if (!this.model.get('torrents')) {
        // no torrents
        $('.magnet-link, .health-icon').hide();
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

    handleAnime: function() {
      var id = this.model.get('imdb_id');
      if (id && id.indexOf('mal') === -1) {
        return;
      }

      $(
        '.movie-imdb-link, .rating-container, .magnet-link, .health-icon'
      ).hide();
      $('.dot').css('opacity', 0);
    },

    getMetaData: function () {
      curSynopsis.vstatus = false;
      var imdb = this.model.get('imdb_id'),
      api_key = Settings.tmdb.api_key,
      lang = Settings.language,
      movie = function () {
        var tmp = null;
        $.ajax({
          url: 'http://api.themoviedb.org/3/movie/' + imdb + '?api_key=' + api_key + '&language=' + lang + '&append_to_response=videos,credits',
          type: 'get',
          dataType: 'json',
          async: false,
          global: false,
          success: function (data) {
            tmp = data;
          }
        });
        return tmp;
      }();
      (!this.model.get('synopsis') || (Settings.translateSynopsis && Settings.language != 'en')) && movie && movie.overview ? this.model.set('synopsis', movie.overview) : null;
      (!this.model.get('rating') || this.model.get('rating') == '0' || this.model.get('rating') == '0.0') && movie && movie.vote_average ? this.model.set('rating', movie.vote_average) : null;
      (!this.model.get('runtime') || this.model.get('runtime') == '0') && movie && movie.runtime ? this.model.set('runtime', movie.runtime) : null;
      !this.model.get('trailer') && movie && movie.videos && movie.videos.results && movie.videos.results[0] ? this.model.set('trailer', 'http://www.youtube.com/watch?v=' + movie.videos.results[0].key) : null;
      (!this.model.get('poster') || this.model.get('poster') == 'images/posterholder.png') && movie && movie.poster_path ? this.model.set('poster', 'http://image.tmdb.org/t/p/w500' + movie.poster_path) : null;
      (!this.model.get('backdrop') || this.model.get('backdrop') == 'images/posterholder.png') && movie && movie.backdrop_path ? this.model.set('backdrop', 'http://image.tmdb.org/t/p/w500' + movie.backdrop_path) : ((!this.model.get('backdrop') || this.model.get('backdrop') == 'images/posterholder.png') && movie && movie.poster_path ? this.model.set('backdrop', 'http://image.tmdb.org/t/p/w500' + movie.poster_path) : null);
      if (movie && movie.credits && movie.credits.cast && movie.credits.crew && (movie.credits.cast[0] || movie.credits.crew[0])) {
        curSynopsis.old = this.model.get('synopsis');
        curSynopsis.crew = movie.credits.crew.filter(function (el) {return el.job == 'Director'}).map(function (el) {return '<span>' + el.job + '&nbsp;-&nbsp;</span><span' + (el.profile_path ? ' data-toggle="tooltip" title="<img src=' + "'https://image.tmdb.org/t/p/w154" + el.profile_path + "'" + ' class=' + "'toolcimg'" + '/>" ' : ' ') + 'class="cname" onclick="nw.Shell.openExternal(' + "'https://yts.mx/browse-movies/" + el.name.replace(/\'/g, ' ').replace(/\ /g, '+') + "'" + ')" oncontextmenu="nw.Shell.openExternal(' + "'https://www.imdb.com/find?s=nm&q=" + el.name.replace(/\'/g, ' ').replace(/\ /g, '+') + "'" + ')">' + el.name.replace(/\ /g, '&nbsp;') + '</span>'}).join('&nbsp;&nbsp; ') + '<p class="sline">&nbsp;</p>';
        curSynopsis.allcast = movie.credits.cast.map(function (el) {return '<span' + (el.profile_path ? ' data-toggle="tooltip" title="<img src=' + "'https://image.tmdb.org/t/p/w154" + el.profile_path + "'" + ' class=' + "'toolcimg'" + '/>" ' : ' ') + 'class="cname" onclick="nw.Shell.openExternal(' + "'https://yts.mx/browse-movies/" + el.name.replace(/\'/g, ' ').replace(/\ /g, '+') + "'" + ')" oncontextmenu="nw.Shell.openExternal(' + "'https://www.imdb.com/find?s=nm&q=" + el.name.replace(/\'/g, ' ').replace(/\ /g, '+') + "'" + ')">' + el.name.replace(/\ /g, '&nbsp;') + '</span><span>&nbsp;-&nbsp;' + el.character.replace(/\ /g, '&nbsp;') + '</span>'}).join('&nbsp;&nbsp; ') + '<p>&nbsp;</p>';
        curSynopsis.cast = movie.credits.cast.slice(0,10).map(function (el) {return '<span' + (el.profile_path ? ' data-toggle="tooltip" title="<img src=' + "'https://image.tmdb.org/t/p/w154" + el.profile_path + "'" + ' class=' + "'toolcimg'" + '/>" ' : ' ') + 'class="cname" onclick="nw.Shell.openExternal(' + "'https://yts.mx/browse-movies/" + el.name.replace(/\'/g, ' ').replace(/\ /g, '+') + "'" + ')" oncontextmenu="nw.Shell.openExternal(' + "'https://www.imdb.com/find?s=nm&q=" + el.name.replace(/\'/g, ' ').replace(/\ /g, '+') + "'" + ')">' + el.name.replace(/\ /g, '&nbsp;') + '</span><span>&nbsp;-&nbsp;' + el.character.replace(/\ /g, '&nbsp;') + '</span>'}).join('&nbsp;&nbsp; ') + (movie.credits.cast.length > 10 ? '&nbsp;&nbsp;&nbsp;<span class="showall-cast">more...</span>' : '') + '<p>&nbsp;</p>';
      }
    },

    showCast: function () {
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
    },

    showallCast: function () {
      $('.overview').html(curSynopsis.crew + curSynopsis.allcast + curSynopsis.old);
      $('.overview *').tooltip({html: true, sanitize: false, container: 'body', placement: 'bottom', delay: {show: 200, hide: 0}, template: '<div class="tooltip" style="opacity:1"><div class="tooltip-inner" style="background-color:rgba(0,0,0,0);width:118px"></div></div>'});
    },

    onBeforeDestroy: function() {
      $('[data-toggle="tooltip"]').tooltip('hide');
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

    openIMDb: function() {
      nw.Shell.openExternal(
        'https://www.imdb.com/title/' + this.model.get('imdb_id')
      );
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
      if (e.button === 2) {
        //if right click on magnet link
        var clipboard = nw.Clipboard.get();
        clipboard.set(magnetLink, 'text'); //copy link to clipboard
        $('.notification_alert')
          .text(i18n.__('The magnet link was copied to the clipboard'))
          .fadeIn('fast')
          .delay(2500)
          .fadeOut('fast');
      } else {
        nw.Shell.openExternal(magnetLink);
      }
    }
  });
})(window.App);
