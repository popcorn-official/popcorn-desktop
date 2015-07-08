(function (App) {
    'use strict';

    var Keyboard = Backbone.Marionette.ItemView.extend({
        template: '#keyboard-tpl',
        className: 'keyboard',

        events: {
            'click .close-icon': 'closeKeyboard',
        },


        onShow: function () {
            $('.search input').blur();
            Mousetrap.bind('esc', function (e) {
                App.vent.trigger('keyboard:close');
            });
        },

        onDestroy: function () {},

        closeKeyboard: function () {
            App.vent.trigger('keyboard:close');
        },

    });

    App.View.Keyboard = Keyboard;
})(window.App);
