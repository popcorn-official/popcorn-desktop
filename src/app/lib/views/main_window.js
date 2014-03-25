(function(App) {
    "use strict";

    var MainWindow = Backbone.View.extend({
        id: "main-window",

        events: {
            '.btn-os.max click': 'maximize',
            '.btn-os.min click': 'minimize',
            '.btn-os.close click': 'close',
            '.btn-os.fullscreen click': 'toggleFullscreen'
        },

        initialize: function() {
            this.titleBar = new App.View.TitleBar({
                el: this.$el.find('#header')
            });
        },

        render: function() {
            this.titleBar.render();
        }
    });

    App.View.MainWindow = MainWindow = MainWindow;
})(window.App);