(function(App) {
    "use strict";

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .vjs-fullscreen-control': 'toggleFullscreen'
        },        

        initialize: function() {
            this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
            this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);
            this.video = false;
        },

        updateDownloadSpeed: function() {
            this.ui.downloadSpeed.text(this.model.get('downloadSpeed') + '/s');
        },

        updateUploadSpeed: function() {
            this.ui.uploadSpeed.text(this.model.get('uploadSpeed') + '/s');
        },

        closePlayer: function() {
            console.log('Close player');
            this.video.dispose();
            App.vent.trigger('player:close');  
        },

        onShow: function() {
            this.video = videojs('video_player', { plugins: { biggerSubtitle : {}, smallerSubtitle : {}, customSubtitles: {} }});

            // Had only tracking in, leave it here if we want to do something else when paused.
            this.video.player().on('pause', function () {

            });

            this.video.player().on('play', function () {
              // Trigger a resize so the subtitles are adjusted
              $(window).trigger('resize');
            });

            // There was an issue with the video
            this.video.player().on('error', function (error) {
              // TODO: what about some more elegant error tracking
              alert('Error: ' + videoError(document.getElementById('video_player').player.error()));
            });

            // add ESC toggle when full screen
            $(document).on('keydown', function (e) {
              if (e.keyCode == 27) {
                
                this.nativeWindow = require('nw.gui').Window.get();

                if(this.nativeWindow.isFullscreen) {
                  this.nativeWindow.leaveFullscreen();
                  this.nativeWindow.focus();
                }
              } else if ((e.keyCode == 102) || (e.keyCode == 70)) {

                this.toggleFullscreen();
              }
              
            });            
        },

        toggleFullscreen: function() {
            
            this.nativeWindow = require('nw.gui').Window.get();

            if(this.nativeWindow.isFullscreen) {
                this.nativeWindow.leaveFullscreen();
                this.nativeWindow.focus();
            } else {
                this.nativeWindow.enterFullscreen();
                this.nativeWindow.focus();
            }
        },

        onClose: function() {
            App.vent.trigger('stream:stop');            
        }
    });

    App.View.Player = Player;
})(window.App);
