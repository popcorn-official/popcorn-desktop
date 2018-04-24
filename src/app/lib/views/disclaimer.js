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
            AdvSettings.set('disclaimerAccepted', 1);
            App.vent.trigger('disclaimer:close');
        },

        closeApp: function (e) {
            e.preventDefault();
            nw.App.quit();
        }

    });

    App.View.DisclaimerModal = DisclaimerModal;
})(window.App);
