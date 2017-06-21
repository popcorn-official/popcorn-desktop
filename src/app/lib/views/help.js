(function (App) {
    'use strict';
    var dyks;

    var Help = Backbone.Marionette.ItemView.extend({
        template: '#help-tpl',
        className: 'help',

        events: {
            'click .close-icon': 'closeHelp',
            'click #in-app-reporter': 'reportIssue'
        },

        initialize: function () {
            dyks = [
                i18n.__('You can paste magnet links anywhere in the app with CTRL+V.'),
                i18n.__('You can drag & drop a .torrent file into the app.'),
                i18n.__('This app was forked from the Butter project that started in February 2014 under the "Popcorn Time" name, and has already had 160 people that contributed more than 6000 times to it\'s development in January 2017'),
                i18n.__('If a subtitle for a TV series is missing, you can add it on %s. And the same way for a movie, but on %s.', '<a class="links" href="http://opensubtitles.org">opensubtitles.org</a>', '<a class="links" href="http://yifysubtitles.com">yifysubtitles.com</a>'),
                i18n.__('If you\'re experiencing connection drop issues, try to reduce the DHT Limit in settings.'),
                i18n.__('If you search \"1998\", you can see all the movies or TV series that came out that year.'),
                i18n.__('You can login to Trakt.tv to save all your watched items, and synchronize them across multiple devices.'),
                i18n.__('Clicking on the rating stars will display a number instead.'),
                i18n.__('This application is entirely written in HTML5, CSS3 and Javascript.'),
                i18n.__('You can find out more about a movie or a TV series? Just click the IMDb icon.'),
                i18n.__('Clicking twice on a \"Sort By\" filter reverses the order of the list.')
            ];
        },

        onShow: function () {
            $('.search input').blur();
            Mousetrap.bind('esc', function (e) {
                App.vent.trigger('help:close');
            });
            var dyk = dyks[_.random(dyks.length - 1)];
            $('.randomized-dyk').html(dyk);
        },

        reportIssue: function () {
            App.vent.trigger('issue:new');
        },

        onDestroy: function () {},

        closeHelp: function () {
            App.vent.trigger('help:close');
        }

    });

    App.View.Help = Help;
})(window.App);
