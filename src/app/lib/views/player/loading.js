(function(App) {
  'use strict';

  var Loading = Marionette.View.extend({
    template: '#loading-tpl',
    className: 'app-overlay',
    extPlayerStatusUpdater: null,

    ui: {
      state: '.state',
      stateTextDownload: '.text_download',
      progressTextDownload: '.value_download',
      stateTextStreamUrl: '.text_streamurl',
      stateTextFilename: '.text_filename',
      stateTextSize: '.text_size',
      stateTextRemaining: '.text_remaining',
      stateTextDownloadedFormatted: '.text_downloadedformatted',
      progressTextPeers: '.value_peers',
      seedStatus: '.seed_status',
      bufferPercent: '.buffer_percent',
      downloadSpeed: '.download_speed',
      uploadSpeed: '.upload_speed',
      progressbar: '#loadingbar-contents',
      title: '.title',
      player: '.player-name',
      streaming: '.external-play',
      controls: '.player-controls',
      cancel_button: '#cancel-button',
      playingbarBox: '.playing-progressbar',
      playingbar: '#playingbar-contents',
      minimizeIcon: '.minimize-icon',
      maximizeIcon: '.maximize-icon',
      magnetIcon: '.magnet-icon'
    },

    events: {
      'click #cancel-button': 'cancelStreaming',
      'click #cancel-button-regular': 'cancelStreaming',
      'dblclick .text_filename': 'openItem',
      'click .pause': 'pauseStreaming',
      'click .stop': 'stopStreaming',
      'click .play': 'resumeStreaming',
      'click .forward': 'forwardStreaming',
      'click .backward': 'backwardStreaming',
      'click .minimize-icon': 'minDetails',
      'click .maximize-icon': 'minDetails',
      'click #max_play_ctrl': 'maxPlayCtrl',
      'click .show-pcontrols': 'showpcontrols',
      'mousedown .copytoclip': 'copytoclip',
      'mousedown .magnet-icon': 'openMagnet',
      'click .playing-progressbar': 'seekStreaming'
    },

    initialize: function() {
      var that = this;
      App.vent.trigger('settings:close');
      App.vent.trigger('about:close');
      $('.button:not(#download-torrent), .show-details .sdo-watch, .sdow-watchnow, .show-details #download-torrent, .file-item, .file-item a, .result-item, .collection-paste, .collection-import, .seedbox .item-play, #torrent-list .item-row, #torrent-show-list .item-row').addClass('disabled');
      $('#watch-now, #watch-trailer, .playerchoice, .file-item, .file-item a, .result-item, .result-item > *:not(.item-icon), .seedbox .item-play, #torrent-list .item-play, #torrent-show-list .item-play').prop('disabled', true);
      // If a child was removed from above this view
      App.vent.on('viewstack:pop', function() {
        if (_.last(App.ViewStack) === that.className) {
          if ($('.loading .minimize-icon').is(':visible')) {
            that.initKeyboardShortcuts();
          } else {
            Mousetrap.bind(['esc', 'backspace'], function(e) {
              App.vent.trigger('show:closeDetail');
              App.vent.trigger('movie:closeDetail');
            });
          }
        }
      });
      // If a child was added above this view
      App.vent.on('viewstack:push', function() {
        if (_.last(App.ViewStack) !== that.className && _.last(App.ViewStack) !== 'notificationWrapper') {
          that.unbindKeyboardShortcuts();
        }
      });
      win.info('Loading torrent');
      this.listenTo(this.model, 'change:state', this.onStateUpdate);
    },

    initKeyboardShortcuts: function() {
      var that = this;
      Mousetrap.bind('ctrl+v', function (e) {
        e.preventDefault();
      });
      Mousetrap.bind(['esc', 'backspace'], function(e) {
        that.cancelStreaming();
      });
    },

    unbindKeyboardShortcuts: function() {
      Mousetrap.unbind(['esc', 'backspace']);
    },

    minDetails: function () {
      if (this.ui.minimizeIcon.is(':visible')) {
        $('.loading').css({'height': '0', 'width': '0'});
        this.ui.minimizeIcon.hide();
        this.ui.maximizeIcon.show();
        if (!App.ViewStack.includes('settings-container-contain')) {
          $('.filter-bar').show();
        }
        Mousetrap.bind(['esc', 'backspace'], function(e) {
          App.vent.trigger('show:closeDetail');
          App.vent.trigger('movie:closeDetail');
        });
      } else {
        $('.loading').removeAttr('style');
        this.ui.maximizeIcon.hide();
        this.ui.minimizeIcon.show();
        $('.filter-bar').hide();
        this.initKeyboardShortcuts();
      }
    },

    maxPlayCtrl: function (e) {
      e.preventDefault();
      e.stopPropagation();
      $('.vjs-play-control').click();
    },

    onAttach: function() {
      $('.filter-bar').hide();
      $('#header').addClass('header-shadow');
      App.LoadingView = this;
      this.initKeyboardShortcuts();
      $('.minimize-icon,#maxic,.title,.text_filename,.text_streamurl,.show-pcontrols,.magnet-icon').tooltip({
        html: true,
        delay: {
          'show': 800,
          'hide': 0
        }
      });
      this.ui.title.html('&nbsp;');
      this.ui.stateTextDownloadedFormatted.hide();
    },

    onStateUpdate: function() {
      var self = this;
      var state = this.model.get('state');
      var streamInfo = this.model.get('streamInfo');
      win.info('Loading torrent:', state);
      this.ui.stateTextDownload.text(i18n.__(state));
      if (streamInfo) {
        if (streamInfo.get('torrentModel').get('localFile')) {
          streamInfo.set({device: streamInfo.get('torrentModel').get('torrentModel').get('device'), src: streamInfo.get('torrentModel').get('src')});
        }
        if (streamInfo.get('downloaded')) {
          this.ui.stateTextDownloadedFormatted.text(Common.fileSize(streamInfo.get('downloaded')) + ' / ');
        }
        if (streamInfo.get('size') !== 0) {
          this.ui.stateTextSize.text(Common.fileSize(streamInfo.get('size')));
        } else {
          this.ui.bufferPercent.css('display', 'none');
          this.ui.stateTextSize.text(i18n.__('Unknown'));
          this.ui.stateTextSize.next().html(')&nbsp&nbsp;&nbsp;');
        }
        this.ui.stateTextFilename.text(streamInfo.get('filename'));
        if (streamInfo.get('src') && Settings.ipAddress) {
          this.ui.stateTextStreamUrl.text(streamInfo.get('src').replace('127.0.0.1', Settings.ipAddress));
        }
      }
      this.listenTo(this.model.get('streamInfo'), 'change', this.onInfosUpdate);
      if (state === 'playingExternally') {
        if (streamInfo.get('device') && streamInfo.get('device').get('type') !== 'local') {
          this.ui.player.text(streamInfo.get('device').get('name'));
          this.ui.streaming.css('visibility', 'visible');
          $('#max_play_ctrl').removeClass('fa-play').removeClass('play').addClass('fa-pause').addClass('pause');
        }
        this.ui.stateTextDownload.text(i18n.__('Downloading'));
        this.ui.progressbar.parent().css('visibility', 'hidden');
        if (streamInfo && streamInfo.get('device')) {
          this.ui.playingbar.css('width', '0%');
          this.ui.cancel_button.css('visibility', 'visible');
          if (Settings.activateLoCtrl === true) {
            $('.show-pcontrols').removeClass('fa-caret-down').addClass('fa-caret-up').attr('data-original-title', i18n.__('Hide playback controls'));
            this.ui.cancel_button.css('display', 'none');
            this.ui.controls.css('display', 'block');
            this.ui.playingbarBox.css('display', 'block');
          }
          // Update gui on status update, uses listenTo so event is unsubscribed automatically when loading view closes
          this.listenTo(App.vent, 'device:status', this.onDeviceStatus);
        }
      }
    },

    onInfosUpdate: function() {
      var streamInfo = this.model.get('streamInfo');
      if (!this.firstUpdate && (streamInfo.get('size') || streamInfo.get('size') === 0)) {
        this.ui.seedStatus.css('visibility', 'visible');
        this.ui.progressbar.parent().css('visibility', 'visible');
        this.ui.stateTextDownloadedFormatted.show();
        if (streamInfo.get('torrentModel').get('localFile')) {
          this.ui.magnetIcon.css('visibility', 'hidden');
          this.ui.progressbar.parent().css('visibility', 'hidden');
          streamInfo.set({downloaded: streamInfo.get('size'), downloadedPercent: 100});
        }
        if (streamInfo.get('src') && Settings.ipAddress) {
          this.ui.stateTextStreamUrl.text(streamInfo.get('src').replace('127.0.0.1', Settings.ipAddress));
        }
        this.checkFreeSpace(streamInfo.get('size'));
        this.firstUpdate = true;
      }
      if (!this.backdropSet && streamInfo.get('backdrop')) {
        $('.loading-backdrop').css('background-image', 'url(' + streamInfo.get('backdrop') + ')');
        this.backdropSet = true;
      }
      if (!this.titleSet && streamInfo.get('title') !== '') {
        this.ui.title.html(streamInfo.get('title'));
        this.titleSet = true;
      }
      if (streamInfo.get('downloaded')) {
        this.ui.downloadSpeed.text(streamInfo.get('downloadSpeed'));
        this.ui.uploadSpeed.text(streamInfo.get('uploadSpeed'));
        if (!this.ddone) {
          if (streamInfo.get('downloaded') < streamInfo.get('size') || streamInfo.get('size') === 0) {
            this.ui.stateTextDownload.text(i18n.__('Downloading'));
            this.ui.stateTextDownloadedFormatted.text(Common.fileSize(streamInfo.get('downloaded')) + ' / ');
            this.ui.stateTextRemaining.text(this.remainingTime());
            this.ui.progressTextDownload.text((streamInfo.get('downloaded') / (1024 * 1024)).toFixed(2) + ' Mb');
            this.ui.progressTextPeers.text(streamInfo.get('active_peers'));
          } else {
            this.ui.stateTextDownloadedFormatted.hide();
            this.ui.progressTextPeers.hide();
            this.ui.downloadSpeed.hide();
            this.ui.stateTextRemaining.hide();
            $('#rbreak1,#rbreak2,#rbreak3,#rdownl,#ractpr,#maxdl,#maxdllb').hide();
            this.ui.cancel_button.css({'background-color': '#27ae60', 'color': '#fff'});
            this.ui.maximizeIcon.addClass('done');
            this.ddone = true;
          }
          this.ui.bufferPercent.text(streamInfo.get('downloadedPercent').toFixed() + '%');
        } else {
          this.ui.stateTextDownload.text(i18n.__('Downloaded'));
        }
      }
    },

    onDeviceStatus: function(status) {
      if (status.media !== undefined && status.media.duration !== undefined) {
        var playedPercent = (status.currentTime / status.media.duration) * 100;
        this.ui.playingbar.css('width', playedPercent.toFixed(1) + '%');
        win.info(
          'ExternalStream: %s: %ss / %ss (%s%)',
          status.playerState,
          status.currentTime.toFixed(1),
          status.media.duration.toFixed(),
          playedPercent.toFixed(1)
        );
      }
      if (!this.extPlayerStatusUpdater && status.playerState === 'PLAYING') {
        // First PLAYING state, start requesting device status update every 5 sec
        this.extPlayerStatusUpdater = setInterval(function() {
          App.vent.trigger('device:status:update');
        }, 5000);
      }
      if (this.extPlayerStatusUpdater && status.playerState === 'IDLE') {
        // If media encountered error, most likely unsupported codecs with chromecast
        if (status.idleReason === 'ERROR') {
          win.error('Device can\'t play the video');
          App.vent.trigger('notification:show', new App.Model.Notification({
            title: i18n.__('Device can\'t play the video'),
            body: i18n.__('Your device might not support the video format/codecs.<br/>Try other resolution quality or casting with VLC'),
            showRestart: false,
            type: 'error',
            autoclose: true
          }));
        }
        this.cancelStreaming();
      }
    },

    cancelStreaming: function() {
      if (this.model.get('state') === 'playingExternally') {
        if (this.extPlayerStatusUpdater) {
          clearInterval(this.extPlayerStatusUpdater);
        }
        win.info('Stopping external device');
        App.vent.trigger('device:stop');
      }
      win.info('Closing loading view');
      App.vent.trigger('stream:stop');
      App.vent.trigger('player:close');
      App.vent.trigger('torrentcache:stop');
    },

    showpcontrols: function (e) {
      if (Settings.activateLoCtrl === false) {
        AdvSettings.set('activateLoCtrl', true);
        $('.show-pcontrols').removeClass('fa-caret-down').addClass('fa-caret-up').tooltip('hide').attr('data-original-title', i18n.__('Hide playback controls'));
        this.ui.cancel_button.css('display', 'none');
        this.ui.controls.css('display', 'block');
        this.ui.playingbarBox.css('display', 'block');
      } else if (Settings.activateLoCtrl === true) {
        AdvSettings.set('activateLoCtrl', false);
        $('.show-pcontrols').removeClass('fa-caret-up').addClass('fa-caret-down').tooltip('hide').attr('data-original-title', i18n.__('Show playback controls'));
        this.ui.cancel_button.css('display', 'block');
        this.ui.controls.css('display', 'none');
        this.ui.playingbarBox.css('display', 'none');
      }
    },

    openItem: function (e) {
      const location = this.model.get('streamInfo').attributes.videoFile.replace(/[^\\/]*$/, '');
      App.settings.os === 'windows' ? nw.Shell.openExternal(location) : nw.Shell.openItem(location);
    },

    openMagnet: function (e) {
      const torrent = this.model.get('streamInfo').attributes.torrentModel.attributes.torrent;
      if (torrent.magnetURI) {
        var magnetLink = torrent.magnetURI.replace(/\&amp;/g, '&');
        magnetLink = magnetLink.split('&tr=')[0] + _.union(decodeURIComponent(magnetLink).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
        Common.openOrClipboardLink(e, magnetLink, i18n.__('magnet link'));
      }
    },

    remainingTime: function () {
      var streamInfo = this.model.get('streamInfo');
      var timeLeft = streamInfo.get('time_left');
      if (timeLeft === undefined || streamInfo.get('size') === 0) {
        return i18n.__('Unknown time remaining');
      } else if (timeLeft > 3600) {
        return i18n.__('%s hour(s) remaining', Math.round(timeLeft / 3600));
      } else if (timeLeft > 60) {
        return i18n.__('%s minute(s) remaining', Math.round(timeLeft / 60));
      } else if (timeLeft <= 60) {
        return i18n.__('%s second(s) remaining', timeLeft);
      }
    },

    copytoclip: (e) => Common.openOrClipboardLink(e, e.target.textContent, i18n.__($(e.target).data('copy')), true),

    pauseStreaming: function() {
      App.vent.trigger('device:pause');
      $('.pause, #max_play_ctrl').removeClass('fa-pause').removeClass('pause').addClass('fa-play').addClass('play');
    },

    resumeStreaming: function() {
      App.vent.trigger('device:unpause');
      $('.play, #max_play_ctrl').removeClass('fa-play').removeClass('play').addClass('fa-pause').addClass('pause');
    },

    stopStreaming: function() {
      this.cancelStreaming();
    },

    forwardStreaming: function() {
      App.vent.trigger('device:forward');
    },

    backwardStreaming: function() {
      App.vent.trigger('device:backward');
    },

    seekStreaming: function(e) {
      var percentClicked = (e.offsetX / e.currentTarget.clientWidth) * 100;
      App.vent.trigger('device:seekPercentage', percentClicked);
    },

    checkFreeSpace: function(size) {
      if (!size) {
        return;
      }
      size = size / (1024 * 1024 * 1024);
      var reserved = (size * 20) / 100;
      reserved = reserved > 0.25 ? 0.25 : reserved;
      var minspace = size + reserved;
      var cmd;
      if (process.platform === 'win32') {
        var drive = Settings.tmpLocation.substr(0, 2);
        cmd = 'dir /-C ' + drive;
        child.exec(cmd, function(error, stdout, stderr) {
          if (error) {
            return;
          }
          var stdoutParse = stdout.split('\n');
          stdoutParse = stdoutParse[stdoutParse.length - 1] !== '' ? stdoutParse[stdoutParse.length - 1] : stdoutParse[stdoutParse.length - 2];
          var regx = stdoutParse.match(/(\d+)/g);
          if (regx !== null) {
            var freespace = regx[regx.length - 1] / (1024 * 1024 * 1024);
            if (freespace < minspace) {
              $('#player .warning-nospace').css('display', 'block');
            }
          }
        });
      } else {
        var path = Settings.tmpLocation;
        cmd = 'df -Pk "' + path + '" | awk \'NR==2 {print $4}\'';
        child.exec(cmd, function(error, stdout, stderr) {
          if (error) {
            return;
          }
          var freespace = stdout.replace(/\D/g, '') / (1024 * 1024);
          if (freespace < minspace) {
            $('#player .warning-nospace').css('display', 'block');
          }
        });
      }
    },

    onBeforeDestroy: function() {
      $('.filter-bar').show();
      $('#header').removeClass('header-shadow');
      $('.button, #watch-now, .show-details .sdo-watch, .sdow-watchnow, .playerchoice, .file-item, .file-item a, .result-item, .result-item > *:not(.item-icon), .trash-torrent, .collection-paste, .collection-import, .seedbox .item-play, .seedbox .exit-when-done, #torrent-list .item-row, #torrent-show-list .item-row, #torrent-list .item-play, #torrent-show-list .item-play').removeClass('disabled').removeProp('disabled');
      Mousetrap.bind(['esc', 'backspace'], function(e) {
        App.vent.trigger('show:closeDetail');
        App.vent.trigger('movie:closeDetail');
      });
      Mousetrap.bind('ctrl+v', function (e) {
      });
    }

  });
  App.View.Loading = Loading;
})(window.App);
