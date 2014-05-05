(function(App) {
    "use strict";

    var DisclaimerModal = Backbone.Marionette.ItemView.extend({
        template: '#disclaimer-tpl',
        className: 'loading',

        events: {
            'click .btn-accept': 'acceptDisclaimer',
            'click .btn-close': 'closeApp',            
        },

        initialize: function() {
            console.log('Show Disclaimer');
        },

        acceptDisclaimer: function(e) {
            e.preventDefault();
            AdvSettings.set('disclaimerAccepted', 1);
            App.vent.trigger('movies:list', []);
        },

        closeApp: function(e) {
            e.preventDefault();
            gui.App.quit();
        }

    });

    App.View.DisclaimerModal = DisclaimerModal;
})(window.App);
