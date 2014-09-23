(function (App) {
	'use strict';

	var FavoriteBrowser = App.View.PCTBrowser.extend({
		collectionModel: App.Model.FavoriteCollection
	});

	App.View.FavoriteBrowser = FavoriteBrowser;
})(window.App);
