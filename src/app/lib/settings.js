(function(App) {
    "use strict";

    var Settings = [];

    App.db.getSettings(function(err, data) {
        if (data != null) {
            for(var key in data) {
                Settings[data[key].key] = data[key].value;
            }
        }

        App.settings = Settings;

    }); 
})(window.App);