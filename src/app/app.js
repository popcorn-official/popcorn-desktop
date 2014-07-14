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

    moment = require('moment');

// Special Debug Console Calls!
win.log = console.log.bind(console);
win.debug = function() {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('%c[%cDEBUG%c] %c' + arguments[0], 'color: black;', 'color: green;', 'color: black;', 'color: blue;');
    console.debug.apply(console, params);
};
win.info = function() {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('[%cINFO%c] ' + arguments[0], 'color: blue;', 'color: black;');
    console.info.apply(console, params);
};
win.warn = function() {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('[%cWARNING%c] ' + arguments[0], 'color: orange;', 'color: black;');
    console.warn.apply(console, params);
};
win.error = function() {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('%c[%cERROR%c] ' + arguments[0], 'color: black;', 'color: red;', 'color: black;');
    console.error.apply(console, params);
};

// Load in external templates
_.each(document.querySelectorAll('[type="text/x-template"]'), function(el) {
    $.get(el.src, function(res) {
        el.innerHTML = res;
    });
});

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

App.addRegions({
    Window: '.main-window-region'
});

App.addInitializer(function(options) {
    var mainWindow = new App.View.MainWindow();
    win.show();
    try {
        App.Window.show(mainWindow);
    } catch (e) {
        console.error('Couldn\'t start app: ', e, e.stack);
    }
});

App.vent.on('error', function(err) {
    window.alert('Error: ' + err);
});

/**
* Windows 8 Fix
* https://github.com/rogerwang/node-webkit/issues/1021#issuecomment-34358536
 # commented this line so we can watch movies withou the taskbar showing always

if(process.platform === 'win32' && parseFloat(os.release(), 10) > 6.1) {
    gui.Window.get().setMaximumSize(screen.availWidth + 15, screen.availHeight + 14);
};

*/
// Create the System Temp Folder. This is used to store temporary data like movie files.
if (!fs.existsSync(App.settings.tmpLocation)) {
    fs.mkdir(App.settings.tmpLocation);
}

var deleteFolder = function(path) {

    if (typeof path !== 'string') {
        return;
    }

    try {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function(file, index) {
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

// Wipe the tmpFolder when closing the app (this frees up disk space)
win.on('close', function() {
    if (App.settings.deleteTmpOnClose) {
        deleteFolder(App.settings.tmpLocation);
    }

    win.close(true);
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.capitalizeEach = function() {
    return this.replace(/\w*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
// Developer Shortcuts
Mousetrap.bind(['shift+f12', 'f12', 'command+0'], function(e) {
    win.showDevTools();
});
Mousetrap.bind('command+,', function(e) {
    App.vent.trigger('about:close');
    App.vent.trigger('settings:show');
});
Mousetrap.bind('f11', function(e) {
    win.reloadIgnoringCache();
});
Mousetrap.bind(['?', '/', '\''], function(e) {
    e.preventDefault();
    App.vent.trigger('help:toggle');
});
if (process.platform === 'darwin') {
    Mousetrap.bind('command+ctrl+f', function(e) {
        e.preventDefault();
        win.toggleFullscreen();
    });
}

/**
 * Drag n' Drop Torrent Onto PT Window to start playing (ALPHA)
 */




window.ondragenter = function(e) {

    $('#drop-mask').show();
    var showDrag = true;
    var timeout = -1;
    $('#drop-mask').on('dragenter',
        function(e) {
            $('.drop-indicator').fadeIn('fast');
            console.log('drag init');
        });
    $('#drop-mask').on('dragover',
        function(e) {
            var showDrag = true;
        });

    $('#drop-mask').on('dragleave',
        function(e) {
            var showDrag = false;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                if (!showDrag) {
                    console.log('drag aborted');
                    $('.drop-indicator').hide();
                    $('#drop-mask').hide();
                }
            }, 100);

        });
};

var startTorrentStream = function(torrentFile) {
    var torrentStart = new Backbone.Model({
        torrent: torrentFile
    });
    $('.close-info-player').click();
    App.vent.trigger('stream:start', torrentStart);
};

window.ondrop = function(e) {
    e.preventDefault();
    $('#drop-mask').hide();
    console.log('drag completed');
    $('.drop-indicator').hide();

    var file = e.dataTransfer.files[0];

    if (file != null && file.name.indexOf('.torrent') !== -1) {
        var reader = new FileReader();

        reader.onload = function(event) {
            var content = reader.result;

            fs.writeFile(App.settings.tmpLocation + '\/' + file.name, content, function(err) {
                if (err) {
                    window.alert('Error Loading Torrent: ' + err);
                } else {
                    startTorrentStream(App.settings.tmpLocation + '\/' + file.name);
                }
            });

        };

        reader.readAsBinaryString(file);
    } else {
        var data = e.dataTransfer.getData('text/plain');
        if (data != null && data.substring(0, 8) === 'magnet:?') {
            startTorrentStream(data);
        }
    }

    return false;
};

/**
 * Paste Magnet Link to start stream
 */
$(document).on('paste', function(e) {
    e.preventDefault();
    var data = (e.originalEvent || e).clipboardData.getData('text/plain');
    if (data != null && data.substring(0, 8) === 'magnet:?') {
        startTorrentStream(data);
    }
    return true;
});

/**
 * Pass magnet link as last argument to start stream
 */
var last_arg = gui.App.argv.pop();
console.log('Last arg: '+ last_arg);
console.log('All Args:');
console.log(gui.App.fullArgv);
if(last_arg && (last_arg.substring(0, 8) === 'magnet:?' || last_arg.substring(0, 7) === 'http://' || last_arg.endsWith('.torrent'))) {
    App.vent.on('main:ready', function() {
		startTorrentStream(last_arg);
    });
}

// -f argument to open in fullscreen
if (gui.App.fullArgv.indexOf('-f') !== -1) {
    win.enterFullscreen();
}

/**
 * Show 404 page on uncaughtException
 */
process.on('uncaughtException', function(err) {
    window.console.error(err, err.stack);
});
