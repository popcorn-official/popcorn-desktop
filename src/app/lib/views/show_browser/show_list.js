(function(App) {
    "use strict";

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
            'mousewheel': 'onScroll'
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
            $("#load_more_item .status").html("Loading...");           
            this.ui.spinner.show();
        },

        onLoaded: function() {
            this.checkEmpty();
            var that = this;
            $(window).on('resize', this.onResize);

            $("#load_more_item").remove();
            // we add a load more
            if(that.collection.hasMore) {
                
                $(".shows").append('<li id="load_more_item" class="movie-item" style="background-color:#fff"><span class="status">load more</span></li>').click( function(){
                    that.onLoading();
                    that.collection.fetchMore();
                });
                $("#load_more_item .status").html("Load More");
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

    App.View.ShowList = ShowList;
})(window.App);