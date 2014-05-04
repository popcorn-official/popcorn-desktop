(function(App) {
    "use strict";

    var SCROLL_MORE = 200;

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: '#movie-error-tpl',
        onBeforeRender: function() {
            this.model.set('error', this.error);
        }
    });

    var MovieList = Backbone.Marionette.CompositeView.extend({
        template: '#movie-list-tpl',

        tagName: 'ul',
        className: 'movie-list',

        itemView: App.View.MovieItem,
        itemViewContainer: '.movies',

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
                return ErrorView.extend({error: i18n.__('No movies found...')});
            }
        },

        onResize: function() {
            var movieItem = $('.movie-item');
            var movieItemFullWidth = movieItem.width() + parseInt(movieItem.css('marginLeft')) + parseInt(movieItem.css('marginRight'));
            var movieItemAmount = $('.movie-list').width() / movieItemFullWidth;
            movieItemAmount = Math.floor(movieItemAmount);

            var newWidth = movieItemAmount * movieItemFullWidth;
            $('.movies').width(newWidth);
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
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
            //$("#load_more_item .status-loadmore").html("Loading...");
            //this.ui.spinner.show();
        },

        onLoaded: function() {
            this.checkEmpty();
            var that = this;
            $(window).on('resize', this.onResize);
            $("#load_more_item").remove();
            // we add a load more
            if(this.collection.hasMore) {
                $("#loading-more-animi").hide();
                $(".status-loadmore").show();
                $(".movies").append('<div id="load_more_item" class="load-more"><span class="status-loadmore">load more</span><div id="loading-more-animi" class="loading-container"><div class="ball"></div><div class="ball1"></div></div></div>').click( function(){
                    that.onLoading();
                    that.collection.fetchMore();
                });
                $("#load_more_item .status-loadmore").html("Load More");
            }

            this.onResize();
            this.ui.spinner.hide();
        },

        onScroll: function() {
            if(!this.collection.hasMore) return;

            var totalHeight       = this.$el.prop('scrollHeight');
            var currentPosition = this.$el.scrollTop() + this.$el.height();

            if(this.collection.state === 'loaded' &&
                totalHeight - currentPosition < SCROLL_MORE) {
                this.onLoading();
                this.collection.fetchMore();
            }
        }
    });

    App.View.MovieList = MovieList;
})(window.App);