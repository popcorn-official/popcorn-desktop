(function(App) {
    'use strict';

    App.View.FilterBar = Backbone.Marionette.ItemView.extend({
        className: 'filter-bar',
        ui: {
            searchForm: '.search form',
            searchInput: '.search input',
            search: '.search',
            searchClose: '.remove-search',
            searchText: '.text-search',

            sorterValue: '.sorters .value',
            genreValue: '.genres  .value'
        },
        events: {
            'hover  @ui.searchInput': 'focus',
            'submit @ui.searchForm': 'search',
            'click  @ui.searchClose': 'removeSearch',
            'click  @ui.search': 'focusSearch',
            'click .sorters .dropdown-menu a': 'sortBy',
            'click .genres .dropdown-menu a': 'changeGenre',
            'click .settings': 'settings',
            'click .about': 'about',
            'click .showMovies': 'showMovies',
            'click .showShows': 'showShows',
            'click .favorites': 'showFavorites',
            'click .triggerUpdate': 'updateDB'
        },

        focus: function(e) {
            e.focus();
        },

        onShow: function() {
            this.$('.sorters .dropdown-menu a:nth(0)').addClass('active');
            this.$('.genres  .dropdown-menu a:nth(0)').addClass('active');

        },

        focusSearch: function() {
            this.$('.search input').focus();

        },

        search: function(e) {
            App.vent.trigger('about:close');
            App.vent.trigger('movie:closeDetail');
            e.preventDefault();
            var searchvalue = this.ui.searchInput.val();
            this.model.set({
                keywords: this.ui.searchInput.val(),
                genre: ''
            });
            this.ui.search.blur();

            if (searchvalue === '') {
                this.ui.searchClose.hide('slow');
                this.ui.searchText.text();
            } else {
                this.ui.searchClose.show();
                this.ui.searchText.text(this.ui.searchInput.val());
            }
        },
        removeSearch: function(e) {
            App.vent.trigger('about:close');
            App.vent.trigger('movie:closeDetail');
            e.preventDefault();
            this.model.set({
                keywords: '',
                genre: ''
            });

            this.ui.searchInput.val('');
            this.ui.searchClose.hide('slow');
            this.ui.searchText.text();
        },

        sortBy: function(e) {
            App.vent.trigger('about:close');
            this.$('.sorters .active').removeClass('active');
            $(e.target).addClass('active');

            var sorter = $(e.target).attr('data-value');

            if (this.previousSort === sorter) {
                this.model.set('order', this.model.get('order') * -1);
            } else {
                this.model.set('order', -1);
            }
            this.ui.sorterValue.text(i18n.__(sorter.capitalizeEach()));

            this.model.set({
                keyword: '',
                sorter: sorter
            });
            this.previousSort = sorter;
        },

        changeGenre: function(e) {
            App.vent.trigger('about:close');
            this.$('.genres .active').removeClass('active');
            $(e.target).addClass('active');

            var genre = $(e.target).attr('data-value');
            this.ui.genreValue.text(i18n.__(genre));

            this.model.set({
                keyword: '',
                genre: genre
            });
        },

        settings: function(e) {
            App.vent.trigger('about:close');
            App.vent.trigger('settings:show');
        },

        about: function(e) {
            App.vent.trigger('about:show');
        },

        showShows: function(e) {
            e.preventDefault();
            App.vent.trigger('about:close');
            App.vent.trigger('shows:list', []);
        },

        showMovies: function(e) {
            e.preventDefault();
            App.vent.trigger('about:close');
            App.vent.trigger('movies:list', []);
        },

        showFavorites: function(e) {
            e.preventDefault();
            App.vent.trigger('about:close');
            App.vent.trigger('favorites:list', []);
        },

        updateDB: function(e) {
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