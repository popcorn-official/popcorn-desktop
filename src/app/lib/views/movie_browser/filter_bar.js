(function(App) {
    "use strict";

    var FilterBar = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-tpl',
        className: 'filter-bar',

        templateHelpers: {
            getCategories: function() {
                return this.categories;
            }
        }
    });

    App.View.FilterBar = FilterBar;
})(window.App);