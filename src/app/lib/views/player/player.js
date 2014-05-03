(function(App) {
    "use strict";

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .vjs-fullscreen-control': 'toggleFullscreen',
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
            // Check if >80% is watched to mark as watched by user  (maybe add value to settings)
            if(this.model.get('type') == 'episode') {
                if(this.video.currentTime() / this.video.duration() >= 0.8){
                    App.db.markEpisodeAsWatched({
                        show_id: this.model.get("show_id"),
                        episode: this.model.get("episode"),
                        season: this.model.get("season")}, function(){});
                }
            }
            this.video.dispose();
            App.vent.trigger('player:close');  
        },

        onShow: function() {

            // Test to make sure we have title
            console.log("Watching: " + this.model.get("title"));

            var _this = this;

            $('.player-header-background').canDragWindow();
            $('#video_player').canDragWindow();
            // Double Click to toggle Fullscreen
            $('#video_player').dblclick(function(event){
              _this.toggleFullscreen();
            });

            if(this.model.get('type') == 'video/youtube') {
                this.video = videojs('video_player', { techOrder: ["youtube"], forceSSL: true, ytcontrols: false, quality: '720p' });
                this.ui.eyeInfo.hide();
                this.ui.fontdown.hide();
                this.ui.fontup.hide();
            }
            else
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
                    console.error('Error: ',document.getElementById('video_player').player.error());
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

                _this.toggleFullscreen();
              }

            });

            // Function to fade out top bar, first implementation, feel free to rewrite
            var timer;
            $(document).mousemove(function() {
                var playerid = document.getElementById("player");
                if (timer) {
                    clearTimeout(timer);
                    timer = 0;
                }

                $('.details-player').fadeIn('slow');
                $('.player-title').fadeIn('slow')
                    playerid.style.cursor = "auto";
                timer = setTimeout(function() {
                    $('.details-player').fadeOut('slow')
                     $('.player-title').fadeOut('slow')
                    playerid.style.cursor = "none";
                }, 2000) // roughly the time that the player's bottom bar fades out
            })
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
