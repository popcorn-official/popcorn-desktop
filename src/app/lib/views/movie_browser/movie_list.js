(function(App) {
    'use strict';

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
            $('.movies').width(newWidth);
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            var _this = this;
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);

            Mousetrap.bind('up', function (e) { _this.moveUp(e); _this.keyNav(e);});

            Mousetrap.bind('down', function (e) { _this.moveDown(e); _this.keyNav(e);});

            Mousetrap.bind('left', function (e) { _this.moveLeft(e); _this.keyNav(e);});

            Mousetrap.bind('right', function (e) { _this.moveRight(e); _this.keyNav(e);});

            Mousetrap.bind('enter', _this.selectItem);

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
            if(this.collection.hasMore && this.collection.filter.keywords === null && this.collection.state !== 'error') {
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
                    self.$('.movie-item').eq(0).addClass('selected');
                });
            });
            $('.movies').attr('tabindex','1');
            _.defer(function(){
                self.$('.movies:first').focus();
                self.$('.movie-item').eq(0).addClass('selected');
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

        moveUp: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index();
            var numInRow = calculateMoviesInThisRow($('.movie-item.selected'));
            if(index - numInRow < 0) {
                return;
            }
            $('.movie-item.selected').removeClass('selected');
            $('.movies .movie-item').eq(index - numInRow).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
        },

        moveDown: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index();
            var numInRow = calculateMoviesInThisRow($('.movie-item.selected'));
            $('.movie-item.selected').removeClass('selected');
            $('.movies .movie-item').eq(index + numInRow).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
        },

        moveLeft: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index();
            if(index === 0) {
                return;
            }
            if(index === -1) {
                $('.movies .movie-item').eq(0).addClass('selected');
            }
            $('.movie-item.selected').removeClass('selected');
            $('.movies .movie-item').eq(--index).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
        },

        moveRight: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index();
            $('.movie-item.selected').removeClass('selected');
            $('.movies .movie-item').eq(++index).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
        },

        keyNav: function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearTimeout($('#content').data('keyNavTimer'));
            $('#content').addClass('key-nav');
            $('#content').data('key-nav-timer', setTimeout(function() {
                $('#content').removeClass('key-nav');
            }, 30000));
        }
    });

    function calculateMoviesInThisRow(selected) {
        var topNumber = selected.position().top;
        var divsInRow = 0;
        $('.movies li').each(function() {
            if($(this).position().top === topNumber){
                divsInRow++;
            }
        });
        return divsInRow;
    }

    App.View.MovieList = MovieList;
})(window.App);