(function(App) {
    "use strict";

    var ButtonOrder = {
        'win32': ['min', 'max', 'close'],
        'mac': ['close', 'min', 'max'],
        'linux': ['min', 'max', 'close']
    };

    var TitleBar = Backbone.Marionette.ItemView.extend({
        template: '#header-tpl',

        events: {
            'click .btn-os.max': 'maximize',
            'click .btn-os.min': 'minimize',
            'click .btn-os.close': 'closeWindow',
            'click .btn-os.fullscreen': 'toggleFullscreen'
        },

        initialize: function() {
            this.nativeWindow = require('nw.gui').Window.get();
        },

        templateHelpers: {
            getButtons: function(){
                return ButtonOrder[App.Config.platform];
            }
        },

        maximize: function() {
            if(this.nativeWindow.isFullscreen){
                this.nativeWindow.toggleFullscreen();
            }else{
                if (window.screen.availHeight <= this.nativeWindow.height) {
                    this.nativeWindow.unmaximize();
                } else {
                    this.nativeWindow.maximize();
                }
            }
        },

        minimize: function() {
            this.nativeWindow.minimize();
        },

        closeWindow: function() {
            this.nativeWindow.close();
        },

        toggleFullscreen: function() {
            win.toggleFullscreen();
            this.$el.find('.btn-os.fullscreen').toggleClass('active');
        }
    });

    App.View.TitleBar = TitleBar;
})(window.App);