(function (App) {
    'use strict';

    var Keyboard = Marionette.View.extend({
        template: '#keyboard-tpl',
        className: 'keyboard',
        wasFullscreen = false,

        events: {
            'click .close-icon': 'closeKeyboard',
        },


        onAttach: function () {
            $('.search input').blur();
            if (win.isFullscreen) {
                $('.player .video-js').hide();
                this.wasFullscreen = true;
            }

            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('keyboard:close');
            });
        },

        onBeforeDestroy: function () {
            if (this.wasFullscreen) {
                $('.player .video-js').removeAttr('style');
            }
        },

        closeKeyboard: function () {
            App.vent.trigger('keyboard:close');
        },

    });

    App.View.Keyboard = Keyboard;
})(window.App);
