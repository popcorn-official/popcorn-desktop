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
        "updateNotificationUrl": "http://getpopcornti.me/update.json",
        // Used to check if there's an internet connection
        "connectionCheckUrl": "http://www.google.com",
        // YIFY Endpoint
        "yifyApiEndpoint": "http://yify-torrents.com/api/",
        // A mirror for YIFY (for users in the UK -Yify is blocked there-)
        "yifyApiEndpointMirror": "http://yify.unlocktorrent.com/api/"
    },
    
    
    "setup": function(forceReset) {
    
        for( var key in Settings._defaultSettings ) {
            // Create new settings if necessary
            if( typeof Settings.get(key) == 'undefined' || (forceReset === true) ) {
                Settings.set(key, Settings._defaultSettings[key]);
            }
        }
    
        Settings.performUpgrade();
    },
    
    "performUpgrade": function() {
        // This gives the official version (the package.json one)
        gui = require('nw.gui');
        var currentVersion = gui.App.manifest.version;
        
        if( currentVersion > Settings.get('version') ) {
            // Nuke the DB if there's a newer version
            // Todo: Make this nicer so we don't lose all the cached data
            var cacheDb = openDatabase('cachedb', '1.0', 'Cache database', 50 * 1024 * 1024);

            cacheDb.transaction(function (tx) {
                tx.executeSql('DELETE FROM subtitle');
                tx.executeSql('DELETE FROM tmdb');
            });
        }
        
        Settings.set('version', currentVersion);
    },
    
    "get": function(variable) {
        return localStorage['settings_'+variable];
    },
    
    "set": function(variable, newValue) {
        localStorage.setItem('settings_'+variable, newValue);
    }
    
};

Settings.setup();
