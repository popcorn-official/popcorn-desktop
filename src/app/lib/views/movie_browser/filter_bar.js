(function(App) {
    "use strict";

    App.View.FilterBar = Backbone.Marionette.ItemView.extend({
        className: 'filter-bar',
        ui: {
            searchForm: '.search form',
            search:     '.search input',

            sorterValue: '.sorters .value',
            genreValue:  '.genres  .value'
        },
        events: {
            'submit @ui.searchForm': 'search',
            'click .sorters .dropdown-menu a': 'sortBy',
            'click .genres .dropdown-menu a': 'changeGenre',
            'click .settings': 'settings',
            'click .showMovies': 'showMovies',
            'click .showShows': 'showShows',
            'click .favorites': 'showFavorites',
            'click .triggerUpdate': 'updateDB'
        },

        onShow: function() {
            this.$('.sorters .dropdown-menu a:nth(0)').addClass('active');
            this.$('.genres  .dropdown-menu a:nth(0)').addClass('active');
        },

        search: function(e) {
            e.preventDefault();
            this.model.set({
                keywords: this.ui.search.val(),
                genre: ''
            });
            this.ui.search.val('');
            this.ui.search.blur();
        },

        sortBy: function(e) {
            this.$('.sorters .active').removeClass('active');
            $(e.target).addClass('active');

            var sorter = $(e.target).attr('data-value');
            this.ui.sorterValue.text(i18n.__(sorter.capitalizeEach()));

            this.model.set({
                keyword: '',
                sorter: sorter
            });
        },

        changeGenre: function(e) {
            this.$('.genres .active').removeClass('active');
            $(e.target).addClass('active');

            var genre = $(e.target).attr('data-value');
            this.ui.genreValue.text(i18n.__(genre.capitalizeEach()));

            this.model.set({
                keyword: '',
                genre: genre
            });
        },

        settings: function(e) {
            App.vent.trigger('settings:' + this.type);
        },

        showShows: function(e) {
            e.preventDefault();
            App.vent.trigger('shows:list', []);
        },

        showMovies: function(e) {
            e.preventDefault();
            App.vent.trigger('movies:list', []);
        },

        showFavorites: function(e) {
            e.preventDefault();
            App.vent.trigger('favorites:list', []);
        },

        updateDB: function (e) {
            e.preventDefault();
            console.log('Update Triggered');
            App.vent.trigger(this.type + ':update', []);
        },
    });

    App.View.FilterBarMovie = App.View.FilterBar.extend({
        template: '#filter-bar-movie-tpl',
        type: 'movies',
    });

})(window.App);
