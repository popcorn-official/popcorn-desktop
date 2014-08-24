(function(App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var resizeImage = App.Providers.Trakttv.resizeImage;

    var ShowItem = Backbone.Marionette.ItemView.extend({
        template: '#item-tpl',
        modelEvents: {
            'change': 'render'
        },

        tagName: 'li',
        className: 'item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover',
            bookmarkIcon: '.actions-favorites',
            watchedIcon: '.actions-watched'
        },

        events: {
            'click .actions-favorites': 'toggleFavorite',
            'click .cover': 'showDetail',
            'mouseover .cover': 'hoverItem'
        },

        initialize: function() {
            var images = this.model.get('images');
            images.poster = resizeImage(images.poster, '300');
        },

        onShow: function() {
            // is boorkmarked or not ?
            var that = this;
            this.blocked = false;
            var bookmarked = App.userBookmarks.indexOf(this.model.get('imdb_id')) !== -1;
            this.model.set('bookmarked', bookmarked);
            this.ui.watchedIcon.hide();
        },

        onRender: function() {
            var bookmarked = this.model.get('bookmarked');

            if (bookmarked) {
                this.ui.bookmarkIcon.addClass('selected');
            } else {
                this.ui.bookmarkIcon.removeClass('selected');
            }

            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        showCover: function() {
            this.ui.cover.css({
                'background-image': 'url(' + this.model.get('images').poster + ')',
                'opacity': 1
            });

            this.ui.coverImage.remove();
        },

        hoverItem: function(e) {
            if (e.pageX !== prevX || e.pageY !== prevY) {
                $('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        // triggered on click only
        showDetail: function() {
            $('.spinner').show();
            var provider = this.model.get('provider'); //XXX(xaiki): provider hack
            var tvshow = App.Config.getProvider('tvshow')[provider];
            var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                data.provider = provider;
                $('.spinner').hide();
                if (!err) {
                    App.vent.trigger('show:showDetail', new Backbone.Model(data));
                } else {
                    alert('Somethings wrong... try later');
                }
            });
        },

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('bookmarked') === true) {
                Database.deleteBookmark(this.model.get('imdb_id'), function(err, data) {
                    win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                    that.model.set('bookmarked', false);
                    App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id')), 1);

                    // we'll make sure we dont have a cached show
                    Database.deleteTVShow(that.model.get('imdb_id'), function(err, data) {});
                });
            } else {
                var provider = this.model.get('provider'); //XXX(xaiki): provider hack
                var tvshow = App.Config.getProvider('tvshow')[provider];
                var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                    if (!err) {
                        data.provider = that.model.get('provider');
                        Database.addTVShow(data, function(err, idata) {
                            Database.addBookmark(that.model.get('imdb_id'), 'tvshow', function(err, data) {
                                win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                that.model.set('bookmarked', true);
                                App.userBookmarks.push(that.model.get('imdb_id'));
                            });
                        });

                    } else {
                        alert('Somethings wrong... try later');
                    }
                });
            }
        },

    });

    App.View.ShowItem = ShowItem;
})(window.App);