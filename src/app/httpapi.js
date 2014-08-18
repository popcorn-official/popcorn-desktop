(function(App) {
	'use strict';
	var rpc = require('json-rpc2');
	var httpServer;

	var HttpApi = function() {
		var server = rpc.Server({
			'headers': { // allow custom headers is empty by default
				'Access-Control-Allow-Origin': '*'
			}
		});

		server.expose('setvolume', function(args, opt, callback){
			var volume = parseFloat(args[0]) || App.Player.volume();
			App.PlayerView.player.volume(volume);
			callback();
		});

		server.expose('toggleplaying', function(args, opt, callback){
			Mousetrap.trigger('space');
			callback();
		});

		server.expose('togglemute', function(args, opt, callback){
			Mousetrap.trigger('m');
			callback();
		});

		server.expose('togglefullscreen', function(args, opt, callback){
			Mousetrap.trigger('f');
			callback();
		});

		server.expose('togglefavourite', function(args, opt, callback){
			Mousetrap.trigger('f');
			callback();
		});

		server.expose('togglemoviesshows', function(args, opt, callback){
			Mousetrap.trigger('tab');
			callback();
		});

		server.expose('togglewatched', function(args, opt, callback){
			Mousetrap.trigger('w');
			callback();
		});

		server.expose('showslist', function(args, opt, callback){
			App.vent.trigger('shows:list');
			callback();
		});

		server.expose('movieslist', function(args, opt, callback){
			App.vent.trigger('movies:list');
			callback();
		});

		server.expose('getviewstack', function(args, opt, callback){
			callback(false, App.ViewStack);
		});

		//Filter Bar
		server.expose('getgenres', function(args, opt, callback){
			callback(false, [App.Config.genres]);
		});

		server.expose('getgenres_tv', function(args, opt, callback){
			callback(false, [App.Config.genres_tv]);
		});

		server.expose('getsorters', function(args, opt, callback){
			callback(false, [App.Config.sorters]);
		});

		server.expose('getsorters_tv', function(args, opt, callback){
			callback(false, [App.Config.sorters_tv]);
		});

		server.expose('filtergenre', function(args, opt, callback){
			$('.genres .dropdown-menu a[data-value='+args[0]+']').click();
			callback();
		});

		server.expose('filtersorter', function(args, opt, callback){
			$('.sorters .dropdown-menu a[data-value='+args[0]+']').click();
			callback();
		});

		server.expose('filtersearch', function(args, opt, callback){
			$('#searchbox').val(args[0]);
			$('.search form').submit();
			callback();
		});

		server.expose('clearsearch', function(args, opt, callback){
			$('.remove-search').click();
		});

		//Standard controls
		server.expose('seek', function(args, opt, callback){
			App.PlayerView.seek(parseFloat(args[0]));
			callback();
		});

		server.expose('up', function(args, opt, callback){
			Mousetrap.trigger('up');
			callback();
		});

		server.expose('down', function(args, opt, callback){
			Mousetrap.trigger('down');
			callback();
		});

		server.expose('left', function(args, opt, callback){
			Mousetrap.trigger('left');
			callback();
		});

		server.expose('right', function(args, opt, callback){
			Mousetrap.trigger('right');
			callback();
		});

		server.expose('enter', function(args, opt, callback){
			Mousetrap.trigger('enter');
			callback();
		});

		server.expose('back', function(args, opt, callback){
			Mousetrap.trigger('backspace');
			callback();
		});

		server.expose('quality', function(args, opt, callback){
			Mousetrap.trigger('q');
			callback();
		});

		server.expose('previousseason', function(args, opt, callback){
			Mousetrap.trigger('ctrl+up');
			callback();
		});

		server.expose('nextseason', function(args, opt, callback){
			Mousetrap.trigger('ctrl+down');
			callback();
		});

		server.expose('subtitleoffset', function(args, opt, callback){
			App.PlayerView.adjustSubtitleOffset(parseFloat(args[0]));
			callback();
		});

		server.expose('getsubtitles', function(args, opt, callback){
			callback(false, [_.keys(App.MovieDetailView.model.get('subtitle'))]);
		});

		server.expose('setsubtitle', function(args, opt, callback){
			App.MovieDetailView.switchSubtitle(args[0]);
		});


		server.enableAuth(Settings.httpApiUsername, Settings.httpApiPassword);

		server.listen(Settings.httpApiPort);
	};  
	HttpApi.prototype.constructor = HttpApi;

	App.HttpApi = new HttpApi();
	
})(window.App);