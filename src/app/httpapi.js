(function (App) {
	'use strict';
	var rpc = require('json-rpc2');
	var server;
	var httpServer;

	var initServer = function () {
		server = rpc.Server({
			'headers': { // allow custom headers is empty by default
				'Access-Control-Allow-Origin': '*'
			}			
		});

		server.expose('ping', function (args, opt, callback) {
			popcornCallback(callback);
		});
		
		server.expose('volume', function (args, opt, callback) {
			var volume = 1;
			var view = App.PlayerView;
			args = parseFloat(args);
			if(view !== undefined && view.player !== undefined) {
				if(args >= 0) {
					volume = args;
					if(volume > 0) {
						if(view.player.muted()) view.player.muted(false);
						view.player.volume(volume);
					} else {
						view.player.muted(true);
					}
				} else {
					volume = view.player.volume();
				}
			}
			popcornCallback(callback, false, { 'volume': volume });
		});

		server.expose('toggleplaying', function (args, opt, callback) {
			Mousetrap.trigger('space');
			popcornCallback(callback);
		});

		server.expose('togglemute', function (args, opt, callback) {
			Mousetrap.trigger('m');
			popcornCallback(callback);
		});

		server.expose('togglefullscreen', function (args, opt, callback) {
			Mousetrap.trigger('f');
			popcornCallback(callback);
		});

		server.expose('togglefavourite', function (args, opt, callback) {
			Mousetrap.trigger('f');
			popcornCallback(callback);
		});

		server.expose('toggletab', function (args, opt, callback) {
			Mousetrap.trigger('tab');
			popcornCallback(callback);
		});

		server.expose('togglewatched', function (args, opt, callback) {
			Mousetrap.trigger('w');
			popcornCallback(callback);
		});

		server.expose('togglequality', function (args, opt, callback) {
			Mousetrap.trigger('q');
			popcornCallback(callback);
		});

		server.expose('showslist', function (args, opt, callback) {
			App.vent.trigger('shows:list');
			popcornCallback(callback);
		});

		server.expose('movieslist', function (args, opt, callback) {
			App.vent.trigger('movies:list');
			popcornCallback(callback);
		});
		
		server.expose('getplaying', function (args, opt, callback) {
			var view = App.PlayerView;
			var playing = false;
			if(view !== undefined && view.player !== undefined && !view.player.paused()) {
				var result = { 
					'playing': true, 
					'title': view.model.get('title'),
					'movie': view.isMovie(),
					'quality': view.model.get('quality'),
					'downloadSpeed': view.model.get('downloadSpeed'),
					'uploadSpeed': view.model.get('uploadSpeed'),
					'activePeers': view.model.get('activePeers'),
					'volume': view.player.volume(),
					'currentTime': App.PlayerView.player.currentTime(),
					'duration': App.PlayerView.player.duration()
				};
				
				if(result.movie) {
					result['imdb_id'] = view.model.get('imdb_id');
				} else {
					result['tvdb_id'] = view.model.get('tvdb_id');
					result['season'] = view.model.get('season');
					result['episode'] = view.model.get('episode');
				}
				
				popcornCallback(callback, false, result);
			} else {
				popcornCallback(callback, false, { 'playing': false });
			}
		});

		server.expose('getviewstack', function (args, opt, callback) {
			popcornCallback(callback, false, {'viewstack': App.ViewStack});
		});
		
		server.expose('getcurrenttab', function (args, opt, callback) {
			popcornCallback(callback, false, {'tab': App.currentview});
		});

		//Filter Bar
		server.expose('getgenres', function (args, opt, callback) {
			switch(App.currentview) {
				case 'shows':
				case 'anime':
					popcornCallback(callback, false, { 'genres': App.Config.genres_tv });
					break;
				case 'movies':
					popcornCallback(callback, false, { 'genres': App.Config.genres });
					break;
				default:
					popcornCallback(callback, false, { 'genres': [] });
					break;
			}
		});

		server.expose('getsorters', function (args, opt, callback) {
			switch(App.currentview) {
				case 'shows':
				case 'anime':
					popcornCallback(callback, false, { 'sorters': App.Config.sorters_tv });
					break;
				case 'movies':
					popcornCallback(callback, false, { 'sorters': App.Config.sorters });
					break;
				default:
					popcornCallback(callback, false, { 'sorters': [] });
					break;
			}
		});
		
		server.expose('gettypes', function (args, opt, callback) {
			switch(App.currentview) {
				case 'anime':
					popcornCallback(callback, false, { 'types': App.Config.types_anime });
					break;
				default:
					popcornCallback(callback, false, { 'types': [] });
					break;
			}
		});

		server.expose('filtergenre', function (args, opt, callback) {
			$('.genres .dropdown-menu a[data-value="' + args.toLowerCase() + '"]').click();
			popcornCallback(callback);
		});

		server.expose('filtersorter', function (args, opt, callback) {
			$('.sorters .dropdown-menu a[data-value="' + args.toLowerCase() + '"]').click();
			popcornCallback(callback);
		});
		
		server.expose('filtertype', function (args, opt, callback) {
			$('.types .dropdown-menu a[data-value="' + args.toLowerCase() + '"]').click();
			popcornCallback(callback);
		});

		server.expose('filtersearch', function (args, opt, callback) {
			$('#searchbox').val(args);
			$('.search form').submit();
			popcornCallback(callback);
		});

		server.expose('clearsearch', function (args, opt, callback) {
			$('.remove-search').click();
			popcornCallback(callback);
		});

		//Standard controls
		server.expose('seek', function (args, opt, callback) {
			var view = App.PlayerView;
			args = parseFloat(args);
			if(view !== undefined && view.player !== undefined && args != undefined) {
				App.PlayerView.seek(args);
			}
			popcornCallback(callback);
		});

		server.expose('up', function (args, opt, callback) {
			Mousetrap.trigger('up');
			popcornCallback(callback);
		});

		server.expose('down', function (args, opt, callback) {
			Mousetrap.trigger('down');
			popcornCallback(callback);
		});

		server.expose('left', function (args, opt, callback) {
			Mousetrap.trigger('left');
			popcornCallback(callback);
		});

		server.expose('right', function (args, opt, callback) {
			Mousetrap.trigger('right');
			popcornCallback(callback);
		});

		server.expose('enter', function (args, opt, callback) {
			Mousetrap.trigger('enter');
			popcornCallback(callback);
		});

		server.expose('back', function (args, opt, callback) {
			Mousetrap.trigger('backspace');
			popcornCallback(callback);
		});

		server.expose('previousseason', function (args, opt, callback) {
			Mousetrap.trigger('ctrl+up');
			popcornCallback(callback);
		});

		server.expose('nextseason', function (args, opt, callback) {
			Mousetrap.trigger('ctrl+down');
			popcornCallback(callback);
		});

		server.expose('subtitleoffset', function (args, opt, callback) {
			App.PlayerView.adjustSubtitleOffset(parseFloat(args[0]));
			popcornCallback(callback);
		});

		server.expose('getsubtitles', function (args, opt, callback) {
			popcornCallback(callback, false, { "subtitles": _.keys(App.MovieDetailView.model.get('subtitle')) });
		});

		server.expose('setsubtitle', function (args, opt, callback) {
			App.MovieDetailView.switchSubtitle(args[0]);
			popcornCallback(callback);
		});

		server.expose('listennotifications', function (args, opt, callback) {
			var timeout;
			var startTime = (new Date()).getTime();
			var events = {};

			var emitEvents = function () {
				popcornCallback(callback, false, {"events": events});
			};

			//Do a small delay before sending data in case there are more simultaneous events
			var reinitTimeout = function () {
				//Only do a delay if the request won't time out in the meantime
				if (startTime + 8000 - (new Date()).getTime() > 250) {
					if (timeout) {
						clearTimeout(timeout);
					}
					timeout = setTimeout(emitEvents, 200);
				}
			};

			//Listen for volume change
			App.vent.on('volumechange', function () {
				events['volumechange'] = App.PlayerView.player.volume();
				reinitTimeout();
			});

			//Listen for view stack change
			var emitViewChange = function () {
				events['viewstack'] = App.ViewStack;
				reinitTimeout();
			};

			App.vent.on('viewstack:push', emitViewChange);
			App.vent.on('viewstack:pop', emitViewChange);
		});
	};

	var sockets = [];

	function startListening() {
		httpServer = server.listen(Settings.httpApiPort);

		httpServer.on('connection', function (socket) {
			sockets.push(socket);
			socket.setTimeout(4000);
			socket.on('close', function () {
				console.log('socket closed');
				sockets.splice(sockets.indexOf(socket), 1);
			});
		});
	}

	function closeServer(cb) {
		httpServer.close(function () {
			cb();
		});
		for (var i = 0; i < sockets.length; i++) {
			console.log('socket #' + i + ' destroyed');
			sockets[i].destroy();
		}
	}
		
	function popcornCallback(callback, err, result) {
		if(result == undefined) result = {};
		result['popcornVersion'] = App.settings.version;
		callback(err, result);
	}

	initServer();

	App.vent.on('initHttpApi', function () {
		console.log('Reiniting server');
		server.enableAuth(Settings.httpApiUsername, Settings.httpApiPassword);
		if (httpServer) {
			closeServer(startListening);
		} else {
			startListening();
		}
	});

})(window.App);
