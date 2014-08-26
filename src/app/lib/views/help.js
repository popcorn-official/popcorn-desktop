(function(App) {
    'use strict';

    var Help = Backbone.Marionette.ItemView.extend({
        template: '#help-tpl',
        className: 'help',
        
        events: {
            'click .close-icon': 'closeHelp',
        },

        onShow: function() {
            $('.search input').blur();
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('help:close');
            });
        },

        onClose: function() {
        },

        closeHelp: function() {
            App.vent.trigger('help:close');
        },

    });

    App.View.Help = Help;
})(window.App);