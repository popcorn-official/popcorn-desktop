(function(App) {
    "use strict";

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            fontdown: '.fontdown',
            fontup: '.fontup'
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .vjs-fullscreen-control': 'toggleFullscreen',
            'click .fontdown' : 'decreaseFont',
            'click .fontup' : 'increaseFont'
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

            var _this = this;

            $('.player-header-backround').canDragWindow();
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
        },

        increaseFont: function() {
            var max=164;
            var t = document.getElementsByClassName('vjs-subtitles vjs-text-track');
            for(i=0;i<t.length;i++) { 
                // Check if fontSize is set
                if(t[i].style.fontSize) {
                    var s = parseInt(t[i].style.fontSize.replace("px",""));
                }
                // If no default fontsize, make it 14 pixels (fail-safe)
                else {
                    var s = 14;
                }
                // If subtitle size does not go over max, add 2 pixels
                if (s!=max) {
                    s += 2;
                }
                // Change the fontSize to the new value
                t[i].style.fontSize = s+"px"
            }           
        },

        decreaseFont: function() {
            var min=2;
            var t = document.getElementsByClassName('vjs-subtitles vjs-text-track');
            for(i=0;i<t.length;i++) {   
                // Check if fontSize is set                
                if(t[i].style.fontSize) {
                    var s = parseInt(t[i].style.fontSize.replace("px",""));
                }
                // If no default fontsize, make it 14 pixels (fail-safe)
                else {
                    var s = 14;
                }
                // If subtitle size does not go over min, subtract 2 pixels
                if (s!=min) {
                    s -= 2;
                }
                // Change the fontSize to the new value
                t[i].style.fontSize = s+"px";     
            }           
        }

    });

    App.View.Player = Player;
})(window.App);
