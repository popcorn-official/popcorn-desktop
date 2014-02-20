var

    // Minimum percentage to open video
    MIN_PERCENTAGE_LOADED = 0.5,

    // Configuration variable
    applicationRoot = './',

    // Load native UI library
    gui = require('nw.gui'),

    // Debug flag
    isDebug = gui.App.argv.indexOf('--debug') > -1,

    // browser window object
    win = gui.Window.get(),

    // Localization support
    Language = require(applicationRoot + '/language/' + 'en' + '.json');

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
var peerflix = require('peerflix'),
    clivas = require('clivas'),
    numeral = require('numeral'),
    child_process = require('child_process'),
    address = require('network-address');

var playTorrent = window.playTorrent = function (torrent, subs, callback, progressCallback) {
    peerflix(torrent, {}, function (err, flix) {
        if (err) throw err;

        var peers = flix.peers,
            server = flix.server,
            storage = flix.storage,
            speed = flix.speed,
            sw = flix.swarm,
            started = Date.now(),
            active = function (peer) {
                return !peer.peerChoking;
            },
            bytes = function (num) {
                return numeral(num).format('0.0b');
            },
            debug;

        flix.server.on('listening', function () {
            var href = 'http://' + address() + ':' + flix.server.address().port + '/',
                filename = storage.filename.split('/').pop().replace(/\{|\}/g, '');

            debug = isDebug && setInterval(function () {
                var unchoked = peers.filter(active),
                    runtime = Math.floor((Date.now() - started) / 1000);

                clivas.clear();
                clivas.line('{green:open} {bold:vlc} {green:and enter} {bold:'+href+'} {green:as the network address}');
                clivas.line('');
                clivas.line('{yellow:info} {green:streaming} {bold:'+filename+'} {green:-} {bold:'+bytes(speed())+'/s} {green:from} {bold:'+unchoked.length +'/'+peers.length+'} {green:peers}    ');
                clivas.line('{yellow:info} {green:downloaded} {bold:'+bytes(flix.downloaded)+'} {green:and uploaded }{bold:'+bytes(flix.uploaded)+'} {green:in }{bold:'+runtime+'s} {green:with} {bold:'+flix.resyncs+'} {green:resyncs}     ');
                clivas.line('{yellow:info} {green:found }{bold:'+sw.peersFound+'} {green:peers and} {bold:'+sw.nodesFound+'} {green:nodes through the dht}');
                clivas.line('{yellow:info} {green:peer queue size is} {bold:'+sw.queued+'}     ');
                clivas.line('{yellow:info} {green:target pieces are} {50+bold:'+(storage.missing.length ? storage.missing.slice(0, 10).join(' ') : '(none)')+'}    ');
                clivas.line('{80:}');

                peers.slice(0, 30).forEach(function(peer) {
                    var tags = [];
                    if (peer.peerChoking) tags.push('choked');
                    if (peer.peerPieces[storage.missing[0]]) tags.push('target');
                    clivas.line('{25+magenta:'+peer.id+'} {10:↓'+bytes(peer.downloaded)+'} {10+cyan:↓'+bytes(peer.speed())+'/s} {15+grey:'+tags.join(', ')+'}   ');
                });

                if (peers.length > 30) {
                    clivas.line('{80:}');
                    clivas.line('... and '+(peers.length-30)+' more     ');
                }

                clivas.line('{80:}');
                clivas.flush();
            }, 500);

            var loaded = function () {
                var now = flix.downloaded,
                    total = flix.selected.length,
                    percent = (now * 100 / total).toFixed(2);

                if (percent > MIN_PERCENTAGE_LOADED) {
                    if (typeof window.spawnCallback === 'function') {
                        window.spawnCallback(href, subs);
                    }
                    if (typeof callback === 'function') {
                        callback(href, subs);
                    }
                } else {
                    typeof progressCallback != 'undefined' ? progressCallback(percent / MIN_PERCENTAGE_LOADED * 100, now, total) : null;
                    setTimeout(loaded, 500);
                }
            };
            loaded();

            $(document).on('videoExit', function() {
                // Empty clivas debugging
                if (isDebug && debug) {
                    clearInterval(debug);
                }

                clivas.clear();
                clivas.flush();

                // Stop processes
                flix.destroy();
            });
        });
    });
};