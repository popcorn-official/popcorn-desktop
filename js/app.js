var
    // Minimum percentage to open video
    MIN_PERCENTAGE_LOADED = 0.5,

    // Minimum bytes loaded to open video
    MIN_SIZE_LOADED = 10 * 1024 * 1024,

    // Configuration variable
    applicationRoot = './',

    // Load native UI library
    gui = require('nw.gui'),

    // Debug flag
    isDebug = gui.App.argv.indexOf('--debug') > -1,

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

    // TMP Folder
    tmpFolder = path.join(os.tmpDir(), 'Popcorn-Time'),

    // i18n module (translations)
    i18n = require("i18n");

    isWin = (process.platform === 'win32');
    isLinux = (process.platform === 'linux');
    isOSX = (process.platform === 'darwin');

    BUTTON_ORDER = ['close', 'min', 'max'];

    if (isWin)   { BUTTON_ORDER = ['min', 'max', 'close']; }
    if (isLinux) { BUTTON_ORDER = ['min', 'max', 'close']; }
    if (isOSX)   { BUTTON_ORDER = ['close', 'min', 'max']; }

// Global App skeleton for backbone
var App = {
  Controller: {},
  View: {},
  Model: {},
  Page: {},
  Scrapers: {},
  Providers: {}
};


// render header buttons
$("#header").html(_.template($('#header-tpl').html(), {buttons: BUTTON_ORDER}));


// Create the System Temp Folder. This is used to store temporary data like movie files.
if( ! fs.existsSync(tmpFolder) ) { fs.mkdir(tmpFolder); }

var wipeTmpFolder = function() {
    if( typeof tmpFolder != 'string' ){ return; }
    fs.readdir(tmpFolder, function(err, files){
        for( var i in files ) {
            fs.unlink(tmpFolder+'/'+files[i]);
        }
    });
}

// Wipe the tmpFolder when closing the app (this frees up disk space)
win.on('close', function(){
    wipeTmpFolder();
    win.close(true);
});



String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


// Not debugging, hide all messages!
if (!isDebug) {
    console.log = function () {};
} else {
    // Developer Menu building
    var menubar = new gui.Menu({ type: 'menubar' }),
        developerSubmenu = new gui.Menu(),
        developerItem = new gui.MenuItem({
           label: 'Developer',
           submenu: developerSubmenu
        }),
        debugItem = new gui.MenuItem({
            label: 'Show developer tools',
            click: function () {
                win.showDevTools();
            }
        });
    menubar.append(developerItem);
    developerSubmenu.append(debugItem);
    win.menu = menubar;

    // Developer Shortcuts
    document.addEventListener('keydown', function(event){
        // F12 Opens DevTools
        if( event.keyCode == 123 ) { win.showDevTools(); }
        // F11 Reloads
        if( event.keyCode == 122 ) { win.reloadIgnoringCache(); }
    });
}


// Set the app title (for Windows mostly)
win.title = 'Popcorn Time';


// Focus the window when the app opens
win.focus();


// Cancel all new windows (Middle clicks / New Tab)
win.on('new-win-policy', function (frame, url, policy) {
    policy.ignore();
});


var preventDefault = function(e) {
    e.preventDefault();
}
// Prevent dropping files into the window
window.addEventListener("dragover", preventDefault, false);
window.addEventListener("drop", preventDefault, false);
// Prevent dragging files outside the window
window.addEventListener("dragstart", preventDefault, false);



// Show the disclaimer if the user hasn't accepted it yet.
if( ! Settings.get('disclaimerAccepted') ) {
    $('.popcorn-disclaimer').removeClass('hidden');

    $('.popcorn-disclaimer .btn.confirmation.continue').click(function(event){
        event.preventDefault();
        Settings.set('disclaimerAccepted', 1);
        $('.popcorn-disclaimer').addClass('hidden');
    });
    $('.popcorn-disclaimer .btn.confirmation.quit').click(function(event){
        event.preventDefault();

        // We need to give the tracker some time to send the event
        // Also, prevent multiple clicks
        if( $('.popcorn-disclaimer').hasClass('quitting') ){ return; }
        $('.popcorn-disclaimer').addClass('quitting');

        setTimeout(function(){
            gui.App.quit();
        }, 2000);
    });
}


/**
 * Show 404 page on uncaughtException
 */
process.on('uncaughtException', function(err) {
    if (console) {
        console.log(err);
    }
});



// TODO: I have no idea what this is
App.throttle = function(handler, time) {
  var throttle;
  time = time || 300;
  return function() {
    var args = arguments,
      context = this;
    clearTimeout(throttle);
    throttle = setTimeout(function() {
      handler.apply(context, args);
    }, time);
  };
};
