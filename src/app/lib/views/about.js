(function(App) {
    "use strict";

    var About = Backbone.Marionette.ItemView.extend({
        template: '#about-tpl',
        className: 'about',

        ui: {
            success_alert: '.success_alert'
        },

        events: {
            'click .close': 'closeAbout'
        },

        onShow: function() {
            console.log('Show about', this.model); 
            $("#movie-detail").hide();
        },

        onClose: function() {   
            $("#movie-detail").show();
        },

        closeAbout: function() {
            App.vent.trigger('about:close');
        }

    });

    App.View.About = About;
})(window.App);

