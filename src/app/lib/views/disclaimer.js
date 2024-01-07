(function (App) {
    'use strict';

    var DisclaimerModal = Marionette.View.extend({
        template: '#disclaimer-tpl',
        className: 'disclaimer',

        events: {
            'click .btn-accept': 'acceptDisclaimer',
            'click .btn-close': 'closeApp',
        },

        initialize: function () {
            Mousetrap.pause();
            win.warn('Show Disclaimer');
        },

        acceptDisclaimer: function (e) {
            e.preventDefault();
            Mousetrap.unpause();
            AdvSettings.set('dhtEnable', document.getElementById('dhtEnableFR').checked ? true : false);
            AdvSettings.set('updateNotification', document.getElementById('updateNotificationFR').checked ? true : false);
            AdvSettings.set('disclaimerAccepted', 1);
            if (document.getElementById('dhtEnableFR').checked) {
                App.DhtReader.update();
                App.vent.trigger('notification:show', new App.Model.Notification({
                    title: i18n.__('Please wait') + '...',
                    body: i18n.__('Updating the API Server URLs'),
                    showClose: false,
                    type: 'danger'
                }));
            } else {
                App.DhtReader.updateOld();
            }
            App.vent.trigger('disclaimer:close');
        },

        closeApp: function (e) {
            e.preventDefault();
            nw.App.quit();
        }

    });

    App.View.DisclaimerModal = DisclaimerModal;
})(window.App);
