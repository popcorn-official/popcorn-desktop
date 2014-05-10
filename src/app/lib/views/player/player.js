(function(App) {
    "use strict";

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            activePeers: '.active_peers_player',
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .vjs-fullscreen-control': 'toggleFullscreen',
        },        

        initialize: function() {
            this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
            this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);
            this.listenTo(this.model, 'change:active_peers', this.updateActivePeers);
            this.video = false;
        },

        updateDownloadSpeed: function() {
            this.ui.downloadSpeed.text(this.model.get('downloadSpeed') + '/s');
        },

        updateUploadSpeed: function() {
            this.ui.uploadSpeed.text(this.model.get('uploadSpeed') + '/s');
        },

        updateActivePeers: function() {
            this.ui.activePeers.text(this.model.get('active_peers'));
        },

        closePlayer: function() {
            console.log('Close player');

            // Check if >80% is watched to mark as watched by user  (maybe add value to settings)
            if(this.model.get('show_id') != null) {
                if(this.video.currentTime() / this.video.duration() >= 0.8){
                    console.log("Mark TV Show watched");
                    App.db.markEpisodeAsWatched({
                        show_id: this.model.get("show_id"),
                        episode: this.model.get("episode"),
                        season: this.model.get("season")
                    }, function(){});
                }
            }

            this.video.dispose();
            App.vent.trigger('player:close');  
        },

        onShow: function() {

            // Test to make sure we have title
            console.log("Watching: " + this.model.get("title"));
			//$(".filter-bar").show(); 
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
            }
            else
                this.video = videojs('video_player', { plugins: { biggerSubtitle : {}, smallerSubtitle : {}, customSubtitles: {}, progressTips: {} }});


            var player = this.video.player();
            this.player = player;
            // Had only tracking in, leave it here if we want to do something else when paused.
            player.on('pause', function () {

            });

            player.on('play', function () {
              // Trigger a resize so the subtitles are adjusted
              $(window).trigger('resize');
            });

            // There was an issue with the video
            player.on('error', function (error) {
              // TODO: what about some more elegant error tracking
                    console.error('Error: ',document.getElementById('video_player').player.error());
            });

            // add ESC toggle when full screen
            Mousetrap.bind('esc', function(e) {
                _this.leaveFullscreen();
            });

            Mousetrap.bind(['f', 'F'], function(e) {
                _this.toggleFullscreen();
            });

            Mousetrap.bind('h', function(e) {
                _this.increaseSubtitleOffset();
            });

            Mousetrap.bind('g', function(e) {
                _this.decreaseSubtitleOffset();
            });

            Mousetrap.bind(['space', 'p'], function(e) {
                $(".vjs-play-control").click();
            });

            Mousetrap.bind('right', function (e) {
                _this.seek(2)
            });

            Mousetrap.bind('shift+right', function (e) {
                _this.seek(10)
            });

            Mousetrap.bind('ctrl+right', function (e) {
                _this.seek(30)
            });

            Mousetrap.bind('left', function (e) {
                _this.seek(-2)
            });

            Mousetrap.bind('shift+left', function (e) {
                _this.seek(-10)
            });

            Mousetrap.bind('ctrl+left', function (e) {
                _this.seek(-30)
            });


          // Function to fade out cursor with other video elm's


			$('.player-header-background').appendTo('div#video_player');
        },

        seek: function (s) {
            var t = this.player.currentTime();
            this.player.currentTime(t + s);
            this.player.trigger('mousemove'); //hack, make controls show
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

        leaveFullscreen: function() {
            this.nativeWindow = require('nw.gui').Window.get();

            if(this.nativeWindow.isFullscreen) {
                this.nativeWindow.leaveFullscreen();
                this.nativeWindow.focus();
            }
        },

        increaseSubtitleOffset: function() {
            this.video.player().setOffset(this.video.player().offset() + 0.1);
        },

        decreaseSubtitleOffset: function() {
            this.video.player().setOffset(this.video.player().offset() - 0.1);
        },

        onClose: function() {
            App.vent.trigger('stream:stop');            
        }

    });
    App.View.Player = Player;
})(window.App);
