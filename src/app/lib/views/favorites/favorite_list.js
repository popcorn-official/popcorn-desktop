(function(App) {
    'use strict';

    var SCROLL_MORE = 0.7;

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: '#movie-error-tpl',
        onBeforeRender: function() {
            this.model.set('error', this.error);
        }
    });

    var FavoriteList = Backbone.Marionette.CompositeView.extend({
        template: '#list-tpl',

        tagName: 'ul',
        className: 'list',

        itemView: App.View.Item,
        itemViewContainer: '.items',

        events: {
            'scroll': 'onScroll',
            'mousewheel': 'onScroll',
            'keydown': 'onScroll'
        },

        isEmpty: function() {
            return !this.collection.length && this.collection.state !== 'loading';
        },

        getEmptyView: function() {
            if (this.collection.state === 'error') {
                return ErrorView.extend({
                    error: i18n.__('Error, database is probably corrupted. Try flushing the bookmarks in settings.')
                });
            } else {
                return ErrorView.extend({
                    error: i18n.__('No bookmarks found...')
                });
            }
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);
        },

        onShow: function() {
            if (this.collection.state === 'loading') {
                this.onLoading();
            }
        },

        onLoading: function() {},

        AddGhostsToBottomRow: function() {
            var divsInLastRow, divsInRow, to_add;
            $('.ghost').remove();
            divsInRow = 0;
            $('.items .item').each(function() {
                if ($(this).prev().length > 0) {
                    if ($(this).position().top !== $(this).prev().position().top) {
                        return false;
                    }
                    divsInRow++;
                } else {
                    divsInRow++;
                }
            });
            divsInLastRow = $('.items .item').length % divsInRow;
            if (divsInLastRow === 0) {

                divsInLastRow = -Math.abs(Math.round($('.items').width() / $('.item').outerWidth(true)) - divsInRow);

            }
            to_add = divsInRow - divsInLastRow;
            while (to_add > 0) {
                $('.items').append($('<li/>').addClass('item ghost'));
                to_add--;
            }
        },

        onLoaded: function() {
            var self = this;
            this.checkEmpty();

            if (typeof(this.ui.spinner) === 'object') {
                this.ui.spinner.hide();
            }
            this.AddGhostsToBottomRow();
            $(window).resize(function() {
                var addghost;
                clearTimeout(addghost);
                addghost = setTimeout(function() {
                    self.AddGhostsToBottomRow();
                }, 100);
            });
        },

        onScroll: function() {
            if (!this.collection.hasMore) {
                return;
            }

            var totalHeight = this.$el.prop('scrollHeight');
            var currentPosition = this.$el.scrollTop() + this.$el.height();

            if (this.collection.state === 'loaded' &&
                (currentPosition /
                    totalHeight) > SCROLL_MORE) {
                this.collection.fetchMore();
            }
        }
    });

    App.View.FavoriteList = FavoriteList;
})(window.App);