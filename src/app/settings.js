    var
    Settings = {},
    os = require('os'),
    path = require('path');

    /** Default settings **/

    // User interface
    Settings.language = 'en';

    // Movies
    Settings.moviesShowQuality = false;
    Settings.movies_quality = 'all';
    Settings.tvHighQuality = false;

    // Subtitles
    Settings.subtitle_language = 'none';
    Settings.subtitle_size = '28px';

    // More options
    Settings.tvshowApiEndpoint = 'http://eztvapi.re/';

    // Advanced options
    Settings.connectionLimit = 100;
    Settings.dhtLimit = 1000;
    Settings.tmpLocation = path.join(os.tmpDir(), 'Popcorn-Time');
    Settings.deleteTmpOnClose = true;

    // Hidden endpoints
    Settings.updateApiEndpoint = 'http://get-popcorn.com/';
    /* TODO: Buy SSL for main domain + buy domain get-popcorn.re for fallback
    Settings.updateApiEndpointMirror = 'https://get-popcorn.re/'; */
    Settings.yifyApiEndpoint = 'https://yts.re/api/';
    Settings.yifyApiEndpointMirror = 'https://yts.im/api/';
    Settings.connectionCheckUrl = 'http://google.com/';

    // App Settings
    Settings.version = false;
    Settings.dbversion = '0.1.0';
    Settings.font = 'tahoma';

    var AdvSettings = {

            get: function(variable) {
                if (typeof Settings[variable] !== 'undefined') {
                    return Settings[variable];
                }

                return false;
            },

            set: function(variable, newValue) {
                Database.writeSetting({key: variable, value: newValue}, function() {
                    Settings[variable] = newValue;
                });
            },

            setup : function(callback) {
                AdvSettings.performUpgrade();
                AdvSettings.getHardwareInfo(callback);
            },

            getHardwareInfo: function(callback) {
                if(/64/.test(process.arch)) {
                    AdvSettings.set('arch', 'x64');
                } else {
                    AdvSettings.set('arch', 'x86');
                }

                switch(process.platform) {
                    case 'darwin':
                        AdvSettings.set('os', 'mac');
                    break;
                    case 'win32':
                        AdvSettings.set('os', 'windows');
                    break;
                    case 'linux':
                        AdvSettings.set('os', 'linux');
                    break;
                    default:
                        AdvSettings.set('os', 'unknown');
                    break;
                }

                callback();
            },

            checkApiEndpoint: function(allApis, callback) {
                var tls = require('tls'),
                    URI = require('URIjs');

                // TODO: Did we want to check api SSL at EACH load ?
                // Default timeout of 120 ms

                var numCompletedCalls = 0;
                for (var apiCheck in allApis) {
                    numCompletedCalls++;
                    apiCheck = allApis[apiCheck];

                    var hostname = URI(AdvSettings.get(apiCheck.original)).hostname();

                    tls.connect(443, hostname, {
                        servername: hostname,
                        rejectUnauthorized: false
                    }, function() {
                        if (!this.authorized
                          || this.authorizationError
                          || this.getPeerCertificate().fingerprint !== apiCheck.fingerprint) {
                            // "These are not the certificates you're looking for..."
                            // Seems like they even got a certificate signed for us :O
                            Settings[apiCheck.original] = Settings[apiCheck.mirror];
                        }

                        this.end();
                        if (numCompletedCalls === allApis.length) {
                            callback();
                        }
                    }).on('error', function() {
                        // No SSL support. That's convincing >.<
                        Settings[apiCheck.original] = Settings[apiCheck.mirror];

                        this.end();
                        if (numCompletedCalls === allApis.length) {
                            callback();
                        }
                    }).on('timeout', function() {
                        // Connection timed out, we'll say its not available
                        Settings[apiCheck.original] = Settings[apiCheck.mirror];
                        this.end();
                        if (numCompletedCalls === allApis.length) {
                            callback();
                        }
                    }).setTimeout(10000); // Set 10 second timeout
                }
            },

            performUpgrade: function() {
                // This gives the official version (the package.json one)
                gui = require('nw.gui');
                var currentVersion = gui.App.manifest.version;

                if( currentVersion !== AdvSettings.get('version') ) {
                    // Nuke the DB if there's a newer version
                    // Todo: Make this nicer so we don't lose all the cached data
                    var cacheDb = openDatabase('cachedb', '', 'Cache database', 50 * 1024 * 1024);

                    cacheDb.transaction(function (tx) {
                        tx.executeSql('DELETE FROM subtitle');
                        tx.executeSql('DELETE FROM metadata');
                    });


                    // Add an upgrade flag
                    window.__isUpgradeInstall = true;
                }

                AdvSettings.set('version', currentVersion);
            },
    };
