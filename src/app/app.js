var
// Minimum percentage to open video
	MIN_PERCENTAGE_LOADED = 0.5,

	// Minimum bytes loaded to open video
	MIN_SIZE_LOADED = 10 * 1024 * 1024,

	// Load native UI library
	gui = require('nw.gui'),

	// browser window object
	win = gui.Window.get(),

	// os object
	os = require('os'),

	// path object
	path = require('path'),

	// fs object
	fs = require('fs'),

	// url object
	url = require('url'),

	// i18n module (translations)
	i18n = require('i18n'),

	// Mime type parsing
	mime = require('mime'),

	moment = require('moment'),

	Q = require('q');

// Special Debug Console Calls!
win.log = console.log.bind(console);
win.debug = function () {
	var params = Array.prototype.slice.call(arguments, 1);
	params.unshift('%c[%cDEBUG%c] %c' + arguments[0], 'color: black;', 'color: green;', 'color: black;', 'color: blue;');
	console.debug.apply(console, params);
};
win.info = function () {
	var params = Array.prototype.slice.call(arguments, 1);
	params.unshift('[%cINFO%c] ' + arguments[0], 'color: blue;', 'color: black;');
	console.info.apply(console, params);
};
win.warn = function () {
	var params = Array.prototype.slice.call(arguments, 1);
	params.unshift('[%cWARNING%c] ' + arguments[0], 'color: orange;', 'color: black;');
	console.warn.apply(console, params);
};
win.error = function () {
	var params = Array.prototype.slice.call(arguments, 1);
	params.unshift('%c[%cERROR%c] ' + arguments[0], 'color: black;', 'color: red;', 'color: black;');
	console.error.apply(console, params);
	fs.appendFileSync(path.join(require('nw.gui').App.dataPath, 'logs.txt'), '\n\n' + arguments[0]); // log errors;
};


if (gui.App.fullArgv.indexOf('--reset') !== -1) {

	var data_path = require('nw.gui').App.dataPath;

	localStorage.clear();

	fs.unlinkSync(path.join(data_path, 'data/watched.db'), function (err) {
		if (err) {
			throw err;
		}
	});
	fs.unlinkSync(path.join(data_path, 'data/movies.db'), function (err) {
		if (err) {
			throw err;
		}
	});
	fs.unlinkSync(path.join(data_path, 'data/bookmarks.db'), function (err) {
		if (err) {
			throw err;
		}
	});
	fs.unlinkSync(path.join(data_path, 'data/shows.db'), function (err) {
		if (err) {
			throw err;
		}
	});
	fs.unlinkSync(path.join(data_path, 'data/settings.db'), function (err) {
		if (err) {
			throw err;
		}
	});

}


// Global App skeleton for backbone
var App = new Backbone.Marionette.Application();
_.extend(App, {
	Controller: {},
	View: {},
	Model: {},
	Page: {},
	Scrapers: {},
	Providers: {},
	Localization: {}
});

// set database
App.db = Database;

// Set settings
App.advsettings = AdvSettings;
App.settings = Settings;

fs.readFile('./.git.json', 'utf8', function (err, json) {
	if (!err) {
		App.git = JSON.parse(json);
	}
});

App.addRegions({
	Window: '.main-window-region'
});


//Keeps a list of stacked views
App.ViewStack = [];

App.addInitializer(function (options) {
	// this is the 'do things with resolutions and size initializer
	var zoom = 0;

	var screen = window.screen;

	if (ScreenResolution.QuadHD) {
		zoom = 2;
	}
	/*
	if (ScreenResolution.UltraHD) {
		zoom = 4;
	}
	*/

	var width = parseInt(localStorage.width ? localStorage.width : Settings.defaultWidth);
	var height = parseInt(localStorage.height ? localStorage.height : Settings.defaultHeight);
	var x = parseInt(localStorage.posX ? localStorage.posX : -1);
	var y = parseInt(localStorage.posY ? localStorage.posY : -1);

	// reset app width when the width is bigger than the available width
	if (screen.availWidth < width) {
		win.info('Window too big, resetting width');
		width = screen.availWidth;
	}

	// reset app height when the width is bigger than the available height
	if (screen.availHeight < height) {
		win.info('Window too big, resetting height');
		height = screen.availHeight;
	}

	// reset x when the screen width is smaller than the window x-position + the window width
	if (x < 0 || (x + width) > screen.width) {
		win.info('Window out of view, recentering x-pos');
		x = Math.round((screen.availWidth - width) / 2);
	}

	// reset y when the screen height is smaller than the window y-position + the window height
	if (y < 0 || (y + height) > screen.height) {
		win.info('Window out of view, recentering y-pos');
		y = Math.round((screen.availHeight - height) / 2);
	}

	win.zoomLevel = zoom;
	win.resizeTo(width, height);
	win.moveTo(x, y);
});

var initTemplates = function () {
	// Load in external templates
	var ts = [];

	_.each(document.querySelectorAll('[type="text/x-template"]'), function (el) {
		var d = Q.defer();
		$.get(el.src, function (res) {
			el.innerHTML = res;
			d.resolve(true);
		});
		ts.push(d.promise);
	});

	return Q.all(ts);
};

var initApp = function () {
	var mainWindow = new App.View.MainWindow();
	win.show();

	try {
		App.Window.show(mainWindow);
	} catch (e) {
		console.error('Couldn\'t start app: ', e, e.stack);
	}
};

App.addInitializer(function (options) {
	initTemplates()
		.then(initApp);
});

var deleteFolder = function (path) {

	if (typeof path !== 'string') {
		return;
	}

	try {
		var files = [];
		if (fs.existsSync(path)) {
			files = fs.readdirSync(path);
			files.forEach(function (file, index) {
				var curPath = path + '\/' + file;
				if (fs.lstatSync(curPath).isDirectory()) {
					deleteFolder(curPath);
				} else {
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	} catch (err) {
		win.error('deleteFolder()', err);
	}
};

win.on('resize', function (width, height) {
	localStorage.width = Math.round(width);
	localStorage.height = Math.round(height);
});

win.on('move', function (x, y) {
	localStorage.posX = Math.round(x);
	localStorage.posY = Math.round(y);

});

// Wipe the tmpFolder when closing the app (this frees up disk space)
win.on('close', function () {
	if (App.settings.deleteTmpOnClose) {
		deleteFolder(App.settings.tmpLocation);
	}
	if (fs.existsSync(path.join(require('nw.gui').App.dataPath, 'logs.txt'))) {
		fs.unlinkSync(path.join(require('nw.gui').App.dataPath, 'logs.txt'));
	}
	win.close(true);
});

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.capitalizeEach = function () {
	return this.replace(/\w*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

String.prototype.endsWith = function (suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
// Developer Shortcuts
Mousetrap.bind(['shift+f12', 'f12', 'command+0'], function (e) {
	win.showDevTools();
});
Mousetrap.bind(['shift+f10', 'f10', 'command+9'], function (e) {
	win.debug('Opening: ' + App.settings['tmpLocation']);
	gui.Shell.openItem(App.settings['tmpLocation']);
});
Mousetrap.bind('mod+,', function (e) {
	App.vent.trigger('about:close');
	App.vent.trigger('settings:show');
});
Mousetrap.bind('f11', function (e) {
	var spawn = require('child_process').spawn,
		argv = gui.App.fullArgv,
		CWD = process.cwd();

	argv.push(CWD);
	spawn(process.execPath, argv, {
		cwd: CWD,
		detached: true,
		stdio: ['ignore', 'ignore', 'ignore']
	}).unref();
	gui.App.quit();
});
Mousetrap.bind(['?', '/', '\''], function (e) {
	e.preventDefault();
	App.vent.trigger('keyboard:toggle');
});
Mousetrap.bind('shift+up shift+up shift+down shift+down shift+left shift+right shift+left shift+right shift+b shift+a', function () {
	var body = $('body');

	if (body.hasClass('knm')) {
		body.removeClass('knm');
	} else {
		body.addClass('knm');
	}
});
if (process.platform === 'darwin') {
	Mousetrap.bind('command+ctrl+f', function (e) {
		e.preventDefault();
		win.toggleFullscreen();
	});
} else {
	Mousetrap.bind('ctrl+alt+f', function (e) {
		e.preventDefault();
		win.toggleFullscreen();
	});
}

// Drag n' Drop Torrent Onto PT Window to start playing (ALPHA)
window.ondragenter = function (e) {

	$('#drop-mask').show();
	var showDrag = true;
	var timeout = -1;
	$('#drop-mask').on('dragenter',
		function (e) {
			$('.drop-indicator').show();
			win.debug('drag init');
		});
	$('#drop-mask').on('dragover',
		function (e) {
			var showDrag = true;
		});

	$('#drop-mask').on('dragleave',
		function (e) {
			var showDrag = false;
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				if (!showDrag) {
					win.debug('drag aborted');
					$('.drop-indicator').hide();
					$('#drop-mask').hide();
				}
			}, 100);
		});
};

var handleTorrent = function (torrent) {
	try {
		App.PlayerView.closePlayer();
	} catch (err) {
		// The player wasn't running
	}
	App.Config.getProvider('torrentCache').resolve(torrent);
};

window.ondrop = function (e) {
	e.preventDefault();
	$('#drop-mask').hide();
	win.debug('drag completed');
	$('.drop-indicator').hide();

	var file = e.dataTransfer.files[0];

	if (file != null && (file.name.indexOf('.torrent') !== -1 || file.name.indexOf('.srt') !== -1)) {
		var reader = new FileReader();

		reader.onload = function (event) {
			var content = reader.result;

			fs.writeFile(path.join(App.settings.tmpLocation, file.name), content, function (err) {
				if (err) {
					App.PlayerView.closePlayer();
					window.alert(i18n.__('Error Loading File') + ': ' + err);
				} else {
					if (file.name.indexOf('.torrent') !== -1) {
						Settings.droppedTorrent = file.name;
						handleTorrent(path.join(App.settings.tmpLocation, file.name));
					} else if (file.name.indexOf('.srt') !== -1) {
						Settings.droppedSub = file.name;
						App.vent.trigger('videojs:drop_sub');
					}
				}
			});

		};

		reader.readAsBinaryString(file);

	} else {
		var data = e.dataTransfer.getData('text/plain');
		Settings.droppedMagnet = data;
		handleTorrent(data);
	}

	return false;
};

// Paste Magnet Link to start stream
$(document).on('paste', function (e) {

	if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
		return;
	}

	var data = (e.originalEvent || e).clipboardData.getData('text/plain');
	e.preventDefault();
	Settings.droppedMagnet = data;
	handleTorrent(data);
	return true;
});


// Pass magnet link as last argument to start stream
var last_arg = gui.App.argv.pop();

if (last_arg && (last_arg.substring(0, 8) === 'magnet:?' || last_arg.substring(0, 7) === 'http://' || last_arg.endsWith('.torrent'))) {
	App.vent.on('main:ready', function () {
		handleTorrent(last_arg);
	});
}

// -f argument to open in fullscreen
if (gui.App.fullArgv.indexOf('-f') !== -1) {
	win.enterFullscreen();
}


// Show 404 page on uncaughtException
process.on('uncaughtException', function (err) {
	win.error(err, err.stack);
});
