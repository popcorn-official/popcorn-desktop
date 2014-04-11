(function(App) {
    "use strict";

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        initialize: function() {
            console.log('Start player');
        },

        onShow: function() {
        },

        onClose: function() {
        }
    });

    App.View.Player = Player;
})(window.App);