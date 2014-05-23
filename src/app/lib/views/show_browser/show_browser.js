(function(App) {
    'use strict';

    /**
     * Manage movie browsing:
     *  * Create filter views
     *  * Create movie list
     *  * Fetch new movie collection and pass them to the movie list view
     *  * Show movie detail
     *  * Start playing a movie
     */
    var ShowBrowser = Backbone.Marionette.Layout.extend({
        template: '#show-browser-tpl',
        className: 'show-browser',
        events: {
            'keypress': 'focusSearch',
        },
        regions: {
            FilterBar: '.filter-bar-region',
            ShowList: '.show-list-region'
        },

        initialize: function() {
            this.filter = new App.Model.Filter({
                genres: App.Config.genres_tv,
                sorters: App.Config.sorters_tv
            });

            this.showCollection = new App.Model.ShowCollection([], {
                filter: this.filter
            });

            this.showCollection.fetch();

            this.listenTo(this.filter, 'change', this.onFilterChange);

        },

        onShow: function() {

            this.bar = new App.View.FilterBarShow({
                model: this.filter
            });

            this.FilterBar.show(this.bar);

            this.ShowList.show(new App.View.ShowList({
                collection: this.showCollection
            }));
        },
        onFilterChange: function() {

            this.showCollection = new App.Model.ShowCollection([], {
                filter: this.filter
            });
            App.vent.trigger('show:closeDetail');
            this.showCollection.fetch();

            this.ShowList.show(new App.View.ShowList({
                collection: this.showCollection
            }));
        },

        focusSearch: function (e){
            this.bar.focusSearch();
        }
    });

    App.View.ShowBrowser = ShowBrowser;
})(window.App);
