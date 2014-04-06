(function(App) {
    "use strict";

    var Filter = Backbone.Model.extend({
        defaults: {
            genres: [],
            sorters: []
        },

        initialize: function() {
            this.set('sorter', this.get('sorter') || this.get('sorters')[0]);
            this.set('genre', this.get('genre') || this.get('genres')[0]);
        }
    });

    App.Model.Filter = Filter;
})(window.App);