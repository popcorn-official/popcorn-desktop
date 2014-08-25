(function(App) {
    'use strict';

    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'app-overlay',

        ui: {
            stateTextDownload: '.text_download',
            progressTextDownload: '.value_download',

            stateTextPeers: '.text_peers',
            progressTextPeers: '.value_peers',

            stateTextSeeds: '.text_seeds',
            progressTextSeeds: '.value_seeds',

            seedStatus: '.seed_status',
            downloadPercent: '.download_percent',

            downloadSpeed: '.download_speed',
            progressbar: '#loadingbar-contents'
        },

        events: {
            'click .button-cancel': 'cancelStreaming'
        },

        initialize: function() {
            var _this = this;

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function() {
                if(_.last(App.ViewStack) === _this.className){
                    _this.initKeyboardShortcuts();
                }
            });

            //If a child was added above this view
            App.vent.on('viewstack:push', function() {
                if(_.last(App.ViewStack) !== _this.className){
                    _this.unbindKeyboardShortcuts();
                }
            });

            win.info('Loading torrent');
            this.listenTo(this.model, 'change:state', this.onStateUpdate);
        },

        initKeyboardShortcuts: function(){
            var _this = this;
            Mousetrap.bind(['esc', 'backspace'], function(e) {
                _this.cancelStreaming();
            });
        },

        unbindKeyboardShortcuts: function(){
            Mousetrap.unbind(['esc', 'backspace']);
        },

        onShow: function() {
            $('.filter-bar').hide();
            $('#header').addClass('header-shadow');

            this.initKeyboardShortcuts();
        },
        onStateUpdate: function() {
            var state = this.model.get('state');
            win.info('Loading torrent:', state);

            this.ui.stateTextDownload.text(i18n.__(state));

            if (state === 'downloading') {
                this.listenTo(this.model.get('streamInfo'), 'change:downloaded', this.onProgressUpdate);
            }
        },

        onProgressUpdate: function() {

            // TODO: Translate peers / seeds in the template
            this.ui.seedStatus.show();
            var streamInfo = this.model.get('streamInfo');
            var downloaded = streamInfo.get('downloaded') / (1024 * 1024);
            this.ui.progressTextDownload.text(downloaded.toFixed(2) + ' Mb');

            this.ui.progressTextPeers.text(streamInfo.get('active_peers'));
            this.ui.progressTextSeeds.text(streamInfo.get('total_peers'));
            this.ui.downloadPercent.text(streamInfo.get('percent').toFixed() + '%');

            this.ui.downloadSpeed.text(streamInfo.get('downloadSpeed'));
            this.ui.progressbar.css('width', streamInfo.get('percent').toFixed() + '%');
        },

        cancelStreaming: function() {
            App.vent.trigger('stream:stop');
            App.vent.trigger('player:close');
            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
        }
    });

    App.View.Loading = Loading;
})(window.App);