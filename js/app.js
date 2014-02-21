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

    // Localization support
    Language = require('./language/' + 'en' + '.json');


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

// Prompting before quitting
win.on('close', function() {
    if (confirm(Language.beforeQuit)) {
        this.close(true);
    }
});


// Taken from peerflix `app.js`
var peerflix = require('peerflix');

var videoPeerflix = null;
var playTorrent = window.playTorrent = function (torrent, subs, callback, progressCallback) {

    videoPeerflix ? $(document).trigger('videoExit') : null;
    
    var path = require('path');
    var os = require('os');
    var fs = require('fs');
    
    // We use our own temp file, so we keep control over when it's created and deleted
    var tmpFolder = path.join(os.tmpDir(), 'Popcorn-Time');
    if( ! fs.existsSync(tmpFolder) ) { fs.mkdirSync(tmpFolder); }
    
    // Create a unique file to cache the video (with a microtimestamp) to prevent read conflicts
    var tmpFilename = ( torrent.toLowerCase().split('/').pop().split('.torrent').shift() ).slice(0,100);
    tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') +'-'+ (new Date()*1) +'.mp4';
    var tmpFile = path.join(tmpFolder, tmpFilename);

    var numCores = (os.cpus().length > 0) ? os.cpus().length : 1;
    var numConnections = numCores * 100;

    // Start Peerflix
    videoPeerflix = peerflix(torrent, {
        // Set the custom temp file
        path: tmpFile,
        port: 554,
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