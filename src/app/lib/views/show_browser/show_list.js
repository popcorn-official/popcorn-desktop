(function(App) {
    'use strict';

    var SCROLL_MORE = 200;

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: '#movie-error-tpl',
        onBeforeRender: function() {
            this.model.set('error', this.error);
        }
    });

    var ShowList = Backbone.Marionette.CompositeView.extend({
        template: '#show-list-tpl',

        tagName: 'ul',
        className: 'show-list',

        itemView: App.View.ShowItem,
        itemViewContainer: '.shows',

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
                return ErrorView.extend({error: i18n.__('No shows found...')});
            }
        },

        onResize: function() {
            var showItem = $('.movie-item');
            var showItemFullWidth = showItem.width() + parseInt(showItem.css('marginLeft')) + parseInt(showItem.css('marginRight'));
            var showItemAmount = $('.show-list').width() / showItemFullWidth;
            showItemAmount = Math.floor(showItemAmount);

            var newWidth = showItemAmount * showItemFullWidth;
            $('.shows').width(newWidth);
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);

            var _this = this;

            Mousetrap.bind('up', function(e) {_this.moveUp(e); _this.keyNav(e)});

            Mousetrap.bind('down',function(e) {_this.moveDown(e); _this.keyNav(e)});

            Mousetrap.bind('left', function(e) {_this.moveLeft(e); _this.keyNav(e)});

            Mousetrap.bind('right', function(e) {_this.moveRight(e); _this.keyNav(e)});

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
            var self = this;
            this.checkEmpty();

            $('#load-more-item').remove();

            // we add a load more
            if(this.collection.hasMore && this.collection.filter.keywords === null && this.collection.state !== 'error') {
                $('.shows').append('<div id=\'load-more-item\' class=\'load-more\'><span class=\'status-loadmore\'>' + i18n.__('Load More') + '</span><div id=\'loading-more-animi\' class=\'loading-container\'><div class=\'ball\'></div><div class=\'ball1\'></div></div></div>');

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
                    self.$('.shows:first').focus();
                    self.$('.movie-item').eq(0).addClass('selected');
                });
            });
            $('.shows').attr('tabindex','1');
            _.defer(function(){
                self.$('.shows:first').focus();
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
            var numInRow = calculateSeriesInThisRow($('.movie-item.selected'));
            if(index - numInRow < 0) {
                return;
            }
            $('.movie-item.selected').removeClass('selected');
            $('.shows .movie-item').eq(index - numInRow).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
        },

        moveDown: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index();
            var numInRow = calculateSeriesInThisRow($('.movie-item.selected'));
            $('.movie-item.selected').removeClass('selected');
            $('.shows .movie-item').eq(index + numInRow).addClass('selected');
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
                $('.shows .movie-item').eq(0).addClass('selected');
            }
            $('.movie-item.selected').removeClass('selected');
            $('.shows .movie-item').eq(--index).addClass('selected');
            $('.movie-item.selected')[0].scrollIntoView(false);
        },

        moveRight: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = $('.movie-item.selected').index();
            $('.movie-item.selected').removeClass('selected');
            $('.shows .movie-item').eq(++index).addClass('selected');
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

    function calculateSeriesInThisRow(selected) {
        var topNumber = selected.position().top;
        var divsInRow = 0;
        $('.shows li').each(function() {
            if($(this).position().top === topNumber){
                divsInRow++;
            }
        });
        return divsInRow;
    }

    App.View.ShowList = ShowList;
})(window.App);