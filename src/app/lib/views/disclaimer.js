(function (App) {
    'use strict';

    var DisclaimerModal = Backbone.Marionette.ItemView.extend({
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
            gui.App.quit();
        }

    });

    App.View.DisclaimerModal = DisclaimerModal;
})(window.App);
