(function(App) {
    'use strict';
    var prevX = 0;
    var prevY = 0;

    var resizeImage = App.Providers.Trakttv.resizeImage;

    var ShowItem = Backbone.Marionette.ItemView.extend({
        template: '#show-item-tpl',
        modelEvents: {
            'change': 'render'
        },

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover',
            bookmarkIcon: '.actions-favorites'
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
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onRender: function() {
            var bookmarked = this.model.get('bookmarked');

            if (bookmarked) {
                this.ui.bookmarkIcon.addClass('selected');
            }
            else {
                this.ui.bookmarkIcon.removeClass('selected');
            }

            this.showCover();
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
            if(e.pageX !== prevX || e.pageY !== prevY) {
                $('.movie-item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        // triggered on click only
        showDetail: function() {
            $('.spinner').show();
            var tvshow = new (App.Config.getProvider('tvshow'))();
            var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
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
                    console.log('Bookmark deleted');
                    that.model.set('bookmarked', false);
                    App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id'), 1));
                        
                    // we'll make sure we dont have a cached show
                    Database.deleteTVShow(that.model.get('imdb_id'),function(err, data) {});
                });
            } else {
                var tvshow = new (App.Config.getProvider('tvshow'))();
                var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                    if (!err) {
                        Database.addTVShow(data, function(err, idata) {
                            Database.addBookmark(that.model.get('imdb_id'), 'tvshow', function(err, data) {
                                console.log('Bookmark added');
                                that.model.set('bookmarked', true);
                                App.userBookmarks.push(that.model.get('imdb_id'));
                            });
                        });

                    } else {
                        alert('Somethings wrong... try later');
                    }
                });
                

            }
        }

    });

    App.View.ShowItem = ShowItem;
})(window.App);