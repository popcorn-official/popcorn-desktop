(function(App) {
    "use strict";

    var SCROLL_MORE = 200;

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: '#show-error-tpl',
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
                return ErrorView.extend({error: i18n.__('No movies found...')});
            }
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.collection, 'loaded', this.onLoaded);
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


    });

    App.View.ShowList = ShowList;
})(window.App);