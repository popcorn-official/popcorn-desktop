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
            var movieItemAmount = $('.movie-list').width() / ($('.movie-item').width() + 20);
            movieItemAmount = Math.floor(movieItemAmount);

            var newWidth = movieItemAmount * ($('.movie-item').width() + 20);
            $('.movies').width(newWidth);
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.collection, 'loaded', this.onLoaded);
            $(window).on('resize', this.onResize)

            this.onResize();
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
            this.ui.spinner.show();
        },

        onLoaded: function() {
            this.checkEmpty();
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

    App.View.MovieList = MovieList;
})(window.App);