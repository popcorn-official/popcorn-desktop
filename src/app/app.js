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
    fs.appendFileSync(path.join(data_path, 'logs.txt'), '\n\n' + (arguments[0].stack || arguments[0])); // log errors;
};


if (gui.App.fullArgv.indexOf('--reset') !== -1) {

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

// Menu for mac
if (os.platform() === 'darwin') {
    var nativeMenuBar = new gui.Menu({
        type: 'menubar'
    });
    nativeMenuBar.createMacBuiltin(Settings.projectName, {
        hideEdit: false,
        hideWindow: true
    });
    win.menu = nativeMenuBar;
}

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
    rimraf(path, function () {});
};

var deleteCookies = function () {
    function removeCookie(cookie) {
        var lurl = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
        win.cookies.remove({
            url: lurl,
            name: cookie.name
        }, function (result) {
            if (result) {
                if (!result.name) {
                    result = result[0];
                }
                win.debug('cookie removed: ' + result.name + ' ' + result.url);
            } else {
                win.error('cookie removal failed');
            }
        });
    }

    win.cookies.getAll({}, function (cookies) {
        if (cookies.length > 0) {
            win.debug('Removing ' + cookies.length + ' cookies...');
            for (var i = 0; i < cookies.length; i++) {
                removeCookie(cookies[i]);
            }
        }
    });
};

var delCache = function () {
    var reqDB = window.indexedDB.webkitGetDatabaseNames();
    reqDB.onsuccess = function (db) {
        if (db.timeStamp && (new Date().valueOf() - db.timeStamp > 259200000)) { // 3 days old
            window.indexedDB.deleteDatabase('cache');
            win.close(true);
        } else {
            win.close(true);
        }
    };
    win.close(true);
};

win.on('resize', function (width, height) {
    localStorage.width = Math.round(width);
    localStorage.height = Math.round(height);
});

win.on('move', function (x, y) {
    localStorage.posX = Math.round(x);
    localStorage.posY = Math.round(y);
});

win.on('enter-fullscreen', function () {
    App.vent.trigger('window:focus');
});

// Wipe the tmpFolder when closing the app (this frees up disk space)
win.on('close', function () {
    if (App.settings.deleteTmpOnClose) {
        deleteFolder(App.settings.tmpLocation);
    }
    if (fs.existsSync(path.join(data_path, 'logs.txt'))) {
        fs.unlinkSync(path.join(data_path, 'logs.txt'));
    }
    try {
        delCache();
    } catch (e) {
        win.close(true);
    }
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
Mousetrap.bindGlobal(['shift+f12', 'f12', 'command+0'], function (e) {
    win.showDevTools();
});
Mousetrap.bindGlobal(['shift+f10', 'f10', 'command+9'], function (e) {
    win.debug('Opening: ' + App.settings.tmpLocation);
    gui.Shell.openItem(App.settings.tmpLocation);
});
Mousetrap.bind('mod+,', function (e) {
    App.vent.trigger('about:close');
    App.vent.trigger('settings:show');
});
Mousetrap.bindGlobal('f11', function (e) {
    Settings.deleteTmpOnClose = false;
    App.vent.trigger('restartButter');
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
Mousetrap.bindGlobal(['command+ctrl+f', 'ctrl+alt+f'], function (e) {
    e.preventDefault();
    win.toggleFullscreen();
});
Mousetrap.bind('shift+b', function (e) {
    if (!ScreenResolution.SD) {
        if (App.settings.bigPicture) {
            win.zoomLevel = Settings.noBigPicture || 0;
            AdvSettings.set('bigPicture', false);
        } else {
            win.maximize();
            AdvSettings.set('noBigPicture', win.zoomLevel);
            AdvSettings.set('bigPicture', true);
            var zoom = ScreenResolution.HD ? 2 : 3;
            win.zoomLevel = zoom;
        }
    } else {
        App.vent.trigger('notification:show', new App.Model.Notification({
            title: i18n.__('Big Picture Mode'),
            body: i18n.__('Big Picture Mode is unavailable on your current screen resolution'),
            showRestart: false,
            type: 'error',
            autoclose: true
        }));
    }
});

// Drag n' Drop Torrent Onto PT Window to start playing (ALPHA)
window.ondragenter = function (e) {

    $('#drop-mask').show();
    var showDrag = true;
    var timeout = -1;
    $('#drop-mask').on('dragenter',
        function (e) {
            $('.drop-indicator').show();
            win.debug('Drag init');
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
                    win.debug('Drag aborted');
                    $('.drop-indicator').hide();
                    $('#drop-mask').hide();
                }
            }, 100);
        });
};

var minimizeToTray = function () {
    win.hide();
    win.isTray = true;

    var tray = new gui.Tray({
        title: Settings.projectName,
        icon: 'src/app/images/icon.png'
    });

    var openFromTray = function () {
        win.show();
        tray.remove();
        win.isTray = false;
    };

    tray.tooltip = Settings.projectName;

    var menu = new gui.Menu();
    menu.append(new gui.MenuItem({
        type: 'normal',
        label: i18n.__('Restore'),
        click: function () {
            openFromTray();
        }
    }));
    menu.append(new gui.MenuItem({
        type: 'normal',
        label: i18n.__('Close'),
        click: function () {
            win.close();
        }
    }));

    tray.menu = menu;

    tray.on('click', function () {
        openFromTray();
    });

    gui.App.on('open', function (cmd) {
        openFromTray();
    });
};

var isVideo = function (file) {
    var ext = path.extname(file).toLowerCase();
    switch (ext) {
    case '.mp4':
    case '.avi':
    case '.mov':
    case '.mkv':
    case '.wmv':
        return true;
    default:
        return false;
    }
};

var handleVideoFile = function (file) {
    $('.spinner').show();

    // look for local subtitles
    var checkSubs = function () {
        var _ext = path.extname(file.name);
        var toFind = file.path.replace(_ext, '.srt');

        if (fs.existsSync(path.join(toFind))) {
            return {
                local: path.join(toFind)
            };
        } else {
            return null;
        }
    };

    // get subtitles from provider
    var getSubtitles = function (subdata) {
        return Q.Promise(function (resolve, reject) {
            win.debug('Subtitles data request:', subdata);

            var subtitleProvider = App.Config.getProviderForType('subtitle');

            subtitleProvider.fetch(subdata).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    win.info(Object.keys(subs).length + ' subtitles found');
                    resolve(subs);
                } else {
                    win.warn('No subtitles returned');
                    if (Settings.subtitle_language !== 'none') {
                        App.vent.trigger('notification:show', new App.Model.Notification({
                            title: i18n.__('No subtitles found'),
                            body: i18n.__('Try again later or drop a subtitle in the player'),
                            showRestart: false,
                            type: 'warning',
                            autoclose: true
                        }));
                    }
                    reject(new Error('No subtitles returned'));
                }
            }).catch(function (err) {
                reject(err);
            });
        });
    };

    // close the player if needed
    try {
        App.PlayerView.closePlayer();
    } catch (err) {}

    // init our objects
    var playObj = {
        src: path.join(file.path),
        type: 'video/mp4'
    };
    var sub_data = {
        filename: path.basename(file.path),
        path: file.path
    };

    // try to figure out what movie/episode we're playing
    Common.matchTorrent(path.basename(file.path))
        .then(function (res) {
            if (!res || res.error) {
                throw new Error('matchTorrent failed');
            }

            playObj.metadataCheckRequired = true;
            playObj.videoFile = file.path;
            switch (res.type) {
            case 'movie':
                playObj.title = res.movie.title;
                playObj.quality = res.quality;
                playObj.imdb_id = res.movie.imdbid;
                playObj.poster = res.movie.poster;
                playObj.year = res.movie.year;

                sub_data.imdbid = res.movie.imdbid;
                break;
            case 'episode':
                playObj.title = res.show.title + ' - ' + i18n.__('Season %s', res.show.episode.season) + ', ' + i18n.__('Episode %s', res.show.episode.episode) + ' - ' + res.show.episode.title;
                playObj.quality = res.quality;
                playObj.season = res.show.episode.season;
                playObj.episode = res.show.episode.episode;
                playObj.poster = res.show.poster;
                playObj.tvdb_id = res.show.tvdbid;
                playObj.imdb_id = res.show.imdbid;
                playObj.episode_id = res.show.episode.tvdbid;

                sub_data.imdbid = res.show.imdbid;
                sub_data.season = res.show.episode.season;
                sub_data.episode = res.show.episode.episode;
                break;
            default:
            }

            // try to get subtitles for that movie/episode
            return getSubtitles(sub_data)
                .then(function (subtitles) {
                    var localsub = checkSubs();
                    if (localsub !== null) {
                        subtitles = jQuery.extend({}, subtitles, localsub);
                    }
                    playObj.subtitle = subtitles;

                    if (localsub !== null) {
                        playObj.defaultSubtitle = 'local';
                    } else {
                        playObj.defaultSubtitle = 'none';
                    }
                })
                .catch(function (err) {
                    playObj.defaultSubtitle = 'local';
                    playObj.subtitle = checkSubs();
                });
        })
        .catch(function (err) {
            playObj.title = file.name;
            playObj.quality = false;
            playObj.videoFile = file.path;
            playObj.defaultSubtitle = 'local';
            playObj.subtitle = checkSubs();
        })

    // once we've checked everything, we start playing.
    .finally(function () {
        $('.spinner').hide();

        var localVideo = new Backbone.Model(playObj); // streamer model
        win.debug('Trying to play local file', localVideo.get('src'), localVideo.attributes);

        var tmpPlayer = App.Device.Collection.selected.attributes.id;
        App.Device.Collection.setDevice('local');
        App.vent.trigger('stream:ready', localVideo); // start stream
        App.Device.Collection.setDevice(tmpPlayer);

        $('.eye-info-player').hide();
    });
};

var handleTorrent = function (torrent) {
    try {
        App.PlayerView.closePlayer();
    } catch (err) {
        // The player wasn't running
    }
    App.Config.getProviderForType('torrentCache').resolve(torrent);
};

window.ondrop = function (e) {
    e.preventDefault();
    $('#drop-mask').hide();
    win.debug('Drag completed');
    $('.drop-indicator').hide();

    var file = e.dataTransfer.files[0];

    if (!file) {
        var data = e.dataTransfer.getData('text/plain');
        Settings.droppedMagnet = data;
        handleTorrent(data);
        return false;
    }

    if (file.name.indexOf('.torrent') !== -1 ||
        file.name.indexOf('.srt') !== -1) {
        fs.writeFile(path.join(App.settings.tmpLocation, file.name), fs.readFileSync(file.path), function (err) {
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
    } else if (isVideo(file.name)) {
        handleVideoFile(file);
        return false;
    }

    console.error('could not handle', e);
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
    App.vent.on('app:started', function () {
        handleTorrent(last_arg);
    });
}

// Play local files
if (last_arg && (isVideo(last_arg))) {
    App.vent.on('app:started', function () {
        var fileModel = {
            path: last_arg,
            name: /([^\\]+)$/.exec(last_arg)[1]
        };
        handleVideoFile(fileModel);
    });
}

gui.App.on('open', function (cmd) {
    var file;
    if (os.platform() === 'win32') {
        file = cmd.split('"');
        file = file[file.length - 2];
    } else {
        file = cmd.split(' /');
        file = file[file.length - 1];
        file = '/' + file;
    }

    if (file) {
        win.debug('File loaded:', file);

        if (isVideo(file)) {
            var fileModel = {
                path: file,
                name: /([^\\]+)$/.exec(file)[1]
            };
            handleVideoFile(fileModel);
        } else if (file.endsWith('.torrent')) {
            handleTorrent(file);
        }
    }
});

// When win.focus() doesn't do it's job right, play dirty.
App.vent.on('window:focus', function () {
    win.setAlwaysOnTop(true);
    win.focus();
    win.setAlwaysOnTop(Settings.alwaysOnTop);
});

// -f argument to open in fullscreen
if (gui.App.fullArgv.indexOf('-f') !== -1) {
    win.enterFullscreen();
}
// -m argument to open minimized to tray
if (gui.App.fullArgv.indexOf('-m') !== -1) {
    App.vent.on('app:started', function () {
        minimizeToTray();
    });
}

// On uncaught exceptions, log to console.
process.on('uncaughtException', function (err) {
    try {
        if (err.message.indexOf('[sprintf]') !== -1) {
            var currentLocale = App.Localization.langcodes[i18n.getLocale()].nativeName;
            AdvSettings.set('language', 'en');
            i18n.setLocale('en');
            App.vent.trigger('movies:list');
            $('.notification_alert').show().html('An error occured with the localization in ' + currentLocale).delay(4000).fadeOut(400);
        }
    } catch (e) {}
    win.error(err, err.stack);
});
