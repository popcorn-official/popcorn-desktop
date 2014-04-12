/**
 * Handles configuration variables for the App.
 * Closely tied to the update process, uses localStorage for everything
 */

Settings = {
    "_defaultSettings": {
        // Default to the first beta
        "version": "0.1.0",
        "dbVersion": "1.0",
        // Used to check for the latest version
        "updateNotificationUrl": "http://get-popcorn.com/update.json",
        // Used to check if there's an internet connection
        "connectionCheckUrl": "http://www.google.com",
        // YIFY Endpoint
        "yifyApiEndpoint": "https://yts.re/api/",
        // A mirror for YIFY (for users in the UK -Yify is blocked there-)
        "yifyApiEndpointMirror": "https://yts.im/api/"
    },


    "setup": function(forceReset) {

        // If there's no version, assume it's a new install (this also includes people in Beta 1, which didn't have settings)
        if( typeof Settings.get('version') == 'undefined' ) {
            window.__isNewInstall = true;
        }

        for( var key in Settings._defaultSettings ) {
            // Create new settings if necessary
            if( typeof Settings.get(key) == 'undefined' || (forceReset === true) ) {
                Settings.set(key, Settings._defaultSettings[key]);
            }
        }

        Settings.performUpgrade();
        Settings.getHardwareInfo();

        if(Settings.get('checkedApiEndpoint') != 'true' || forceReset) {
            Settings.checkApiEndpoint();
        }
    },

    "performUpgrade": function() {
        // This gives the official version (the package.json one)
        gui = require('nw.gui');
        var currentVersion = gui.App.manifest.version;

        if( currentVersion != Settings.get('version') ) {
            // Nuke the DB if there's a newer version
            // Todo: Make this nicer so we don't lose all the cached data
            var cacheDb = openDatabase('cachedb', '', 'Cache database', 50 * 1024 * 1024);

            cacheDb.transaction(function (tx) {
                tx.executeSql('DELETE FROM trakttv');
                tx.executeSql('DELETE FROM ysubs');
            });

            if(Settings.get('yifyApiEndpoint') == 'http://yify-torrents.com/api/')
                Settings.set('yifyApiEndpoint', Settings._defaultSettings['yifyApiEndpoint']);
            if(Settings.get('yifyApiEndpointMirror') == 'http://yify.unlocktorrent.com/api/')
                Settings.set('yifyApiEndpointMirror', Settings._defaultSettings['yifyApiEndpointMirror']);
            if(Settings.get('updateNotificationUrl') != 'http://popcorn-time.tv/update.json')
                Settings.set('updateNotificationUrl', Settings._defaultSettings['updateNotificationUrl']);


            // Add an upgrade flag
            window.__isUpgradeInstall = true;
        }

        Settings.set('version', currentVersion);
    },

    "get": function(variable) {
        return localStorage['settings_'+variable];
    },

    "set": function(variable, newValue) {
        localStorage.setItem('settings_'+variable, newValue);
    },

    "checkApiEndpoint": function() {
        var tls = require('tls')
          , URI = require('URIjs');

        var hostname = URI(Settings.get('yifyApiEndpoint')).hostname();

        tls.connect(443, hostname, {
            servername: hostname,
            rejectUnauthorized: false
        }, function() {
            if(this.authorized && !this.authorizationError) {
                var cert = this.getPeerCertificate();
                if(cert.fingerprint != 'D4:7B:8A:2A:7B:E1:AA:40:C5:7E:53:DB:1B:0F:4F:6A:0B:AA:2C:6C') {
                    // "These are not the certificates you're looking for..."
                    // Seems like they even got a certificate signed for us :O
                    Settings.set('yifyApiEndpoint', Settings.get('yifyApiEndpointMirror'));
                    Settings.set('checkedApiEndpoint', true);
                    this.end();
                } else {
                    // Valid Certificate! YAY - Not blocked!
                    Settings.set('checkedApiEndpoint', true);
                    this.end();
                }
            } else {
                // Not a valid SSL certificate... mhmmm right, this is totz yts.re!
                Settings.set('yifyApiEndpoint', Settings.get('yifyApiEndpointMirror'));
                Settings.set('checkedApiEndpoint', true);
                this.end();
            }
        }).on('error', function() {
            // No SSL support. That's convincing >.<
            Settings.set('yifyApiEndpoint', Settings.get('yifyApiEndpointMirror'));
            Settings.set('checkedApiEndpoint', true);
            this.end();
        });
    },

    "getHardwareInfo": function() {
        if(/64/.test(process.arch))
            Settings.set('arch', 'x64');
        else
            Settings.set('arch', 'x86');

        switch(process.platform) {
            case 'darwin':
                Settings.set('os', 'mac');
                break;
            case 'win32':
                Settings.set('os', 'windows');
                break;
            case 'linux':
                Settings.set('os', 'linux');
                break;
            default:
                Settings.set('os', 'unknown');
                break;
        }
    }
};

Settings.setup();