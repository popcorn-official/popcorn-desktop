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

    // Localization support
    Language = require('./language/' + 'en' + '.json'),

    // TMP Folder
    tmpFolder = path.join(os.tmpDir(), 'Popcorn-Time');


var config = {
    "version": "0.1.0",
    // Used to check for the latest version
    "updateNotificationUrl": "http://getpopcornti.me/update.json",
    // Used to check if there's an internet connection
    "connectionCheckUrl": "http://www.google.com",
    // YIFY Endpoint
    "yifyApiEndpoint": "http://yify-torrents.com/api/",
    // A mirror for YIFY (for users in the UK -Yify is blocked there-)
    "yifyApiEndpointMirrors": ["http://yify.unlocktorrent.com/api/"]
};


// Create the Temp Folder
if( ! fs.existsSync(tmpFolder) ) { fs.mkdirSync(tmpFolder); }


// Detect the language and update the global Language file
var detectLanguage = function(preferred) {

	var fs = require('fs');
	var bestLanguage = navigator.language.slice(0,2);

	if( fs.existsSync('./language/' + bestLanguage + '.json') ) {
		Language = require('./language/' + bestLanguage + '.json');
	} else {
		Language = require('./language/' + preferred + '.json');
	}

	// This is a hack to translate non-templated UI elements. Fuck it.
	$('[data-translate]').each(function(){
		var $el = $(this);
		var key = $el.data('translate');

		if( $el.is('input') ) {
			$el.attr('placeholder', Language[key]);
		} else {
			$el.text(Language[key]);
		}
	});

	populateCategories();
};


// Populate the Category list (This should be a template, though)
var populateCategories = function() {
	var category_html = '';
	var defaultCategory = 'all';

	for( key in Language.genres ) {
		category_html += '<li'+ (defaultCategory == key ? ' class="active" ' : '') +'>'+
				           '<a href="#" data-genre="'+key+'">'+Language.genres[key]+'</a>'+
				         '</li>';
	}

	jQuery('#catalog-select .categories').html(category_html);
};

detectLanguage('en');



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


// Prompting before quitting
win.on('close', function() {
    if (confirm(Language.beforeQuit)) {
        this.close(true);
    }
});


// Cancel all new windows (Middle clicks / New Tab)
win.on('new-win-policy', function (frame, url, policy) {
    policy.ignore();
});


// Prevent dropping files into the window
window.addEventListener("dragover",function(e){
  	e = e || event;
  	e.preventDefault();
},false);
window.addEventListener("drop",function(e){
  	e = e || event;
  	e.preventDefault();
},false);


// Check if the user has a working internet connection (uses Google as reference)
var checkInternetConnection = function(callback) {
    var http = require('http');

    http.get(config.connectionCheckUrl, function(res){
        if( res.statusCode == 200 || res.statusCode == 302 || res.statusCode == 301 ) {
            config.hasInternetConnection = true;
        } else {
            config.hasInternetConnection = false;
        }
        typeof callback == 'function' ? callback(config.hasInternetConnection) : null;
    });
};


// Detect the operating system of the user
var getOperatingSystem = function() {
    var os = require('os');
    var platform = os.platform();

    if( platform == 'win32' || platform == 'win64' ) {
        return 'windows';
    }
    if( platform == 'darwin' ) {
        return 'mac';
    }
    if( platform == 'linux' ) {
        return 'linux';
    }
    return null;
};


// Check if there's a newer version and shows a prompt if that's the case
var checkForUpdates = function() {
    var http = require('http');

    var currentOs = getOperatingSystem();
    // We may want to change this in case the detection fails
    if( ! currentOs ){ return; }

    http.get(config.updateNotificationUrl, function(res){
        var data = '';
        res.on('data', function(chunk){ data += chunk; });

        res.on('end', function(){
            try {
                var updateInfo = JSON.parse(data);
            } catch(e){ return; }

            if( ! updateInfo ){ return; }

            if( updateInfo[currentOs].version > config.version ) {
                // Check if there's a newer version and show the update notification
                $('#notification').html(
                    'Popcorn Time '+ updateInfo[currentOs].versionName + Language.UpgradeVersionDescription +
                    '<a class="btn" href="#" onclick="gui.Shell.openExternal(\'' + updateInfo[currentOs].downloadUrl + '\');"> '+ Language.UpgradeVersion + '</a>'
                );
                $('body').addClass('has-notification');
            }
        });

    })
};

checkForUpdates();


// Taken from peerflix `app.js`
var peerflix = require('peerflix');
var videoPeerflix = null;
var playTorrent = window.playTorrent = function (torrent, subs, callback, progressCallback) {

    videoPeerflix ? $(document).trigger('videoExit') : null;

    // Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
    var tmpFilename = ( torrent.toLowerCase().split('/').pop().split('.torrent').shift() ).slice(0,100);
    tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_')+'-'+ (new Date()*1) +'.mp4';
    var tmpFile = path.join(tmpFolder, tmpFilename);

    var numCores = (os.cpus().length > 0) ? os.cpus().length : 1;
    var numConnections = 100;

    // Start Peerflix
    videoPeerflix = peerflix(torrent, {
        // Set the custom temp file
        path: tmpFile,
        //port: 554,
        buffer: (1.5 * 1024 * 1024).toString(),
        connections: numConnections
    }, function (err, flix) {
        if (err) throw err;

        var started = Date.now(),
            loadedTimeout;

        flix.server.on('listening', function () {
            var href = 'http://127.0.0.1:' + flix.server.address().port + '/';

            loadedTimeout ? clearTimeout(loadedTimeout) : null;

            var checkLoadingProgress = function () {

                var now = flix.downloaded,
                    total = flix.selected.length,
                    // There's a minimum size before we start playing the video.
                    // Some movies need quite a few frames to play properly, or else the user gets another (shittier) loading screen on the video player.
                    targetLoadedSize = MIN_SIZE_LOADED > total ? total : MIN_SIZE_LOADED,
                    targetLoadedPercent = MIN_PERCENTAGE_LOADED * total / 100.0,

                    targetLoaded = Math.max(targetLoadedPercent, targetLoadedSize),

                    percent = now / targetLoaded * 100.0;

                if (now > targetLoaded) {
                    if (typeof window.spawnCallback === 'function') {
                        window.spawnCallback(href, subs);
                    }
                    if (typeof callback === 'function') {
                        callback(href, subs);
                    }
                } else {
                    typeof progressCallback == 'function' ? progressCallback( percent, now, total) : null;
                    loadedTimeout = setTimeout(checkLoadingProgress, 500);
                }
            };
            checkLoadingProgress();


            $(document).on('videoExit', function() {
                if (loadedTimeout) { clearTimeout(loadedTimeout); }

                // Stop processes
                flix.clearCache();
                flix.destroy();
                videoPeerflix = null;

                // Unbind the event handler
                $(document).off('videoExit');

                delete flix;
            });
        });
    });

};

// Enable tooltips
$('body').tooltip({
    selector: "*[data-toggle^='tooltip']"
});


/**
 * Show 404 page on uncaughtException
 */

process.on('uncaughtException', function(err) {
  console.log(err);
});
