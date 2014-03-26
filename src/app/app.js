var
    // Minimum percentage to open video
    MIN_PERCENTAGE_LOADED = 0.5,

    // Minimum bytes loaded to open video
    MIN_SIZE_LOADED = 10 * 1024 * 1024,

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

// Global App skeleton for backbone
var App = App || {};
var App = _.defaults(App, {
  Controller: {},
  View: {},
  Model: {},
  Page: {},
  Scrapers: {},
  Providers: {},
  Localization: {}
});

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
};


if (isDebug) {
    // Developer Shortcuts
    document.addEventListener('keydown', function(event){
        // F12 Opens DevTools
        if( event.keyCode == 123 ) { win.showDevTools(); }
        // F11 Reloads
        if( event.keyCode == 122 ) { win.reloadIgnoringCache(); }
    });
}

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

$(window).load(function(){
    App.mainWindow = new App.View.MainWindow({
        el: $('body')
    });
    App.mainWindow.render();
});


/**
 * Show 404 page on uncaughtException
 */
process.on('uncaughtException', function(err) {
    if (console && console.logger) {
        console.logger.error(err, err.stack);
    }
});

