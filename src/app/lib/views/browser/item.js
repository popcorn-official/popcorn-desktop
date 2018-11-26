(function (App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var Item = Marionette.View.extend({
        template: '#item-tpl',

        tagName: 'li',
        className: 'item',

        attributes: function () {
            return {
                'data-imdb-id': this.model.get('imdb_id')
            };
        },

        ui: {
            coverImage: '.cover-image',
            cover: '.cover',
            bookmarkIcon: '.actions-favorites',
            watchedIcon: '.actions-watched'
        },
        events: {
            'click .actions-favorites': 'toggleFavorite',
            'click .actions-watched': 'toggleWatched',
            'click .cover': 'showDetail',
            'mouseover .cover': 'hoverItem'
        },

        initialize: function () {

            var imdb = this.model.get('imdb_id'),
                bookmarked = App.userBookmarks.indexOf(imdb) !== -1,
                itemtype = this.model.get('type'),
                images = this.model.get('images'),
                img = (images && typeof images.poster !== 'object') ? images.poster : this.model.get('image'),
                watched, cached, that = this;

            switch (itemtype) {
            case 'bookmarkedshow':
                watched = App.watchedShows.indexOf(imdb) !== -1;
                this.model.set('image', img);
                break;
            case 'show':
                watched = App.watchedShows.indexOf(imdb) !== -1;
                images.poster = img;
                break;
            case 'bookmarkedmovie':
            case 'movie':
                watched = App.watchedMovies.indexOf(imdb) !== -1;
                this.model.set('image', img);
                break;
            }
            this.model.set('watched', watched);
            this.model.set('bookmarked', bookmarked);

            var date = new Date();
            var today = ('0' + (date.getMonth() + 　1)).slice(-2) + ('0' + (date.getDate())).slice(-2);
            if (today === '0401') { //april's fool
                var title = this.model.get('title');
                var titleArray = title.split(' ');
                var modified = false;
                var toModify;
                if (titleArray.length !== 1) {
                    for (var i = 0; i < titleArray.length; i++) {
                        if (titleArray[i].length > 3 && !modified) {
                            if (Math.floor((Math.random() * 10) + 1) > 5) { //random
                                titleArray[i] = Settings.projectName;
                                modified = true;
                            }
                        }
                    }
                }
                this.model.set('title', titleArray.join(' '));
            }
        },

        onAttach: function () {
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onRender: function () {
            var itemtype = this.model.get('type');
            if (itemtype === 'show' || itemtype === 'bookmarkedshow' || itemtype === 'historyshow') {
                this.ui.watchedIcon.remove();
            }

        },

        onBeforeDestroy: function () {
            this.ui.coverImage.off('load');
        },

        hoverItem: function (e) {
            if (e.pageX !== prevX || e.pageY !== prevY) {
                $('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        showCover: function () {
            var getBestImage = function (model) {
                var images = model.get('images');
                var image = model.get('image');
                var cover = model.get('cover');
                if (images && images.poster && images.poster.medium) {
                    return images.poster.medium;
                } else if (image && image instanceof String) {
                    return image;
                } else if (cover) {
                    return cover;
                }

                return 'images/posterholder.png';
            };

            var coverUrl;
            var itemtype = this.model.get('type');
            switch (itemtype) {
            case 'bookmarkedmovie':
                if (this.model.get('watched')) {
                    this.ui.watchedIcon.addClass('selected');
                    switch (Settings.watchedCovers) {
                    case 'fade':
                    case 'hide':
                        this.$el.addClass('watched');
                        break;
                    }
                }
                coverUrl = getBestImage(this.model);
                this.ui.bookmarkIcon.addClass('selected');
                break;
            case 'bookmarkedshow':
                coverUrl = this.model.get('image');
                this.ui.bookmarkIcon.addClass('selected');
                break;
            case 'movie':
                coverUrl = getBestImage(this.model);

                if (this.model.get('watched')) {
                    this.ui.watchedIcon.addClass('selected');
                    switch (Settings.watchedCovers) {
                    case 'fade':
                        this.$el.addClass('watched');
                        break;
                    case 'hide':
                        if ($('.search input').val()) {
                            this.$el.addClass('watched');
                        } else {
                            this.$el.remove();
                        }
                        break;
                    }
                }
                if (this.model.get('bookmarked')) {
                    this.ui.bookmarkIcon.addClass('selected');
                }
                break;
            case 'show':
                coverUrl = this.model.get('images').poster;

                if (this.model.get('bookmarked')) {
                    this.ui.bookmarkIcon.addClass('selected');
                }
                break;
            }


            this.ui.watchedIcon.tooltip({
                title: this.ui.watchedIcon.hasClass('selected') ? i18n.__('Mark as unseen') : i18n.__('Mark as Seen')
            });
            this.ui.bookmarkIcon.tooltip({
                title: this.ui.bookmarkIcon.hasClass('selected') ? i18n.__('Remove from bookmarks') : i18n.__('Add to bookmarks')
            });

            var this_ = this;

            var coverCache = new Image();
            coverCache.src = coverUrl;
            coverCache.onload = function () {
                try {
                    this_.ui.cover.css('background-image', 'url(' + coverUrl + ')').addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };
            coverCache.onerror = function () {
                try {
                    this_.ui.cover.css('background-image', 'url("images/posterholder.png")').addClass('fadein');
                } catch (e) {}
                coverCache = null;
            };

            this.ui.coverImage.remove();

        },

        showDetail: function (e) {
      e.preventDefault();

      // display the spinner
      $('.spinner').show();

      var realtype = this.model.get('type');
      var itemtype = realtype.replace('bookmarked', '');
      var providers = this.model.get('providers');
      var torrentProvider = providers.torrent;
      var id = this.model.get(this.model.idAttribute);

      var promises = Object.values(providers)
          .filter(p => (p && p.detail && p !== torrentProvider))
          .map(p => (p.detail(id, this.model.attributes)));

      // bookmarked movies are cached
      if (realtype === 'bookmarkedmovie') {
          return App.vent.trigger('movie:showDetail', this.model);
      }

      // load details
      torrentProvider
          .detail(id, this.model.attributes)
          .then(this.model.set.bind(this.model))
          .then(model => (
              App.vent.trigger(itemtype + ':showDetail', model)
          ))
          .catch (err => console.error('get torrent detail', err));

      // XXX(xaiki): here we could optimise a detail call by marking
      // the models that already got fetched not too long ago, but we
      // actually use memoize in the providers code so it shouldn't be
      // necesary and we refresh the data anyway…
      return Common.Promises.allSettled(promises).then(function (results) {
          // XXX(xaiki): we merge all results into a single object,
          // this allows for much more than sub providers (language,
          // art, metadata) but is a little more fragile.
          var data = results
              .filter(r => (r.ok))
              .reduce((a, c) => (Object.assign(a, c.value)), {});

          this.model.set(data);
      }.bind(this))
          .catch(function (err) {
              console.error('error showing detail:', err);
              $('.spinner').hide();
              $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
          });
  },

        toggleWatched: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('watched')) {
                this.ui.watchedIcon.removeClass('selected');
                if (Settings.watchedCovers === 'fade') {
                    this.$el.removeClass('watched');
                }
                that.model.set('watched', false);
                App.vent.trigger('movie:unwatched', {
                    imdb_id: that.model.get('imdb_id')
                });

            } else {
                this.ui.watchedIcon.addClass('selected');
                switch (Settings.watchedCovers) {
                case 'fade':
                    this.$el.addClass('watched');
                    break;
                case 'hide':
                    this.$el.remove();
                    break;
                }
                that.model.set('watched', true);
                App.vent.trigger('movie:watched', {
                    imdb_id: that.model.get('imdb_id')
                });
            }

            this.ui.watchedIcon.tooltip({
                title: this.ui.watchedIcon.hasClass('selected') ? i18n.__('Mark as unseen') : i18n.__('Mark as Seen')
            });
        },


        toggleFavorite: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var itemtype = this.model.get('type');
    var bookmarked = this.model.get('bookmarked');

    if (bookmarked) {
        this.removeBookmarked().then(function () {

            this.model.set('bookmarked', false);
            this.ui.bookmarkIcon.removeClass('selected');
            this.setCoverStates();
            this.setTooltips();

            if (itemtype.match('bookmarked')) {
                // we'll delete this element from our list view
                $(e.currentTarget).closest('li').animate({
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    width: '0%',
                    opacity: 0
                }, 500, function () {
                    $(this).remove();
                    $('.items').append($('<li/>').addClass('item ghost'));
                    if ($('.items li[data-imdb-id]').length === 0) {
                        App.vent.trigger('favorites:render');
                    }
                });
            }
        }.bind(this));
    } else {
        this.ui.bookmarkIcon.addClass('selected');

        this.addBookmarked().then(function () {
            this.model.set('bookmarked', true);
            this.setCoverStates();
            this.setTooltips();
        }.bind(this)).catch(function (err) {
            console.error('item.addBookmarked failed:', err);
            $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
            this.ui.bookmarkIcon.removeClass('selected');
        }.bind(this));
    }
}

    });

    App.View.Item = Item;
})(window.App);
