(function (App) {
    'use strict';

    var Filter = Backbone.Model.extend({
        defaults: {
            genres: [],
            sorters: [],
            types: [],
            order: -1,
            ratings: []
        },

        initialize: function () {
            this.set('genres', []);
            this.set('sorters', []);
            this.set('types', []);
            this.set('ratings', []);
            this.init();

            this.get('provider').filters().then((filters) => {
                this.set('genres', filters.genres || []);
                this.set('sorters', filters.sorters || []);
                this.set('types', filters.types || []);
                this.set('ratings', filters.ratings || []);

                this.init();
                App.vent.trigger('filter-bar:render');
            });
        },

        init() {
            this.set('sorter', this.get('sorter') || Object.keys(this.get('sorters'))[0]);
            this.set('genre', this.get('genre') || Object.keys(this.get('genres'))[0]);
            this.set('type', this.get('type') || Object.keys(this.get('types'))[0]);
            this.set('order', this.get('order') || -1);
            this.set('rating', this.get('rating') || Object.keys(this.get('ratings'))[0]);
        }
    });

    App.Model.Filter = Filter;
})(window.App);
