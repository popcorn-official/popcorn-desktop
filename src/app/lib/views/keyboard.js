(function (App) {
    'use strict';

    var Keyboard = Marionette.View.extend({
        template: '#keyboard-tpl',
        className: 'keyboard',

        events: {
            'click .close-icon': 'closeKeyboard',
        },


        onAttach: function () {
            $('.search input').blur();
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('keyboard:close');
            });
        },

        onBeforeDestroy: function () {},

        closeKeyboard: function () {
            App.vent.trigger('keyboard:close');
        },

    });

    App.View.Keyboard = Keyboard;
})(window.App);
