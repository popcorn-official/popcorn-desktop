(function (App) {
    'use strict';

    var Notification = Backbone.Model.extend({
        defaults: {
            body: i18n.__('Notification Body'),
            buttons: [],
            showClose: true,
            showRestart: false,
            title: i18n.__('Notification Title'),
            type: 'info'
        },

        initialize: function () {
            // Added 'showRestart' option here since we'll use it more than once
            if (this.get('showRestart')) {
                var buttons = this.get('buttons').concat([{
                    title: i18n.__('Restart Popcorn Time'),
                    action: this.restartPopcornTime
                }]);
                this.set('buttons', buttons);
            }
        },

        restartPopcornTime: function () {
            App.vent.trigger('restartPopcornTime');
        }
    });

    App.Model.Notification = Notification;
})(window.App);
