(function (App) {
    'use strict';

    var About = Marionette.View.extend({
        template: '#about-tpl',
        className: 'about',

        ui: {
            success_alert: '.success_alert'
        },

        events: {
            'click .close-icon': 'closeAbout',
            'click #changelog': 'showChangelog'
        },

        onAttach: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('about:close');
            });
            $('.links,#changelog').tooltip();
            win.info('Show about');
            $('#movie-detail').hide();
        },

        onBeforeDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
            $('#movie-detail').show();
        },

        closeAbout: function () {
            if ($('.changelog-overlay').css('display') === 'block') {
                this.closeChangelog();
            } else {
                App.vent.trigger('about:close');
            }
        },

        showChangelog: function () {
            fs.readFile('./CHANGELOG.md', 'utf-8', function (err, contents) {
                if (!err) {
                    $('.changelog-text').html(contents.replace(/\n/g, '<br />'));
                    $('.changelog-overlay').show();
                } else {
                    nw.Shell.openExternal(Settings.changelogUrl);
                }
            });
        },

        closeChangelog: function () {
            $('.changelog-overlay').hide();
        }

    });

    App.View.About = About;
})(window.App);
