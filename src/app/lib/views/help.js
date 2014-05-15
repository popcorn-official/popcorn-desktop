(function(App) {
    "use strict";

    var Help = Backbone.Marionette.ItemView.extend({
        template: '#help-tpl',
        className: 'help',
        
        events: {
            'click .close': 'closeHelp',
        },


        onShow: function() {
            $('.search input').blur();
            $("#movie-detail").hide();
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('help:close');
            });
        },

        onClose: function() {
            $("#movie-detail").show();
            Mousetrap.unbind('esc');
        },

        closeHelp: function() {
            App.vent.trigger('help:close');
        },

    });

    App.View.Help = Help;
})(window.App);

