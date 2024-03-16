(function(App) {
  'use strict';

  App.View.FilterBar = Marionette.View.extend({
    template: '#filter-bar-tpl',
    className: 'filter-bar',
    ui: {
      searchForm: '.search form',
      searchInput: '.search input',
      search: '.search',
      searchClear: '.search .clear',
      sorterValue: '.sorters .value',
      typeValue: '.types .value',
      genreValue: '.genres .value',
      ratingValue: '.ratings .value'
    },
    events: {
      'hover  @ui.searchInput': 'focus',
      'submit @ui.searchForm': 'search',
      'contextmenu @ui.searchInput': 'rightclick_search',
      'click  @ui.searchClear': 'clearSearch',
      'click  @ui.search': 'focusSearch',
      'click .sorters .dropdown-menu a': 'sortBy',
      'click .genres .dropdown-menu a': 'changeGenre',
      'click .types .dropdown-menu a': 'changeType',
      'click .ratings .dropdown-menu a': 'changeRating',
      'click #filterbar-settings': 'settings',
      'click #filterbar-tempf': 'tempf',
      'click .movieTabShow': 'movieTabShow',
      'click .tvshowTabShow': 'tvshowTabShow',
      'click .animeTabShow': 'animeTabShow',
      'click #filterbar-favorites': 'showFavorites',
      'click #filterbar-watched': 'showWatched',
      'click #filterbar-watchlist': 'showWatchlist',
      'click #filterbar-torrent-collection': 'showTorrentCollection',
      'click .triggerUpdate': 'updateDB',
      'click #filterbar-seedbox': 'showSeedbox'
    },

    initialize: function(e) {
      App.vent.on('filter-bar:render', () => {
        this.render();
        this.setActive(App.currentview);
      });
    },

    focus: function(e) {
      e.focus();
    },
    setActive: function(set) {
      var rightSearch = $('.right .search');
      var navFilters = $('#nav-filters');
      var filterbarRandom = $('#filterbar-random');

      if (Settings.startScreen === 'Last Open') {
        AdvSettings.set('lastTab', set);
      }

      rightSearch.show();
      navFilters.show();
      filterbarRandom.hide();
      $('.filter-bar')
        .find('.active')
        .removeClass('active');
      switch (set) {
        case 'TV Series':
        case 'shows':
          $('.source.tvshowTabShow').addClass('active');
          break;
        case 'Movies':
        case 'movies':
          filterbarRandom.show();
          $('.source.movieTabShow').addClass('active');
          if ($('.types a')[0]) {
            var tempTypeTxt = $('.types a')['0'].firstChild.textContent.replace(i18n.__('Type'), i18n.__('Quality'));
            $('.types a')['0'].firstChild.textContent = tempTypeTxt;
          }
          break;
        case 'Anime':
        case 'anime':
          $('.source.animeTabShow').addClass('active');
          break;
        case 'Favorites':
        case 'favorites':
          $('#filterbar-favorites').addClass('active');
          break;
        case 'Watched':
        case 'watched':
          $('#filterbar-watched').addClass('active');
          break;
        case 'Watchlist':
        case 'watchlist':
          rightSearch.hide();
          $('#filterbar-watchlist').addClass('active');
          break;
        case 'Torrent-collection':
          rightSearch.hide();
          navFilters.hide();
          $('#filterbar-torrent-collection').addClass('active');
          break;
        case 'Seedbox':
          rightSearch.hide();
          navFilters.hide();
          $('#filterbar-seedbox').addClass('active');
          break;
      }

      $('#nav-filters .filter').each(function(i, item) {
        $(item).find('.active').removeClass('active');
        const value = $(item).find('.value');
        const li = $(item).find('li a[data-value="' + value.data('value') + '"]');
        li.addClass('active');
        value.text(li.text());
      });
    },
    rightclick_search: function(e) {
      e.preventDefault();
      var search_menu = new this.context_Menu(
        i18n.__('Cut'),
        i18n.__('Copy'),
        i18n.__('Paste')
      );
      search_menu.popup(e.originalEvent.x, e.originalEvent.y);
    },

    context_Menu: function(cutLabel, copyLabel, pasteLabel) {
      var menu = new nw.Menu(),
        cut = new nw.MenuItem({
          label: cutLabel || 'Cut',
          click: function() {
            document.execCommand('cut');
          }
        }),
        copy = new nw.MenuItem({
          label: copyLabel || 'Copy',
          click: function() {
            document.execCommand('copy');
          }
        }),
        paste = new nw.MenuItem({
          label: pasteLabel || 'Paste',
          click: function() {
            document.execCommand('paste');
          }
        });

      menu.append(cut);
      menu.append(copy);
      menu.append(paste);

      return menu;
    },
    onAttach: function() {
      var activetab;

      if (AdvSettings.get('startScreen') === 'Last Open') {
        activetab = AdvSettings.get('lastTab');
      } else {
        activetab = AdvSettings.get('startScreen');
      }

      if (typeof App.currentview === 'undefined') {
        switch (activetab) {
          case 'TV Series':
            App.currentview = 'shows';
            break;
          case 'Movies':
            App.currentview = 'movies';
            break;
          case 'Anime':
            App.currentview = 'anime';
            break;
          case 'Favorites':
            App.currentview = 'Favorites';
            App.previousview = 'movies';
            break;
          case 'Watched':
            App.currentview = 'Watched';
            App.previousview = 'movies';
            break;
          case 'Watchlist':
            App.currentview = 'Watchlist';
            App.previousview = 'movies';
            break;
          case 'Torrent-collection':
            App.currentview = 'Torrent-collection';
            App.previousview = 'movies';
            break;
          case 'Seedbox':
            App.currentview = 'Seedbox';
            App.previousview = 'movies';
            break;
          default:
            App.currentview = 'movies';
        }
        this.setActive(App.currentview);
      }

      this.$('.tooltipped').tooltip({
        delay: {
          show: 800,
          hide: 100
        }
      });

      $('.providerinfo').tooltip({
        delay: {
          'show': 2400,
          'hide': 100
        },
        html: true
      });

      if (!this.previousSort) {
        this.previousSort = $('.sorters .active').data('value') || $('.sorters .value').data('value');
      }
    },

    focusSearch: function() {
      this.$('.search input').focus();
    },
    search: function(e) {
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('movie:closeDetail');
      e.preventDefault();
      var searchvalue = this.ui.searchInput.val();
      this.model.set({
        keywords: this.ui.searchInput.val(),
        genre: ''
      });

      this.$('.genres .active').removeClass('active');

      $($('.genres li a')[0]).addClass('active');
      this.ui.genreValue.text(i18n.__('All'));

      this.ui.searchInput.blur();

      if (searchvalue === '') {
        this.ui.searchForm.removeClass('edited');
      } else {
        this.ui.searchForm.addClass('edited');
      }
    },

    clearSearch: function(e) {
      this.ui.searchInput.focus();

      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('movie:closeDetail');

      e.preventDefault();
      this.model.set({
        keywords: '',
        genre: ''
      });

      this.$('.genres .active').removeClass('active');
      $($('.genres li a')[0]).addClass('active');
      this.ui.genreValue.text(i18n.__('All'));

      this.ui.searchInput.val('');
      this.ui.searchForm.removeClass('edited');
    },

    sortBy: function(e) {
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      this.$('.sorters .active').removeClass('active');
      $(e.target).addClass('active');

      var sorter = $(e.target).attr('data-value');

      if (this.previousSort === sorter) {
        this.model.set({
          order: this.model.get('order') * -1,
          keyword: '',
          sorter: sorter
        });
      } else if (this.previousSort !== sorter && sorter === 'title') {
        this.model.set({
          order: 1,
          keyword: '',
          sorter: sorter
        });
      } else {
        this.model.set({
          order: -1,
          keyword: '',
          sorter: sorter
        });
      }

      this.ui.sorterValue.text($(e.target).text());
      this.previousSort = sorter;
    },

    changeType: function(e) {
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      this.$('.types .active').removeClass('active');
      $(e.target).addClass('active');

      var type = $(e.target).attr('data-value');
      this.ui.typeValue.text($(e.target).text());

      this.model.set({
        keyword: '',
        type: type
      });
    },

    changeGenre: function(e) {
      App.vent.trigger('about:close');
      this.$('.genres .active').removeClass('active');
      $(e.target).addClass('active');

      var genre = $(e.target).attr('data-value');

      this.ui.genreValue.text($(e.target).text());

      this.model.set({
        keyword: '',
        genre: genre
      });
    },

    changeRating: function(e) {
      App.vent.trigger('about:close');
      this.$('.ratings .active').removeClass('active');
      $(e.target).addClass('active');

      const rating = $(e.target).attr('data-value');
      this.ui.ratingValue.text($(e.target).text());

      this.model.set({
        keyword: '',
        rating: rating
      });
    },

    settings: function(e) {
      App.vent.trigger('about:close');
      App.vent.trigger('settings:show');
    },

    tempf: function (e) {
      App.settings.os === 'windows' ? nw.Shell.openExternal(Settings.tmpLocation) : nw.Shell.openItem(Settings.tmpLocation);
    },

    showTorrentCollection: function(e) {
      e.preventDefault();
      if (App.currentview !== 'Torrent-collection') {
        if (App.currentview !== 'Seedbox') {
          App.previousview = App.currentview;
        }
        App.currentview = 'Torrent-collection';
        App.vent.trigger('about:close');
        App.vent.trigger('seedbox:close');
        App.vent.trigger('torrentCollection:show');
        this.setActive('Torrent-collection');
      } else {
        if (!App.ViewStack.includes('seedbox') && !$('#filterbar-seedbox').hasClass('active')) {
          App.currentview = App.previousview;
          App.vent.trigger('torrentCollection:close');
        }
        App.vent.trigger('seedbox:close');
        this.setActive(App.currentview);
      }
    },

    showSeedbox: function(e) {
      e.preventDefault();
      if (App.currentview !== 'Seedbox' && !App.ViewStack.includes('seedbox')) {
        if (App.currentview !== 'Torrent-collection') {
          App.previousview = App.currentview;
          App.currentview = 'Seedbox';
        } else if (!App.ViewStack.includes('torrent-collection') && !$('#filterbar-torrent-collection').hasClass('active')) {
          App.vent.trigger('seedbox:close');
          return this.setActive(App.currentview);
        }
        App.vent.trigger('about:close');
        App.vent.trigger('seedbox:show');
        this.setActive('Seedbox');
      } else {
        if (App.currentview !== 'Torrent-collection') {
          App.currentview = App.previousview;
        }
        App.vent.trigger('seedbox:close');
        this.setActive(App.currentview);
      }
    },

    tvshowTabShow: function(e) {
      e.preventDefault();
      App.currentview = 'shows';
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('shows:list', []);
      this.setActive('TV Series');
    },

    animeTabShow: function(e) {
      e.preventDefault();
      App.currentview = 'anime';
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('anime:list', []);
      this.setActive('Anime');
    },

    movieTabShow: function(e) {
      e.preventDefault();
      App.currentview = 'movies';
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('movies:list', []);
      this.setActive('Movies');
    },

    showFavorites: function(e) {
      e.preventDefault();
      App.previousview = App.currentview;
      App.currentview = 'Favorites';
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('favorites:list', []);
      this.setActive('Favorites');
    },

    showWatched: function(e) {
      e.preventDefault();
      App.previousview = App.currentview;
      App.currentview = 'Watched';
      App.vent.trigger('about:close');
      App.vent.trigger('torrentCollection:close');
      App.vent.trigger('seedbox:close');
      App.vent.trigger('favorites:list', []);
      this.setActive('Watched');
    },

    showWatchlist: function(e) {
      e.preventDefault();
      if (App.currentview !== 'Watchlist') {
        App.previousview = App.currentview;
        App.currentview = 'Watchlist';
        App.vent.trigger('about:close');
        App.vent.trigger('torrentCollection:close');
        App.vent.trigger('seedbox:close');
        App.vent.trigger('watchlist:list', []);
        this.setActive('Watchlist');
      } else {
        if (
          $('#movie-detail').html().length === 0 &&
          $('#about-container').html().length === 0
        ) {
          App.currentview = App.previousview;
          App.vent.trigger(App.previousview.toLowerCase() + ':list', []);
          this.setActive(App.currentview);
        } else {
          App.vent.trigger('about:close');
          App.vent.trigger('torrentCollection:close');
          App.vent.trigger('seedbox:close');
          App.vent.trigger('watchlist:list', []);
          this.setActive('Watchlist');
        }
      }
      return false;
    },

    updateDB: function(e) {
      e.preventDefault();
      App.vent.trigger(this.type + ':update', []);
    },

    randomMovie: function() {}
  });
})(window.App);
