(function(App) {
    "use strict";

    var Settings = [];

    // ATTENTION
    // TO get settings works properly we need to set default value

    Settings['language'] = 'en';
    Settings['font'] = 'tahoma';

    App.db.getSettings(function(err, data) {
        if (data != null) {
            for(var key in data) {
                Settings[data[key].key] = data[key].value;
            }
        }

        App.settings = Settings;

    }); 
})(window.App);