(function(App) {
    'use strict';
    var prevX = 0;
    var prevY = 0;

    var ShowItem = Backbone.Marionette.ItemView.extend({
        template: '#show-item-tpl',

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


        onShow: function() {
            // is boorkmarked or not ?
            var that = this;
            this.blocked = false;
            Database.getBookmark(this.model.get('imdb_id'), function(err, value) {
                if (!err) {
                    that.model.set('bookmarked', value);
                    if (value === true) {
                        that.ui.bookmarkIcon.addClass('selected');
                    }
                } else {
                    that.model.set('bookmarked', false);
                }
            });
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        showCover: function() {
			console.log(this.model);
            this.ui.cover.css({
                'background-image': 'url(' + this.model.get('images').poster.replace('.jpg','-138.jpg') + ')',
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

                        that.ui.bookmarkIcon.removeClass('selected');
                        
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
                                that.ui.bookmarkIcon.addClass('selected');
                                that.model.set('bookmarked', true);
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