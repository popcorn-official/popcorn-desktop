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

App.addRegions({ Window: ".main-window-region" });

App.addInitializer(function(options){
    var mainWindow = new App.View.MainWindow();
    try{
        App.Window.show(mainWindow);
    } catch(e) {
        console.error("Couldn't start app: ", e, e.stack);
    }
});

App.vent.on('error', function(err) {
    window.alert('Error: ' + err);
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

    // Special Debug Console Calls!
    console.logger = {};
    console.logger.log = console.log.bind(console);
    console.logger.debug = function() {
        var params = Array.prototype.slice.call(arguments, 1);
        params.unshift('%c[%cDEBUG%c] ' + arguments[0], 'color: black;', 'color: #00eb76;', 'color: black;');
        console.debug.apply(console, params);
    }
    console.logger.info = function() {
        var params = Array.prototype.slice.call(arguments, 1);
        params.unshift('[%cINFO%c] ' + arguments[0], 'color: blue;', 'color: black;');
        console.info.apply(console, params);
    }
    console.logger.warn = function() {
        var params = Array.prototype.slice.call(arguments, 1);
        params.unshift('[%cWARNING%c] ' + arguments[0], 'color: #ffc000;', 'color: black;');
        console.warn.apply(console, params);
    }
    console.logger.error = function() {
        var params = Array.prototype.slice.call(arguments, 1);
        params.unshift('%c[%cERROR%c] ' + arguments[0], 'color: black;', 'color: #ff1500;', 'color: black;');
        console.error.apply(console, params);
    }

}
else
{

    console.log = function() {};
    console.time = console.timeEnd = function() {};
    console.logger = {};
    console.logger.log = function() {};
    console.logger.debug = console.logger.log;
    console.logger.info = console.logger.log;
    console.logger.warn = console.logger.log;
    console.logger.error = console.logger.log;
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


/**
 * Show 404 page on uncaughtException
 */
process.on('uncaughtException', function(err) {
    window.console.error(err, err.stack);
});

