(function (App) {
    'use strict';

    var Notification = Backbone.Model.extend({
        defaults: {
            body: 'Notification Body',
            buttons: [],
            showClose: true,
            showRestart: false,
            title: 'Notification Title',
            type: 'info'
        },

        // Added 'showRestart' option here since we'll use it more than once.
        initialize: function () {
            this.toggleShowRestart();
            // If this property is changed after init, add/remove the button.
            this.on('change:showRestart', this.toggleShowRestart.bind(this));
        },

        addShowRestart: function () {
            this.set('buttons', this.get('buttons').concat([{
                title: i18n.__('Restart'),
                action: this.restartButter
            }]));
        },

        removeShowRestart: function () {
            this.set('buttons', this.get('buttons').filter(function (b) {
                return b.title !== i18n.__('Restart');
            }));
        },

        toggleShowRestart: function () {
            this[(this.get('showRestart') ? 'add' : 'remove') + 'ShowRestart']();
        },

        restartButter: function () {
            App.vent.trigger('restartButter');
        }
    });

    App.Model.Notification = Notification;
})(window.App);
