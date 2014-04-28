
    var Settings = [];

    // customer settings
    Settings['popcornApiEndpoint'] = ["popcorn-api.com","popcorn-api.net"];
    Settings['updateNotificationUrl'] = '/update.json';
    Settings['connectionCheckUrl'] = 'http://google.com/';
    Settings['yifyApiEndpoint'] = 'https://yts.re/api/';
    Settings['yifyApiEndpointMirror'] = 'https://yts.im/api/';

    // app settings
    Settings['version'] = false;
    Settings['dbversion'] = '0.1.0';
    Settings['language'] = 'en';
    Settings['font'] = 'tahoma';

    var AdvSettings = {

            get: function(variable) {
                if (typeof Settings[variable] != 'undefine')
                    return Settings[variable];
                else return false;
            },

            set: function(variable, newValue) {

                Database.writeSetting({key: variable, value: newValue}, function() {
                    Settings[variable] = newValue;
                });
            },

            setup : function() {
                AdvSettings.getHardwareInfo();
                AdvSettings.performUpgrade();
            },

            getHardwareInfo: function() {
                if(/64/.test(process.arch))
                    AdvSettings.set('arch', 'x64');
                else
                    AdvSettings.set('arch', 'x86');

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
            },

            checkApiEndpoint: function() {
                var tls = require('tls')
                  , URI = require('URIjs');

                var hostname = URI(AdvSettings.get('yifyApiEndpoint')).hostname();

                tls.connect(443, hostname, {
                    servername: hostname,
                    rejectUnauthorized: false
                }, function() {
                    if(this.authorized && !this.authorizationError) {
                        var cert = this.getPeerCertificate();
                        if(cert.fingerprint != 'D4:7B:8A:2A:7B:E1:AA:40:C5:7E:53:DB:1B:0F:4F:6A:0B:AA:2C:6C') {
                            // "These are not the certificates you're looking for..."
                            // Seems like they even got a certificate signed for us :O
                            AdvSettings.set('yifyApiEndpoint', AdvSettings.get('yifyApiEndpointMirror'));
                            AdvSettings.set('checkedApiEndpoint', true);
                            this.end();
                        } else {
                            // Valid Certificate! YAY - Not blocked!
                            AdvSettings.set('checkedApiEndpoint', true);
                            this.end();
                        }
                    } else {
                        // Not a valid SSL certificate... mhmmm right, this is totz yts.re!
                        AdvSettings.set('yifyApiEndpoint', AdvSettings.get('yifyApiEndpointMirror'));
                        AdvSettings.set('checkedApiEndpoint', true);
                        this.end();
                    }
                }).on('error', function() {
                    // No SSL support. That's convincing >.<
                    AdvSettings.set('yifyApiEndpoint', AdvSettings.get('yifyApiEndpointMirror'));
                    AdvSettings.set('checkedApiEndpoint', true);
                    this.end();
                });
            },

            performUpgrade: function() {
                // This gives the official version (the package.json one)
                gui = require('nw.gui');
                var currentVersion = gui.App.manifest.version;

                if( currentVersion != AdvSettings.get('version') ) {
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

    // we build our settings array
    Database.getSettings(function(err, data) {
        
        if (data != null) {
            for(var key in data) {
                Settings[data[key].key] = data[key].value;
            }
        }

        // new install?    
        if( typeof Settings.version == false ) {
            window.__isNewInstall = true;
        };

        if(AdvSettings.get('checkedApiEndpoint') != 'true') {
            AdvSettings.checkApiEndpoint();
        }

        // we set it if we want to use it in our app later
        // we have some cool function who can be used
        AdvSettings.setup();

    }); 

