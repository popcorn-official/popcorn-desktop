(function(App) {
    'use strict';

    var SCROLL_MORE = 200;
    var NUM_MOVIES_IN_ROW = 7;
    var _this;

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
            'mousewheel': 'onScroll',
            'keydown': 'onScroll'
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
            NUM_MOVIES_IN_ROW = movieItemAmount;
            $('.movies').width(newWidth);
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            _this = this;
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);

            Mousetrap.bind('up', _this.moveUp);

            Mousetrap.bind('down', _this.moveDown);

            Mousetrap.bind('left', _this.moveLeft);

            Mousetrap.bind('right', _this.moveRight);

            Mousetrap.bind(['enter', 'space'], _this.selectItem);

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
            $('.status-loadmore').hide();
            $('#loading-more-animi').show();
        },

        onLoaded: function() {
			console.timeEnd('App startup time');
            var self = this;
            this.checkEmpty();

            $('#load-more-item').remove();

            // we add a load more
            if(this.collection.hasMore && this.collection.filter.keywords === undefined && this.collection.state !== 'error') {
                $('.movies').append('<div id=\'load-more-item\' class=\'load-more\'><span class=\'status-loadmore\'>' + i18n.__('Load More') + '</span><div id=\'loading-more-animi\' class=\'loading-container\'><div class=\'ball\'></div><div class=\'ball1\'></div></div></div>');
                
                $('#load-more-item').click(function(){
                    $('#load-more-item').off('click');
                    self.collection.fetchMore();
                });

                $('#loading-more-animi').hide();
                $('.status-loadmore').show();
            }

            $(window).on('resize', this.onResize);
            this.onResize();
            this.ui.spinner.hide();
			
            $('.filter-bar').on('mousedown', function(e){
                if(e.target.localName !== 'div') {
                    return;
                }
                _.defer(function(){
                    self.$('.movies:first').focus();
                    if($('.movie-item.selected').length === 0) {
                        self.$('.movie-item').eq(0).addClass('selected');
                    }
                });
            });
            $('.movies').attr('tabindex','1');
            _.defer(function(){
                self.$('.movies:first').focus();
                if($('.movie-item.selected').length === 0){
                    self.$('.movie-item').eq(0).addClass('selected');
                }
            });
        },

        onScroll: function() {
            if(!this.collection.hasMore) {
                return;
            }

            var totalHeight       = this.$el.prop('scrollHeight');
            var currentPosition = this.$el.scrollTop() + this.$el.height();

            if(this.collection.state === 'loaded' &&
                totalHeight - currentPosition < SCROLL_MORE) {
                this.collection.fetchMore();
            }
        },

        selectItem: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.movie-item.selected .cover').trigger('click');
        },

        selectIndex: function(index) {
            $('.movie-item.selected').removeClass('selected');
            $('.movies .movie-item').eq(index).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
            _this.onScroll();
        },

        moveUp: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index() - NUM_MOVIES_IN_ROW;
            if(index< 0) {
                return;
            }
            _this.selectIndex(index);
        },

        moveDown: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index() + NUM_MOVIES_IN_ROW;
            if($('.movies .movie-item').eq(index).length === 0) {
                return;
            }
            _this.selectIndex(index);
        },

        moveLeft: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index() - 1;
            if(index === -1) {
                return;
            }
            if(index === -2) {
                $('.movies .movie-item').eq(0).addClass('selected');
            }
            _this.selectIndex(index);
        },

        moveRight: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index() + 1;
            _this.selectIndex(index);
        },
    });

    App.View.MovieList = MovieList;
})(window.App);