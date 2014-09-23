(function (App) {
	'use strict';

	var ShowCollection = App.Model.Collection.extend({
		model: App.Model.Movie,
		popid: 'imdb_id',
		type: 'shows',
		getProviders: function () {
			return {
				torrents: App.Config.getProvider('tvshow'),
				//         subtitle: App.Config.getProvider('subtitle'),
				//         metadata: App.Trakt
			};
		},
	});

	App.Model.ShowCollection = ShowCollection;
})(window.App);
