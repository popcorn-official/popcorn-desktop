    var 
    Settings = [],
    os = require('os'),
    path = require('path');
    
    // default settings
    Settings.updateApiEndpoint = 'http://get-popcorn.com/';
    
    // TODO: Buy SSL for main domain + buy domain get-popcorn.re for fallback
    //Settings['updateApiEndpointMirror'] = 'https://get-popcorn.re/';

    Settings.yifyApiEndpoint = 'https://yts.re/api/';
    Settings.yifyApiEndpointMirror = 'https://yts.im/api/';

    // default tvshow api endpoint
    Settings.tvshowApiEndpoint = 'http://eztvapi.re/';

    Settings.connectionCheckUrl = 'http://google.com/';
    Settings.moviesShowQuality = false;
	
    Settings.subtitle_size = '28px';
	
    Settings.movies_quality = 'all';

    Settings.connectionLimit = 100;
    Settings.dhtLimit = 10000;
    Settings.tmpLocation = path.join(os.tmpDir(), 'Popcorn-Time');
    Settings.deleteTmpOnClose = true;

    // app Settings
    Settings.version = false;
    Settings.dbversion = '0.1.0';
    Settings.language = false;
    Settings.subtitle_language = 'none'; // none by default
    Settings.font = 'tahoma';

    var AdvSettings = {

            get: function(variable) {
                if (typeof Settings[variable] !== 'undefined') {
                    return Settings[variable];
                } else {
                    return false;
                }
            },

            set: function(variable, newValue) {

                Database.writeSetting({key: variable, value: newValue}, function() {
                    Settings[variable] = newValue;
                });
            },

            setup : function(callback) {
                AdvSettings.performUpgrade();
                AdvSettings.getHardwareInfo(function(err, data) {
                    callback();
                });
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
                        callback();
                    break;
                    case 'win32':
                        AdvSettings.set('os', 'windows');
                        callback();
                    break;
                    case 'linux':
                        AdvSettings.set('os', 'linux');
                        callback();
                    break;
                    default:
                        AdvSettings.set('os', 'unknown');
                        callback();
                    break;
                }
            },

            checkApiEndpoint: function(allApis, callback) {
                var tls = require('tls'),
                  URI = require('URIjs');


                // TODO: Did we want to check api SSL at EACH load ?
                // Default timeout of 120 ms

                var numCompletedCalls = 0;
                for(var apiCheck in allApis) {
                    
                    numCompletedCalls++;
                    apiCheck = allApis[apiCheck];
                    
                    var hostname = URI(AdvSettings.get(apiCheck.original)).hostname();

                    tls.connect(443, hostname, {
                        servername: hostname,
                        rejectUnauthorized: false
                    }, function() {
                        if(this.authorized && !this.authorizationError) {
                            var cert = this.getPeerCertificate();
                            if(cert.fingerprint !== apiCheck.fingerprint) {
                                // "These are not the certificates you're looking for..."
                                // Seems like they even got a certificate signed for us :O
                                Settings[apiCheck.original] = Settings[apiCheck.mirror];
                                this.end();
                                if (numCompletedCalls === allApis.length) {
                                    callback();
                                }
                            } else {
                                // Valid Certificate! YAY - Not blocked!
                                this.end();
                                if (numCompletedCalls === allApis.length) {
                                    callback();
                                }
                            }
                        } else {
                            // Not a valid SSL certificate... mhmmm right, this is not it, use a mirror
                            Settings[apiCheck.original] = Settings[apiCheck.mirror];
                            this.end();
                            if (numCompletedCalls === allApis.length) {
                                callback();
                            }
                        }
                    }).on('error', function() {
                        // No SSL support. That's convincing >.<
                        Settings[apiCheck.original] = Settings[apiCheck.mirror];
                        this.end();
                        if (numCompletedCalls === allApis.length) {
                            callback();
                        }
                    });
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

