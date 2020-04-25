(function(App) {
  'use strict';
  // Torrent Health
  var torrentHealth = require('webtorrent-health'),
    cancelTorrentHealth = function() {},
    torrentHealthRestarted = null;

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
      //Handle keyboard shortcuts when other views are appended or removed

      //If a child was removed from above this view
      App.vent.on('viewstack:pop', function() {
        if (_.last(App.ViewStack) === _this.className) {
          _this.initKeyboardShortcuts();
        }
      });

      //If a child was added above this view
      App.vent.on('viewstack:push', function() {
        if (_.last(App.ViewStack) !== _this.className) {
          _this.unbindKeyboardShortcuts();
        }
      });

      App.vent.on('shortcuts:movies', _this.initKeyboardShortcuts);

      App.vent.on('change:quality', this.renderHealth, this);
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

      this.renderHealth();
    },

    onAttach: function() {
      win.info('Show movie detail (' + this.model.get('imdb_id') + ')');

      App.MovieDetailView = this;

      this.hideUnused();
      this.loadImages();
      this.loadComponents();
      this.renderHealth();
      this.initKeyboardShortcuts();

      this.refreshUiQuality();
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

    onBeforeDestroy: function() {
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

    renderHealth: function(e) {
      var torrent = this.model.get('torrents')[this.model.get('quality')];

      cancelTorrentHealth();

      // Use fancy coding to cancel
      // pending webtorrent-health's
      var cancelled = false;
      cancelTorrentHealth = function() {
        cancelled = true;
      };

      if (torrent.url.substring(0, 8) === 'magnet:?') {
        // if 'magnet:?' is because api sometimes sends back links, not magnets
        torrentHealth(
          torrent.url,
          {
            timeout: 1000,
            trackers: Settings.trackers.forced
          },
          function(err, res) {
            if (cancelled || err) {
              return;
            }
            if (res.seeds === 0 && torrentHealthRestarted < 5) {
              torrentHealthRestarted++;
              $('.health-icon').click();
            } else {
              torrentHealthRestarted = 0;
              var h = Common.calcHealth({
                seed: res.seeds,
                peer: res.peers
              });
              var health = Common.healthMap[h].capitalize();
              var ratio = res.peers > 0 ? res.seeds / res.peers : +res.seeds;

              $('.health-icon')
                .tooltip({
                  html: true
                })
                .removeClass('Bad Medium Good Excellent')
                .addClass(health)
                .attr(
                  'data-original-title',
                  i18n.__('Health ' + health) +
                    ' - ' +
                    i18n.__('Ratio:') +
                    ' ' +
                    ratio.toFixed(2) +
                    ' <br> ' +
                    i18n.__('Seeds:') +
                    ' ' +
                    res.seeds +
                    ' - ' +
                    i18n.__('Peers:') +
                    ' ' +
                    res.peers
                )
                .tooltip('fixTitle');
            }
          }
        );
      }
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
        magnetLink = torrent.magnet;
      } else {
        // Anime
        magnetLink = torrent.url;
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
