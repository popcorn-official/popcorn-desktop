(function (App) {
    'use strict';

    var Movie = App.ContentItem.extend({
        getProviders: function() {
            return {
                subtitle: App.Config.getProviderForType('subtitle')
            };
        }
    });

    App.Model.Movie = Movie;
})(window.App);
