(function(App) {
    'use strict';

    var Help = Backbone.Marionette.ItemView.extend({
        template: '#help-tpl',
        className: 'help',
        
        events: {
            'click .close-icon': 'closeHelp',
			'click a': 'links'
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

        links: function(e) {
            e.preventDefault();
            gui.Shell.openExternal($(e.currentTarget).attr('href'));
        }

    });

    App.View.Help = Help;
})(window.App);