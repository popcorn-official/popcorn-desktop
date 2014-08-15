(function(App) {
	'use strict';
	var rpc = require('json-rpc2');
	var httpServer;

	var HttpApi = function() {
		var server = rpc.Server.create({
			'headers': { // allow custom headers is empty by default
				'Access-Control-Allow-Origin': '*'
			}
		});

		server.expose('setvolume', function(args, opt, callback){
			var volume = parseFloat(args[0]) || App.Player.volume();
			App.Player.volume(volume);
			callback();
		});

		server.expose('toggleplaying', function(args, opt, callback){
			if(App.Player.paused()){
				App.Player.play();
			}
			else{
				App.Player.pause();
			}
			callback();
		});

		server.expose('togglemute', function(args, opt, callback){
			this.player.muted(!this.player.muted());
			callback();
		});

		server.expose('seek', function(args, opt, callback){
			App.Player.currentTime(App.Player.currentTime() + parseFloat(args[0]));
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

		server.enableAuth(Settings.httpApiUsername, Settings.httpApiPassword);

		server.listen(Settings.httpApiPort, 'localhost');
	};  
	HttpApi.prototype.constructor = HttpApi;

	App.HttpApi = new HttpApi();
	
})(window.App);