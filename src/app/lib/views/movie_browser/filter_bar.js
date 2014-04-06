(function(App) {
    "use strict";

    var FilterBar = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-tpl',
        className: 'filter-bar',

        ui: {
            searchForm: '.search form',
            search: '.search input'
        },

        events: {
            'submit @ui.searchForm': 'search'
        },

        templateHelpers: {
            getCategories: function() {
                return App.Config.categories;
            },

            getSortBy: function() {
                return App.Config.sortBy;
            }
        },

        search: function(e) {
            e.preventDefault();
            this.trigger('search', this.ui.search.val());
            this.ui.search.val('');
            this.ui.search.blur();
        }
    });

    App.View.FilterBar = FilterBar;
})(window.App);