(function(App) {
    "use strict";

    var FilterBarShow = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-show-tpl',
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
            'click .showMovies': 'showMovies',
            'click .showShows': 'showShows',
            'click .settings': 'settings',
            'click .favorites': 'showFavorites'
        },

        settings: function(e) {
            App.vent.trigger('settings:show');          
        },

        showShows: function(e) {
            e.preventDefault();
            App.vent.trigger('shows:list', []);
        },

        showMovies: function(e) {
            e.preventDefault();
            App.vent.trigger('movies:list', []);
        },

        search: function(e) {
            e.preventDefault();
            this.model.set({
                keywords: this.ui.search.val()
            });
            
            this.ui.search.val('');
            this.ui.search.blur();
        },

        sortBy: function(e) {
            this.$('.sorters .active').removeClass('active');
            $(e.target).addClass('active');

            var sorter = $(e.target).attr('data-value');
            this.ui.sorterValue.text(i18n.__('sort-' + sorter));

            this.model.set({
                keyword: '',
                sorter: sorter
            });
        },

        showFavorites: function(e) {
            e.preventDefault();
            App.vent.trigger('favorites:list', []);
        },
               
    });

    App.View.FilterBarShow = FilterBarShow;
})(window.App);