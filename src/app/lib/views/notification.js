(function (App) {
    'use strict';

    App.View.Notification = Backbone.Marionette.ItemView.extend({
        template: '#notification-tpl',
        className: 'notificationWrapper',

        ui: {
            notification: '.notification'
        },

        events: {
            'click .close': 'closeNotification'
        },

        initialize: function () {
            if (!(this.model instanceof App.Model.Notification)) {
                throw new Error('When instantiating a Notification, you must pass an App.Model.Notification.');
            }
        },

        onShow: function () {
            var _this = this;
            // Uniquely identify each button and wire up the callback.
            this.model.get('buttons').forEach(function (button, index) {
                _this.$('.action-button-' + index).on('click', button.action);
            });
        },

        closeNotification: function () {
            App.vent.trigger('notification:close');
        }

    });
})(window.App);
