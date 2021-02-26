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
      cancel_button_vpn: '#cancel-button-vpn',
      playingbarBox: '.playing-progressbar',
      playingbar: '#playingbar-contents',
      minimizeIcon: '.minimize-icon',
      maximizeIcon: '.maximize-icon',
      vpn: '#vpn-contents',
      userIp: '#userIp',
      userCity: '#userCity',
      userCountry: '#userCountry',
      userZIP: '#userZIP',
      userISP: '#userISP',
      map: '#map'
    },

    events: {
      'click #cancel-button': 'cancelStreaming',
      'click #cancel-button-regular': 'cancelStreaming',
      'click #cancel-button-vpn': 'cancelStreamingVPN',
      'click .open-button': 'tempf',
      'click .pause': 'pauseStreaming',
      'click .stop': 'stopStreaming',
      'click .play': 'resumeStreaming',
      'click .forward': 'forwardStreaming',
      'click .backward': 'backwardStreaming',
      'click .minimize-icon': 'minDetails',
      'click .maximize-icon': 'minDetails',
      'click .show-pcontrols': 'showpcontrols',
      'mousedown .title': 'copytoclip',
      'mousedown .text_filename': 'copytoclip',
      'mousedown .text_streamurl': 'copytoclip',
      'click .playing-progressbar': 'seekStreaming'
    },

    initialize: function() {
      var that = this;
      App.vent.trigger('settings:close');
      App.vent.trigger('about:close');
      $('.button:not(#download-torrent), .show-details .sdow-watchnow, .show-details #download-torrent, .file-item, .result-item, .collection-actions').addClass('disabled');
      $('#watch-now, #watch-trailer, .playerchoice, .file-item, .result-item').prop('disabled', true);
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
      if (Settings.vpnEnabled) {
        if (!VPNht.isInstalled()) {
          that.showVPNLoader();
        } else {
          VPNht.isConnected().then(isConnected => {
            if (!isConnected) {
              that.showVPNLoader();
            }
          });
        }
      }
      win.info('Loading torrent');
      this.listenTo(this.model, 'change:state', this.onStateUpdate);
    },

    showVPNLoader: function() {
      request(
        {
          url: 'https://myip.ht/status',
          json: true
        },
        (err, _, data) => {
          if (err || !data || data.error) {
            console.log('can\'t extract user data, using default loader');
          } else {
            this.ui.cancel_button.css('visibility', 'hidden');
            this.ui.vpn.css('display', 'block');
            this.ui.state.css('top', '200px');
            this.ui.userIp.text(data.ip);
            this.ui.userCity.text(data.advanced.city);
            this.ui.userCountry.text(data.advanced.countryName);
            this.ui.userZIP.text(data.advanced.postalCode);
            this.ui.userISP.text(data.isp);
            this.ui.map.parent().html('<i class="fas fa-lock" style="opacity:0.2;font-size:600%"></i>');
          }
        }
      );
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
        $('.filter-bar').show();
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

    onAttach: function() {
      $('.filter-bar').hide();
      $('#header').addClass('header-shadow');
      App.LoadingView = this;
      this.initKeyboardShortcuts();
      $('.minimize-icon,#maxic,.open-button,.title,.text_filename,.text_streamurl,.show-pcontrols').tooltip({
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
        }
        this.ui.stateTextDownload.text(i18n.__('Downloading'));
        this.ui.progressbar.parent().css('visibility', 'hidden');
        if (streamInfo && streamInfo.get('device')) {
          this.ui.vpn.css('display', 'none');
          this.ui.playingbar.css('width', '0%');
          this.ui.cancel_button.css('visibility', 'visible');
          if (Settings.activateLoCtrl === true) {
            $('.show-pcontrols').removeClass('fa-angle-down').addClass('fa-angle-up').attr('data-original-title', i18n.__('Hide playback controls'));
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
        if (streamInfo.get('src') && Settings.ipAddress) {
          this.ui.stateTextStreamUrl.text(streamInfo.get('src').replace('127.0.0.1', Settings.ipAddress));
        }
        this.checkFreeSpace(streamInfo.get('size'));
        this.firstUpdate = true;
      }
      if (streamInfo.get('backdrop')) {
        $('.loading-backdrop').css('background-image', 'url(' + streamInfo.get('backdrop') + ')');
      }
      if (streamInfo.get('title') !== '') {
        this.ui.title.html(streamInfo.get('title'));
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
            $('.cancel-button').css('background-color', '#27ae60');
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
        win.debug(
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
          win.debug('Status: ', status);
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

    cancelStreamingVPN: function() {
      this.cancelStreaming();
      App.vent.trigger('vpn:open');
    },

    showpcontrols: function (e) {
      if (Settings.activateLoCtrl === false) {
        AdvSettings.set('activateLoCtrl', true);
        $('.show-pcontrols').removeClass('fa-angle-down').addClass('fa-angle-up').tooltip('hide').attr('data-original-title', i18n.__('Hide playback controls'));
        this.ui.cancel_button.css('display', 'none');
        this.ui.controls.css('display', 'block');
        this.ui.playingbarBox.css('display', 'block');
      } else if (Settings.activateLoCtrl === true) {
        AdvSettings.set('activateLoCtrl', false);
        $('.show-pcontrols').removeClass('fa-angle-up').addClass('fa-angle-down').tooltip('hide').attr('data-original-title', i18n.__('Show playback controls'));
        this.ui.cancel_button.css('display', 'block');
        this.ui.controls.css('display', 'none');
        this.ui.playingbarBox.css('display', 'none');
      }
    },

    tempf: function (e) {
      App.settings.os === 'windows' ? nw.Shell.openExternal(Settings.tmpLocation) : nw.Shell.openItem(Settings.tmpLocation);
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

    copytoclip: function (e) {
      if (e.button === 2) {
        var clipboard = nw.Clipboard.get();
        clipboard.set(e.target.textContent, 'text');
        $('.notification_alert').text(i18n.__('Copied to clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
      }
    },

    pauseStreaming: function() {
      App.vent.trigger('device:pause');
      $('.pause').removeClass('fa-pause').removeClass('pause').addClass('fa-play').addClass('play');
    },

    resumeStreaming: function() {
      win.debug('Play triggered');
      App.vent.trigger('device:unpause');
      $('.play').removeClass('fa-play').removeClass('play').addClass('fa-pause').addClass('pause');
    },

    stopStreaming: function() {
      this.cancelStreaming();
    },

    forwardStreaming: function() {
      win.debug('Forward triggered');
      App.vent.trigger('device:forward');
    },

    backwardStreaming: function() {
      win.debug('Backward triggered');
      App.vent.trigger('device:backward');
    },

    seekStreaming: function(e) {
      var percentClicked = (e.offsetX / e.currentTarget.clientWidth) * 100;
      win.debug('Seek (%s%) triggered', percentClicked.toFixed(2));
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
      $('.button, #watch-now, .show-details .sdow-watchnow, .playerchoice, .file-item, .result-item, .trash-torrent, .collection-actions').removeClass('disabled').removeProp('disabled');
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
