(function (App) {
    'use strict';

    App.Model.Lang = Backbone.Model.extend({
        defaults: {
            hasNull: false,
            selected: undefined
        }
    });
})(window.App);
