(function(App) {
    "use strict";

    var Help = Backbone.Marionette.ItemView.extend({
        template: '#help-tpl',
        className: 'help',
        
        events: {
            'click .close': 'closeHelp',
        },

        onShow: function() {
            console.log('Show help', this.model); 
            $("#movie-detail").hide();
        },

        onClose: function() {   
            $("#movie-detail").show();
        },

        closeHelp: function() {
            App.vent.trigger('help:close');
        },

    });

    App.View.Help = Help;
})(window.App);

