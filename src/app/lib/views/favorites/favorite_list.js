(function(App) {
    "use strict";

    var SCROLL_MORE = 200;

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: '#movie-error-tpl',
        onBeforeRender: function() {
            this.model.set('error', this.error);
        }
    });

    var FavoriteList = Backbone.Marionette.CompositeView.extend({
        template: '#favorite-list-tpl',

        tagName: 'ul',
        className: 'favorite-list',

        itemView: App.View.FavoriteItem,
        itemViewContainer: '.bookmarks',

        events: {
            'mousewheel': 'onScroll'
        },

        isEmpty: function() {
            return !this.collection.length && this.collection.state !== 'loading';
        },

        getEmptyView: function() {
            if(this.collection.state === 'error') {
                return ErrorView.extend({error: i18n.__('Error loading data, try again later...')});
            } else {
                return ErrorView.extend({error: i18n.__('No bookmarks found...')});
            }
        },

        onResize: function() {
            var movieItem = $('.movie-item');
            var movieItemFullWidth = movieItem.width() + parseInt(movieItem.css('marginLeft')) + parseInt(movieItem.css('marginRight'));
            var movieItemAmount = $('.favorite-list').width() / movieItemFullWidth;
            movieItemAmount = Math.floor(movieItemAmount);

            var newWidth = movieItemAmount * movieItemFullWidth;
            $('.bookmarks').width(newWidth);
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);
        },

        remove: function() {
            $(window).off('resize', this.onResize);
        },

        onShow: function() {
            if(this.collection.state === 'loading') {
                this.onLoading();
            }
        },

        onLoading: function() {
            $(".status-loadmore").hide();
            $("#loading-more-animi").show();
        },

        onLoaded: function() {
            var self = this;
            this.checkEmpty();

            $("#load-more-item").remove();

            // we add a load more
            if(this.collection.hasMore) {
                $(".bookmarks").append('<div id="load-more-item" class="load-more"><span class="status-loadmore">' + i18n.__('Load More') + '</span><div id="loading-more-animi" class="loading-container"><div class="ball"></div><div class="ball1"></div></div></div>');
                $("#load-more-item").click(function(){
                    $("#load-more-item").off('click');
                    self.collection.fetchMore();
                });

                $("#loading-more-animi").hide();
                $(".status-loadmore").show();
            }

            $(window).on('resize', this.onResize);
            this.onResize();
            this.ui.spinner.hide();
        },

        onScroll: function() {
            if(!this.collection.hasMore) return;

            var totalHeight       = this.$el.prop('scrollHeight');
            var currentPosition = this.$el.scrollTop() + this.$el.height();

            if(this.collection.state === 'loaded' &&
                totalHeight - currentPosition < SCROLL_MORE) {
                this.collection.fetchMore();
            }
        }
    });

    App.View.FavoriteList = FavoriteList;
})(window.App);