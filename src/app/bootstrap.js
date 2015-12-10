(function (App) {
    'use strict';
    App.start();

    _.keys(App.ProviderTypes).forEach(function (p) {
        App.Config.getProvider(p);
    });

})(window.App);
