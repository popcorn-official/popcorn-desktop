(function(App) {
	'use strict';

	var SCROLL_MORE = 200;

	var ErrorView = Backbone.Marionette.ItemView.extend({
		template: '#movie-error-tpl',
		onBeforeRender: function() {
			this.model.set('error', this.error);
		}
	});

	var FavoriteList = Backbone.Marionette.CompositeView.extend({
		template: '#favorite-list-tpl',

		tagName: 'ul',
		className: 'favorite-list',

		itemView: App.View.FavoriteItem,
		itemViewContainer: '.bookmarks',

		events: {
			'mousewheel': 'onScroll'
		},

		isEmpty: function() {
			return !this.collection.length && this.collection.state !== 'loading';
		},

		getEmptyView: function() {
			if(this.collection.state === 'error') {
				return ErrorView.extend({error: i18n.__('Error, database is probably corrupted. Try flushing the bookmarks in settings.')});
			} else {
				return ErrorView.extend({error: i18n.__('No bookmarks found...')});
			}
		},

		ui: {
			spinner: '.spinner'
		},

		initialize: function() {
			this.listenTo(this.collection, 'loading', this.onLoading);
			this.listenTo(this.collection, 'loaded', this.onLoaded);
		},

		onShow: function() {
			if(this.collection.state === 'loading') {
				this.onLoading();
			}
		},

		onLoading: function() {},

		onLoaded: function() {
			var self = this;
			this.checkEmpty();
			
			$('.bookmark-item:empty').remove();
			if($('.bookmark-item:empty').length === 0 && $('.bookmark-item:not(:empty)').length > 0){
				for (var i=0; i<20; i++) {
					$('.bookmarks').append('<li class="bookmark-item"></li>');
				}
			}
			
			this.ui.spinner.hide();
		},

		onScroll: function() {
			if(!this.collection.hasMore) {
				return;
			}

			var totalHeight       = this.$el.prop('scrollHeight');
			var currentPosition = this.$el.scrollTop() + this.$el.height();

			if(this.collection.state === 'loaded' &&
				totalHeight - currentPosition < SCROLL_MORE) {
				this.collection.fetchMore();
			}
		}
	});

	App.View.FavoriteList = FavoriteList;
})(window.App);