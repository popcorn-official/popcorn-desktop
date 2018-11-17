(function (App) {
    'use strict';

    App.View.Notification = Marionette.View.extend({
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

        onAttach: function () {
            var _this = this;
            // Uniquely identify each button and wire up the callback.
            this.model.get('buttons').forEach(function (button, index) {
                _this.$('.action-button-' + index).on('click', button.action);
            });

            this.autoClose(this.model.get('autoclose'));
        },

        autoClose: function (timeout) {
            var _this = this;
            if (!timeout) {
                return;
            }

            timeout = timeout === true ? 6000 : timeout;

            setTimeout(function () {
                _this.closeNotification();
            }, timeout);
        },

        closeNotification: function () {
            App.vent.trigger('notification:close');
        }

    });
})(window.App);
