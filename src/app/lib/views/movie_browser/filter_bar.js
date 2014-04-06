(function(App) {
    "use strict";

    var FilterBar = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-tpl',
        className: 'filter-bar',

        ui: {
            searchForm: '.search form',
            search: '.search input',

            sorterValue: '.sorters .value',
            genreValue: '.genres .value'
        },

        events: {
            'submit @ui.searchForm': 'search',
            'click .sorters .dropdown-menu a': 'sortBy',
            'click .genres .dropdown-menu a': 'changeGenre'
        },

        search: function(e) {
            e.preventDefault();
            this.model.set('keyword', this.ui.search.val());
            this.ui.search.val('');
            this.ui.search.blur();
        },

        sortBy: function(e) {
            var sorter = $(e.target).attr('data-value');
            this.ui.sorterValue.text(i18n.__('sort-' + sorter));

            this.model.set({
                keyword: '',
                sorter: sorter
            });
        },

        changeGenre: function(e) {
            var genre = $(e.target).attr('data-value');
            this.ui.genreValue.text(i18n.__('genre-' + genre));

            this.model.set({
                keyword: '',
                genre: genre
            });
        }
    });

    App.View.FilterBar = FilterBar;
})(window.App);