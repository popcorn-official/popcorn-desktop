// Special Debug Console Calls!
win.log = console.log.bind(console);
win.debug = function () {
  var params = Array.prototype.slice.call(arguments, 1);
  params.unshift(
    '%c[%cDEBUG%c] %c' + arguments[0],
    'color: black;',
    'color: green;',
    'color: black;',
    'color: blue;'
  );
  console.debug.apply(console, params);
};
win.info = function () {
  var params = Array.prototype.slice.call(arguments, 1);
  params.unshift('[%cINFO%c] ' + arguments[0], 'color: blue;', 'color: black;');
  console.info.apply(console, params);
};
win.warn = function () {
  var params = Array.prototype.slice.call(arguments, 1);
  params.unshift(
    '[%cWARNING%c] ' + arguments[0],
    'color: orange;',
    'color: black;'
  );
  console.warn.apply(console, params);
};
win.error = function () {
  var params = Array.prototype.slice.call(arguments, 1);
  params.unshift(
    '%c[%cERROR%c] ' + arguments[0],
    'color: black;',
    'color: red;',
    'color: black;'
  );
  console.error.apply(console, params);
  fs.appendFileSync(
    path.join(data_path, 'logs.txt'),
    '\n\n' + (arguments[0].stack || arguments[0])
  ); // log errors;
};

if (nw.App.fullArgv.indexOf('--reset') !== -1) {
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
var App = new Marionette.Application({
  region: '.main-window-region'
});
_.extend(App, {
  Controller: {},
  View: {},
  Model: {},
  Page: {},
  Scrapers: {},
  Providers: {},
  Localization: {}
});

// Create old v2 style vent
App.vent = Backbone.Radio.channel('v2-vent');

// set database
App.db = Database;

// Set settings
App.advsettings = AdvSettings;
App.settings = Settings;
App.WebTorrent = new WebTorrent({
  maxConns     : parseInt(Settings.connectionLimit, 10) || 55,
  downloadLimit: parseInt(parseFloat(Settings.downloadLimit, 10) * parseInt(Settings.maxLimitMult, 10)) || -1,
  uploadLimit  : parseInt(parseFloat(Settings.uploadLimit, 10) * parseInt(Settings.maxLimitMult, 10)) || -1,
  dht          : { concurrency: parseInt(Settings.maxUdpReqLimit, 10) || 16 },
  secure       : Settings.protocolEncryption || false,
  tracker      : {
    announce: Settings.trackers.forced
  }
});

App.plugins = {};

fs.readFile('./git.json', 'utf8', function (err, json) {
  if (!err) {
    App.git = JSON.parse(json);
  }
});

// Menu for mac
if (os.platform() === 'darwin') {
  var nativeMenuBar = new nw.Menu({
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

App.onBeforeStart = function (options) {
  // this is the 'do things with resolutions and size initializer
  var zoom = 0;

  var screen = window.screen;

  var width = parseInt(
    localStorage.width ? localStorage.width : Settings.defaultWidth
  );
  var height = parseInt(
    localStorage.height ? localStorage.height : Settings.defaultHeight
  );
  var x = parseInt(localStorage.posX ? localStorage.posX : -1);
  var y = parseInt(localStorage.posY ? localStorage.posY : -1);

  // reset app width when the width is bigger than the available width
  if (screen.availWidth < width) {
    width = screen.availWidth;
  }

  // reset app height when the width is bigger than the available height
  if (screen.availHeight < height) {
    height = screen.availHeight;
  }

  // reset x when the screen width is smaller than the window x-position + the window width
  if (x < 0 || x + width > screen.width) {
    x = Math.round((screen.availWidth - width) / 2);
  }

  // reset y when the screen height is smaller than the window y-position + the window height
  if (y < 0 || y + height > screen.height) {
    y = Math.round((screen.availHeight - height) / 2);
  }

  win.zoomLevel = zoom;
  win.resizeTo(width, height);
  win.moveTo(x, y);
};

var initTemplates = function () {
  // Load in external templates
  var ts = [];

  _.each(document.querySelectorAll('[type="text/x-template"]'), function (el) {
    ts.push(new Promise((resolve, reject) => {
      $.get(el.src, function (res) {
        el.innerHTML = res;
        resolve(true);
      });
    }));
  });

  return Promise.all(ts);
};

var initApp = function () {
  var mainWindow = new App.View.MainWindow();
  win.show();

  try {
    App.showView(mainWindow);
  } catch (e) {
    win.error('Couldn\'t start app: ', e, e.stack);
  }

  if (localStorage.maximized === 'true') {
    win.maximize();
  }
};

App.onStart = function (options) {
  initTemplates().then(initApp);
};

var deleteFolder = function (folderPath) {
  if (typeof folderPath !== 'string') {
    return;
  }

  var files = [];
  if (fs.existsSync(folderPath)) {
    files = fs.readdirSync(folderPath);
    files.forEach(function (file) {
      var curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

var deleteCookies = function () {
  function removeCookie(cookie) {
    var lurl =
      'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
    win.cookies.remove(
      {
        url: lurl,
        name: cookie.name
      },
      function (result) {
        if (result) {
          if (!result.name) {
            result = result[0];
          }
        } else {
          win.error('cookie removal failed');
        }
      }
    );
  }

  win.cookies.getAll({}, function (cookies) {
    if (cookies.length > 0) {
      for (var i = 0; i < cookies.length; i++) {
        removeCookie(cookies[i]);
      }
    }
  });
};

var deleteLogs = function() {
  var dataPath = path.join(data_path, 'logs.txt');
  if (fs.existsSync(dataPath)) {
    fs.unlinkSync(dataPath);
  }
};

var posterZoom = function () {
  var zoom = $('.show-detail-container').height() / $('.shp-img').height() * (0.75 + Settings.bigPicture / 2000);
  var top = parseInt(($('.shp-img').height() * zoom - $('.shp-img').height()) / 2 + (3000 / Settings.bigPicture)) + 'px';
  var left = parseInt(($('.shp-img').width() * zoom - $('.shp-img').width()) / 2 + (2000 / Settings.bigPicture)) + 'px';
  $('.sh-poster.active').css({transform: 'scale(' + zoom + ')', top: top, left: left});
};

win.on('resize', function (width, height) {
  localStorage.width = Math.round(width);
  localStorage.height = Math.round(height);
  $('.sh-poster').hasClass('active') ? posterZoom() : null;
});

win.on('move', function (x, y) {
  localStorage.posX = Math.round(x);
  localStorage.posY = Math.round(y);
});

win.on('enter-fullscreen', function () {
  App.vent.trigger('window:focus');
  if (!Settings.nativeWindowFrame && parseFloat(process.versions['node-webkit'].replace('0.', '')) <= 50) {
    win.setResizable(false);
  }
});

win.on('leave-fullscreen', function () {
  if (!Settings.nativeWindowFrame && parseFloat(process.versions['node-webkit'].replace('0.', '')) <= 50) {
    win.setResizable(true);
  }
});

win.on('maximize', function () {
  if (!Settings.nativeWindowFrame && parseFloat(process.versions['node-webkit'].replace('0.', '')) <= 50) {
    win.setResizable(false);
  }
  localStorage.maximized = true;
  $('.sh-poster').hasClass('active') ? posterZoom() : null;
});

win.on('restore', function () {
  if (!Settings.nativeWindowFrame && parseFloat(process.versions['node-webkit'].replace('0.', '')) <= 50) {
    win.setResizable(true);
  }
  localStorage.maximized = false;
  $('.sh-poster').hasClass('active') ? posterZoom() : null;
});

// Now this function is used via global keys (cmd+q and alt+f4)
function close() {
  win.hide();

  // If the WebTorrent is destroyed, that means the user has already clicked the close button.
  // Try to let the WebTorrent destroy from that closure. Even if it fails, the window will close.
  if (App.WebTorrent.destroyed) {
    return;
  }

  // For some reason, WebTorrent does not have a standard way of passing back errors from destroy()
  // some errors are thrown from the method, some are sent in the callback, and it seems that there
  // is a possibility for some to be emitted. In order to ensure that we always close the client,
  // these are all aggregated into a single callback.
  var destroyWebTorrentAndPerformCleanup = function (cb) {
    var onError;
    var cleanup = function () {
      App.WebTorrent.removeListener('error', onError);
    };
    // js hint doesn't allow us to use cleanup before it is defined,
    // even though we know it will be when this function is called.
    onError = function (err) {
      cleanup();
      cb(err);
    };
    try {
      App.WebTorrent.once('error', onError);
      App.WebTorrent.destroy(function (err) {
        try {
          if (err) {
            return onError(err);
          }
          if (App.settings.deleteTmpOnClose) {
            deleteFolder(App.settings.tmpLocation);
          }
          if (App.settings.separateDownloadsDir && !App.settings.continueSeedingOnStart) {
            deleteFolder(App.settings.downloadsLocation + '/TorrentCache/');
          }
          deleteLogs();
          win.close(true);
        } catch (err) {
          return onError(err);
        }
        cb(null);
      });
    } catch (err) {
      onError(err);
    }
  };

  destroyWebTorrentAndPerformCleanup(function(err) {
    if (err) {
      win.error(err);
    }
    // we always want to close the window if the user has asked for it to be closed.
    // regardless of whether any error is present, win.close should be called
    win.close(true);
  });
}

// Wipe the tmpFolder when closing the app (this frees up disk space)
win.on('close', function () {
  close();
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
// Correct closing of the window using 'CMD+Q' on macOS
Mousetrap.bindGlobal(['alt+f4', 'command+q'], function (e) {
  close();
});
// Developer Shortcuts
Mousetrap.bindGlobal(['shift+f12', 'f12', 'command+0'], function (e) {
  win.showDevTools();
});
Mousetrap.bindGlobal(['shift+f10', 'f10', 'command+9'], function (e) {
  App.settings.os === 'windows' ? nw.Shell.openExternal(App.settings.tmpLocation) : nw.Shell.openItem(App.settings.tmpLocation);
});
Mousetrap.bind('t', function (e) {
  App.settings.os === 'windows' ? nw.Shell.openExternal(App.settings.tmpLocation) : nw.Shell.openItem(App.settings.tmpLocation);
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
Mousetrap.bind(
  'shift+up shift+up shift+down shift+down shift+left shift+right shift+left shift+right shift+b shift+a',
  function () {
    var body = $('body');

    if (body.hasClass('knm')) {
      body.removeClass('knm');
    } else {
      body.addClass('knm');
    }
  },
  'keydown'
);
Mousetrap.bindGlobal(
  ['command+ctrl+f', 'ctrl+alt+f'],
  function (e) {
    e.preventDefault();
    win.toggleFullscreen();
  },
  'keydown'
);

// Drag n' Drop Torrent Onto PT Window to start playing (ALPHA)
window.ondragenter = function (e) {
  var mask = $('#drop-mask');
  var showDrag = true;
  var timeout = -1;
  mask.show();
  mask.on('dragenter', function (e) {
    $('.drop-indicator').show();
  });
  mask.on('dragover', function (e) {
    var showDrag = true;
  });

  mask.on('dragleave', function (e) {
    var showDrag = false;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      if (!showDrag) {
        $('.drop-indicator').hide();
        $('#drop-mask').hide();
      }
    }, 100);
  });
};

var minimizeToTray = function () {
  win.hide();
  win.isTray = true;

  var tray = new nw.Tray({
    title: Settings.projectName,
    icon: 'src/app/images/icon.png'
  });

  var openFromTray = function () {
    win.show();
    if (localStorage.maximized === 'true') {
      win.maximize();
    }
    tray.remove();
    win.isTray = false;
  };

  tray.tooltip = Settings.projectName;

  var menu = new nw.Menu();
  menu.append(
    new nw.MenuItem({
      type: 'normal',
      label: i18n.__('Restore'),
      click: function () {
        openFromTray();
      }
    })
  );
  menu.append(
    new nw.MenuItem({
      type: 'normal',
      label: i18n.__('Close'),
      click: function () {
        win.close();
      }
    })
  );

  tray.menu = menu;

  tray.on('click', function () {
    openFromTray();
  });

  nw.App.on('open', function (cmd) {
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
  var vjsPlayer = document.getElementById('video_player');
  if (vjsPlayer) {
    videojs(vjsPlayer).dispose();
  }
  App.vent.trigger('settings:close');
  App.vent.trigger('about:close');
  App.vent.trigger('keyboard:close');
  App.vent.trigger('stream:stop');
  App.vent.trigger('player:close');
  App.vent.trigger('torrentcache:stop');
  App.vent.trigger('preload:stop');
  $('.spinner').show();

  // look for local subtitles
  var checkSubs = function () {
    var _dir = file.path.replace(/\\/g, '/');
    _dir = _dir.substr(0, _dir.lastIndexOf('/'));
    var _ext = path.extname(file.name);
    var _filename = file.name.replace(_ext, '');
    var found = null;
    fs.readdirSync(_dir).forEach(file => {
      if (file.includes(_filename) && file.endsWith('.srt')) {
        return found = { local: path.join(_dir, file) };
      }
    });
    return found;
  };

  // get subtitles from provider
  var getSubtitles = function (subdata) {
    return new Promise(function (resolve, reject) {

      var subtitleProvider = App.Config.getProviderForType('subtitle');

      subtitleProvider
        .fetch(subdata)
        .then(function (subs) {
          if (subs && Object.keys(subs).length > 0) {
            win.info(Object.keys(subs).length + ' subtitles found');
            resolve(subs);
          } else {
            if (Settings.subtitle_language !== 'none') {
              App.vent.trigger(
                'notification:show',
                new App.Model.Notification({
                  title: i18n.__('No subtitles found'),
                  body: i18n.__(
                    'Try again later or drop a subtitle in the player'
                  ),
                  showRestart: false,
                  type: 'warning',
                  autoclose: true
                })
              );
            }
            reject(new Error('No subtitles returned'));
          }
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  // close the player if needed
  try {
    App.PlayerView.closePlayer();
  } catch (err) { }

  return new Promise(function (resolve, reject) {
    // init our objects
    var playObj = {
      src: 'file://' + path.join(file.path),
      type: 'video/mp4'
    };
    var sub_data = {
      filename: path.basename(file.path),
      path: file.path
    };

    App.Trakt.client.matcher
      .match({
        path: file.path
      })
      .then(function (res) {
        return App.Trakt.client.images.get(res[res.type]).then(function (img) {
          switch (res.quality) {
            case 'SD':
              res.quality = '480p';
              break;
            case 'HD':
              res.quality = '720p';
              break;
            case 'FHD':
              res.quality = '1080p';
              break;
            default:
          }
          switch (res.type) {
            case 'movie':
              playObj.title = res.movie.title;
              playObj.quality = res.quality;
              playObj.imdb_id = res.movie.ids.imdb;
              playObj.poster = img.poster;
              playObj.backdrop = img.background;
              playObj.year = res.movie.year;

              sub_data.imdbid = res.movie.ids.imdb;
              break;
            case 'episode':
              playObj.title =
                res.show.title +
                ' - ' +
                i18n.__('Season %s', res.episode.season) +
                ', ' +
                i18n.__('Episode %s', res.episode.number) +
                ' - ' +
                res.episode.title;
              playObj.quality = res.quality;
              playObj.season = res.episode.season;
              playObj.episode = res.episode.number;
              playObj.poster = img.poster;
              playObj.backdrop = img.background;
              playObj.tvdb_id = res.show.ids.tvdb;
              playObj.imdb_id = res.show.ids.imdb;
              playObj.episode_id = res.episode.ids.tvdb;

              sub_data.imdbid = res.show.ids.imdb;
              sub_data.season = res.episode.season;
              sub_data.episode = res.episode.number;
              break;
            default:
              throw new Error('trakt.matcher.match failed');
          }

          playObj.metadataCheckRequired = true;
          playObj.videoFile = file.path;

          // try to get subtitles for that movie/episode
          return getSubtitles(sub_data);
        });
      })
      .then(function (subtitles) {
        var localsub = checkSubs();
        if (localsub !== null) {
          subtitles = jQuery.extend({}, subtitles, localsub);
        }
        playObj.subtitle = subtitles;

        if (localsub !== null) {
          playObj.defaultSubtitle = 'local';
        } else {
          playObj.defaultSubtitle = Settings.subtitle_language;
        }
        resolve(playObj);
      })
      .catch(function (err) {
        var localsub = checkSubs();
        if (localsub !== null) {
          playObj.defaultSubtitle = 'local';
        } else {
          playObj.defaultSubtitle = Settings.subtitle_language;
        }

        if (!playObj.title) {
          playObj.title = file.name;
        }
        playObj.quality = false;
        playObj.videoFile = file.path;
        playObj.subtitle = localsub;

        resolve(playObj);
      });
  }).then(function (play) {
    $('.spinner').hide();

    var localVideo = new Backbone.Model(play); // streamer model

    win.info('Loading local file:', localVideo.get('videoFile') || localVideo.get('src'));

    const fileName = localVideo.get('src').replace(/\\/g, '/').split('/').pop();
    var torrentStart = new Backbone.Model({
      torrent: localVideo,
      title: fileName,
      defaultSubtitle: localVideo.defaultSubtitle || Settings.subtitle_language,
      device: App.Device.Collection.selected,
      video_file: {
        name: fileName,
        size: file.size,
        index: 0,
        path: localVideo.get('src')
      },
      files: [{
        name: fileName,
        size: file.size,
        index: 0,
        offset: 0,
        length: file.size,
        display: true,
        done: true,
        path: localVideo.get('src')
      }]
    });

    App.vent.trigger('stream:start', torrentStart, 'local');

    $('.eye-info-player, .maximize-icon #maxdllb').hide();
    $('.vjs-load-progress').css('width', '100%');
  });
};

var handleTorrent = function (torrent) {
  try {
    App.PlayerView.closePlayer();
  } catch (err) {
    // The player wasn't running
  }
  Settings.importedTorrent = true;
  App.Config.getProviderForType('torrentCache').resolve(torrent);
};

window.ondrop = function (e) {
  e.preventDefault();
  $('#drop-mask').hide();
  $('.drop-indicator').hide();

  var file = e.dataTransfer.files[0];
  var ext = path.extname((file || {}).name || '').toLowerCase();

  // TODO: Make a function 'isSubtitleFile' to avoid having many || everywhere
  if (
    (file != null && ext === '.torrent') ||
    ext === '.srt' ||
    ext === '.smi' ||
    ext === '.sami'
  ) {
    fs.writeFile(
      path.join(App.settings.tmpLocation, file.name),
      fs.readFileSync(file.path),
      function (err) {
        if (err) {
          App.PlayerView.closePlayer();
          window.alert(i18n.__('Error Loading File') + ': ' + err);
        } else {
          if (file.name.indexOf('.torrent') !== -1) {
            Settings.droppedTorrent = file.name;
            handleTorrent(path.join(App.settings.tmpLocation, file.name));
          } else if (ext === '.srt' || ext === '.smi' || ext === '.sami') {
            Settings.droppedSub = file.name;
            App.vent.trigger('videojs:drop_sub');
          }
        }
      }
    );
  } else if (file != null && isVideo(file.name)) {
    handleVideoFile(file);
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

// nwjs sdk flavor has an invasive context menu
$(document).on('contextmenu', function (e) {
  e.preventDefault();
});

// Pass magnet link as last argument to start stream
var last_arg = nw.App.argv.pop();

if (
  last_arg &&
  (last_arg.substring(0, 8) === 'magnet:?' ||
    last_arg.substring(0, 7) === 'http://' ||
    last_arg.substring(0, 8) === 'https://' ||
    last_arg.endsWith('.torrent'))
) {
  App.vent.on('app:started', function () {
    handleTorrent(last_arg);
  });
}

// Play local files
if (last_arg && isVideo(last_arg)) {
  App.vent.on('app:started', function () {
    var fileModel = {
      path: last_arg,
      name: /([^\\]+)$/.exec(last_arg)[1]
    };
    handleVideoFile(fileModel);
  });
}

nw.App.on('open', function (cmd) {
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
if (nw.App.fullArgv.indexOf('-f') !== -1) {
  win.enterFullscreen();
}
// -m argument to open minimized to tray
if (nw.App.fullArgv.indexOf('-m') !== -1) {
  App.vent.on('app:started', function () {
    minimizeToTray();
  });
}

// On uncaught exceptions, log to console.
process.on('uncaughtException', function (err) {
  try {
    if (err.message.indexOf('[sprintf]') !== -1) {
      var currentLocale =
        App.Localization.langcodes[i18n.getLocale()].nativeName;
      AdvSettings.set('language', 'en');
      i18n.setLocale('en');
      App.vent.trigger('movies:list');
      $('.notification_alert')
        .show()
        .html('An error occured with the localization in ' + currentLocale)
        .delay(4000)
        .fadeOut(400);
    }
  } catch (e) { }
  win.error(err, err.stack);
});
