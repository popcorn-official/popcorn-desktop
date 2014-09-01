(function(App) {
	'use strict';
	var clipboard = gui.Clipboard.get();

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
			'contextmenu @ui.searchInput': 'rightclick_search',
			'click  @ui.searchClose': 'removeSearch',
			'click  @ui.search': 'focusSearch',
			'click .sorters .dropdown-menu a': 'sortBy',
			'click .genres .dropdown-menu a': 'changeGenre',
			'click #filterbar-settings': 'settings',
			'click #filterbar-about': 'about',
			'click .showMovies': 'showMovies',
			'click .showShows': 'showShows',
			'click #filterbar-favorites': 'showFavorites',
			'click .triggerUpdate': 'updateDB'
		},


		focus: function(e) {
			e.focus();
		},
		setactive: function(set) {
			$('.filter-bar').find('.active').removeClass('active');
			switch (set) {
				case 'TV Series':
				case 'shows':
					$('.source.showShows').addClass('active');
					break;
				case 'Movies':
				case 'movies':
					$('.source.showMovies').addClass('active');
					break;
				case 'Favorites':
				case 'favorites':
					$('#filterbar-favorites').addClass('active');
					break;
			}
		},
		rightclick_search: function(e) {
			e.stopPropagation();
			var search_menu = new this.context_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'));
			search_menu.popup(e.originalEvent.x, e.originalEvent.y);
		},

		context_Menu: function(cutLabel, copyLabel, pasteLabel) {
			var gui = require('nw.gui'),
				menu = new gui.Menu(),

				cut = new gui.MenuItem({
					label: cutLabel || 'Cut',
					click: function() {
						document.execCommand('cut');
					}
				}),

				copy = new gui.MenuItem({
					label: copyLabel || 'Copy',
					click: function() {
						document.execCommand('copy');
					}
				}),

				paste = new gui.MenuItem({
					label: pasteLabel || 'Paste',
					click: function() {
						var text = clipboard.get('text');
						$('#searchbox').val(text);
					}
				});

			menu.append(cut);
			menu.append(copy);
			menu.append(paste);

			return menu;
		},
		onShow: function() {
			this.$('.sorters .dropdown-menu a:nth(0)').addClass('active');
			this.$('.genres  .dropdown-menu a:nth(0)').addClass('active');

			if (typeof App.currentview === 'undefined') {



				switch (AdvSettings.get('startScreen')) {
					case 'TV Series':
						App.currentview = 'shows';
						break;
					case 'Movies':
						App.currentview = 'movies';
						break;
					case 'Favorites':
						App.currentview = 'Favorites';
						App.previousview = 'movies';
						break;

					default:
						App.currentview = 'movies';
				}
				this.setactive(App.currentview);
			}

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
			App.currentview = 'settings';
		},

		about: function(e) {
			App.vent.trigger('about:show');
		},

		showShows: function(e) {
			e.preventDefault();
			App.currentview = 'shows';
			App.vent.trigger('about:close');
			App.vent.trigger('shows:list', []);
			this.setactive('TV Series');
		},

		showMovies: function(e) {
			e.preventDefault();

			App.currentview = 'movies';
			App.vent.trigger('about:close');
			App.vent.trigger('movies:list', []);
			this.setactive('Movies');
		},

		showFavorites: function(e) {
			e.preventDefault();

			if (App.currentview !== 'Favorites') {
				App.previousview = App.currentview;
				App.currentview = 'Favorites';
				App.vent.trigger('about:close');
				App.vent.trigger('favorites:list', []);
				this.setactive('Favorites');
			} else {

				if ($('#movie-detail').html().length === 0 && $('#about-container').html().length === 0) {
					App.currentview = App.previousview;
					App.vent.trigger(App.previousview + ':list', []);
					this.setactive(App.currentview);

				} else {
					App.vent.trigger('about:close');
					App.vent.trigger('favorites:list', []);
					this.setactive('Favorites');
				}

			}

		},

		updateDB: function(e) {
			e.preventDefault();
			console.log('Update Triggered');
			App.vent.trigger(this.type + ':update', []);
		}
	});

	App.View.FilterBar = App.View.FilterBar.extend({
		template: '#filter-bar-tpl'
	});

})(window.App);