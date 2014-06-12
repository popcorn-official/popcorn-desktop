var os = require('os');

(function (App) {
    'use strict';

    // use of darwin string instead of mac (mac os x returns darwin as platform)
    var ButtonOrder = {
        'win32': ['min', 'max', 'close'],
        'darwin': ['close', 'min', 'max'],
        'linux': ['min', 'max', 'close']
    };

    // workaround/patch until node-webkit and windows 8 maximise/unmaximize works correctly
    // vars initialised by first maximise call
    var win8x, win8y, win8h, win8w;

        var TitleBar = Backbone.Marionette.ItemView.extend({
        template: '#header-tpl',

        events: {
            'click .btn-os.os-max': 'maximize',
            'click .btn-os.os-min': 'minimize',
            'click .btn-os.os-close': 'closeWindow',
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
            if (this.nativeWindow.isFullscreen) {
                this.nativeWindow.toggleFullscreen();
            }else{
                // workaround/patch until node-webkit and windows 8 maximise/unmaximize works correctly
                if (process.platform === 'win32' && parseFloat(os.release(), 10) > 6.1) {
                    if (window.screen.availHeight <= this.nativeWindow.height) {
                        // unmaximise replacement
                        this.nativeWindow.resizeTo(win8w, win8h);
                        this.nativeWindow.moveTo(win8x, win8y);
                    }else{
                        // maximise replacement - always happens first as we start in a window
                        win8x = this.nativeWindow.x;
                        win8y = this.nativeWindow.y;
                        win8h = this.nativeWindow.height;
                        win8w = this.nativeWindow.width;

                        // does not support multiple monitors - will always use primary
                        this.nativeWindow.moveTo(0, 0);
                        this.nativeWindow.resizeTo(window.screen.availWidth, window.screen.availHeight);
                    }
                }else{
                    // end patch
                    if (window.screen.availHeight <= this.nativeWindow.height) {
                        this.nativeWindow.unmaximize();
                    }else{
                        this.nativeWindow.maximize();
                    }
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
