(function(App) {
    "use strict";

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
            'click .cover': 'showDetail'
        },


        onShow: function() {
            // is boorkmarked or not ?
            var that = this;
            Database.getBookmark(this.model.get('imdb_id'), function(err, value) {
                if (!err) {
                    that.model.set('bookmarked', value);
                    if (value == true) {
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
            this.ui.cover.css({
                'background-image': 'url(' + this.model.get('images').poster + ')',
                'opacity': 1
            });

            this.ui.coverImage.remove();
        },

        // triggered on click only
        showDetail: function() {

            App.db.getTVShow({show_id: this.model.get("_id")}, function(err, data) {
                // we send our DB data to our view
                App.vent.trigger('show:showDetail', new Backbone.Model(data));
            });

        },

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;

            if (this.model.get('bookmarked') == true) {
                Database.deleteBookmark(this.model.get('imdb_id'), function(err, data) {
                    that.model.set('bookmarked', false);
                    that.ui.bookmarkIcon.removeClass('selected');
                })
            } else {
                Database.addBookmark(that.model.get('imdb_id'), 'tvshow', function(err, data) {
                    that.model.set('bookmarked', true);
                    that.ui.bookmarkIcon.addClass('selected');
                })
            }
        }

    });

    App.View.ShowItem = ShowItem;
})(window.App);