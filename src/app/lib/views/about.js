(function(App) {
    'use strict';

    var About = Backbone.Marionette.ItemView.extend({
        template: '#about-tpl',
        className: 'about',

        ui: {
            success_alert: '.success_alert'
        },

        events: {
            'click .close': 'closeAbout',
            'click .links': 'links'
        },

        onShow: function() {
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('about:close');
            });
            $('.links').tooltip();
            console.log('Show about', this.model); 
            $('#movie-detail').hide();
        },

        onClose: function() {  
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
            $('#movie-detail').show();
        },

        closeAbout: function() {
            App.vent.trigger('about:close');
        },

        links: function(e) {
            e.preventDefault();
            gui.Shell.openExternal($(e.currentTarget).attr('href'));
        }

    });

    App.View.About = About;
})(window.App);

