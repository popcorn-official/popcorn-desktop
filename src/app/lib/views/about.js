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
            'mousedown #changelog': 'showChangelog',
            'mousedown .update-app': 'updateApp',
            'contextmenu .links': 'copytoclip'
        },

        onAttach: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('about:close');
            });
            $('.links,#changelog').tooltip();
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

        copytoclip: (e) => Common.openOrClipboardLink(e, $(e.target)[0].href, i18n.__('link'), true),

        updateApp: function(e) {
            if (e.button === 2) {
                Common.openOrClipboardLink(e, Settings.projectUrl, i18n.__('link'), true);
            } else {
                let updateMode = e === 'enable' ? e : (e ? 'about' : '');
                App.Updater.onlyNotification(updateMode);
            }
        },

        showChangelog: function (e) {
            if (e.button === 2) {
                Common.openOrClipboardLink(e, (App.git ? App.git.semver : App.settings.version), i18n.__('version number'), true);
            } else {
                fs.readFile('./CHANGELOG.md', 'utf-8', function (err, contents) {
                    if (!err) {
                        $('.changelog-text').html(contents.replace(/\n/g, '<br />'));
                        $('.changelog-overlay').show();
                    } else {
                        nw.Shell.openExternal(Settings.changelogUrl);
                    }
                });
            }
        },

        closeChangelog: function () {
            $('.changelog-overlay').hide();
        }

    });

    App.View.About = About;
})(window.App);
