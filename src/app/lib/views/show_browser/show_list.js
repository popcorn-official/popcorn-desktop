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
            if(this.collection.hasMore && this.collection.filter.keywords == null && this.collection.state != 'error') {
                $(".shows").append('<div id="load-more-item" class="load-more"><span class="status-loadmore">' + i18n.__('Load More') + '</span><div id="loading-more-animi" class="loading-container"><div class="ball"></div><div class="ball1"></div></div></div>');

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

    App.View.ShowList = ShowList;
})(window.App);