(function (App) {
    'use strict';

    /**
     * Manage browsing:
     *  * Create filter views
     *  * Create movie list
     *  * Fetch new movie collection and pass them to the movie list view
     *  * Show movie detail
     *  * Start playing a movie
     */
    var PCTBrowser = Marionette.View.extend({
        template: '#browser-tpl',
        className: 'main-browser',
        regions: {
            FilterBar: '.filter-bar-region',
            ItemList: '.list-region'
        },
        events: {
            'click .retry-button': 'onFilterChange',
            'click .online-search': 'onlineSearch'
        },

        initialize: function () {
            this.filter = new App.Model.Filter(this.filters);

            this.collection = new this.collectionModel([], {
                filter: this.filter
            });

            this.collection.fetch();

            this.listenTo(this.filter, 'change', this.onFilterChange);

        },

        onAttach: function () {
            if (Settings.rememberFilters) {
                this.filter.set(this.getSavedFilter());
            }

            this.bar = new App.View.FilterBar({
                model: this.filter
            });

            this.showChildView('FilterBar', this.bar);

            this.showChildView('ItemList', new App.View.List({
                collection: this.collection
            }));

            if (!isNaN(startupTime)) {
                win.debug('Butter %s startup time: %sms', Settings.version, (window.performance.now() - startupTime).toFixed(3)); // started in database.js;
                startupTime = 'none';
                if (Settings.bigPicture) {
                    var zoom = ScreenResolution.HD ? 2 : 3;
                    win.zoomLevel = zoom;
                }
                App.vent.trigger('app:started');
            }
        },
        onFilterChange: function () {
            this.saveFilter();

            this.collection = new this.collectionModel([], {
                filter: this.filter
            });
            App.vent.trigger('show:closeDetail');
            this.collection.fetch();

            this.showChildView('ItemList', new App.View.List({
                collection: this.collection
            }));
        },
        onlineSearch: function () {
            switch (App.currentview) {
            case 'movies':
                Settings.OnlineSearchCategory = 'Movies';
                break;
            case 'shows':
                Settings.OnlineSearchCategory = 'TV Series';
                break;
            case 'anime':
                Settings.OnlineSearchCategory = 'Anime';
                break;
            default:
            }

            if (!Settings.activateTorrentCollection) {
                AdvSettings.set('activateTorrentCollection', true);
                $('#torrent_col').css('display', 'block');
            }

            $('#filterbar-torrent-collection').click();
        },

        focusSearch: function (e) {
            this.bar.focusSearch();
        },

        currentView: function () {
            var view = App.currentview;

            if (!view) {
                var activetab;
                var tabs = {
                    'TV Series': 'shows',
                    'Movies': 'movies',
                    'Anime': 'anime'
                };

                if (AdvSettings.get('startScreen') === 'Last Open') {
                    activetab = AdvSettings.get('lastTab');
                } else {
                    activetab = AdvSettings.get('startScreen');
                }

                view = tabs[activetab] || 'movies';
            }

            return view;
        },

        saveFilter: function () {
            var filters = AdvSettings.get('filters') || {};
            filters[this.currentView()] = this.filter.pick('sorter', 'genre', 'type', 'order');
            AdvSettings.set('filters', filters);
        },

        getSavedFilter: function () {
            var filters = AdvSettings.get('filters') || {};
            return filters[this.currentView()] || this.filter.pick('sorter', 'genre', 'type', 'order');
        }
    });

    App.View.PCTBrowser = PCTBrowser;
})(window.App);
