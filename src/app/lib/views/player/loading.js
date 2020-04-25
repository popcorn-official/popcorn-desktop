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
      stateTextPeers: '.text_peers',
      progressTextPeers: '.value_peers',

      stateTextSeeds: '.text_seeds',
      progressTextSeeds: '.value_seeds',

      seedStatus: '.seed_status',
      bufferPercent: '.buffer_percent',
      loadingInfos: '.loading-info',

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
      'click .pause': 'pauseStreaming',
      'click .stop': 'stopStreaming',
      'click .play': 'resumeStreaming',
      'click .forward': 'forwardStreaming',
      'click .backward': 'backwardStreaming',
      'click .minimize-icon': 'minDetails',
      'click .maximize-icon': 'minDetails',
      'click .maximize-icong': 'minDetails',
      'click .show-pcontrols': 'showpcontrols',
      'mousedown .title': 'titletoclip',
      'mousedown .text_filename': 'filenametoclip',
      'mousedown .text_streamurl': 'streamurltoclip',
      'click .playing-progressbar': 'seekStreaming',
      'mouseover .text_filename': 'filenameovrflsh',
      'mouseout .text_filename': 'filenameovrflhd'
    },

    initialize: function() {
      var that = this;

      App.vent.trigger('settings:close');
      App.vent.trigger('about:close');

      //If a child was removed from above this view
      App.vent.on('viewstack:pop', function() {
        if (_.last(App.ViewStack) === that.className) {
          that.initKeyboardShortcuts();
        }
      });

      //If a child was added above this view
      App.vent.on('viewstack:push', function() {
        if (_.last(App.ViewStack) !== that.className) {
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

      this.ddone = 'false';
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
            this.ui.map.attr(
              'src',
              `https://maps.google.com/maps/api/staticmap?center=${data.advanced.latitude},${data.advanced.longitude}&zoom=14&sensor=false&size=640x403&key=AIzaSyDEReWNL61EYlVTTT6isiYn1EqRZTtd4bk`
            );
          }
        }
      );
    },

    initKeyboardShortcuts: function() {
      var that = this;
      Mousetrap.bind(['esc', 'backspace'], function(e) {
        that.cancelStreaming();
      });
    },

    unbindKeyboardShortcuts: function() {
      Mousetrap.unbind(['esc', 'backspace']);
    },
    minDetails: function () {
      var loading = $('.loading');
      var loadingBackground = $('.loading-background');
      var minimizeIcon = $('.minimize-icon');
      var maximizeIcon = $('.maximize-icon');

   if (minimizeIcon.css('visibility') === 'visible') {
      loading.css('height', '0px');
      loading.css('width', '0px');
      loading.css('float', 'right');
      loadingBackground.css('visibility', 'hidden');
      minimizeIcon.css('visibility', 'hidden');
      if (this.ddone === 'false') {
         maximizeIcon.css('visibility', 'visible');
      } else {
         maximizeIcon.css('visibility', 'visible');
      }
      $('.filter-bar').show();
   } else if ((maximizeIcon.css('visibility') === 'visible') || (maximizeIcon.css('visibility') === 'visible')) {
      loading.css('height', '100%');
      loading.css('width', '100%');
      loading.css('float', '');
      loadingBackground.css('visibility', 'visible');
      maximizeIcon.css('visibility', 'hidden');
      maximizeIcon.css('visibility', 'hidden');
      minimizeIcon.css('visibility', 'visible');
      $('.filter-bar').hide();
   } else {
   }
},
    onAttach: function() {
      $('.filter-bar').hide();
      $('#header').addClass('header-shadow');

      App.LoadingView = this;

      this.initKeyboardShortcuts();
    },

    onStateUpdate: function() {
      var self = this;
      var state = this.model.get('state');
      var streamInfo = this.model.get('streamInfo');
      win.info('Loading torrent:', state);

      this.ui.stateTextDownload.text(i18n.__(state));
      this.ui.stateTextFilename.text(streamInfo.get('filename'));
      this.ui.stateTextSize.text(Common.fileSize(streamInfo.get('size')));
      this.ui.stateTextDownloadedFormatted.text(Common.fileSize(streamInfo.get('downloaded')) + ' / ');
      this.listenTo(this.model.get('streamInfo'), 'change', this.onInfosUpdate);

      if (state === 'downloading') {
        this.listenTo(
          this.model.get('streamInfo'),
          'change:downloaded',
          this.onProgressUpdate
        );
      }

      if (state === 'playingExternally') {
        this.ui.stateTextDownload.hide();
        this.ui.progressbar.hide();
        if (streamInfo && streamInfo.get('device')) {
          this.ui.vpn.css('display', 'none');
          this.ui.cancel_button.css('visibility', 'hidden');
          this.ui.controls.css('visibility', 'visible');
          this.ui.playingbarBox.css('visibility', 'visible');
          this.ui.playingbar.css('width', '0%');

          // Update gui on status update.
          // uses listenTo so event is unsubscribed automatically when loading view closes.
          this.listenTo(App.vent, 'device:status', this.onDeviceStatus);
        }
        // The 'downloading' state is not always sent, eg when playing canceling and replaying
        // Start listening here instead when playing externally
        this.listenTo(
          this.model.get('streamInfo'),
          'change:downloaded',
          this.onProgressUpdate
        );
      }
    },

    onInfosUpdate: function() {
      var streamInfo = this.model.get('streamInfo');

      this.ui.seedStatus.css('visibility', 'visible');

      if (streamInfo.get('size') && !this.firstUpdate) {
        this.ui.loadingInfos.hide();
        this.checkFreeSpace(streamInfo.get('size'));
        this.firstUpdate = true;
      }

      if (streamInfo.get('backdrop')) {
        $('.loading-backdrop').css(
          'background-image',
          'url(' + streamInfo.get('backdrop') + ')'
        );
      }
      if (streamInfo.get('title') !== '') {
        this.ui.title.html(streamInfo.get('title'));
      }
      if (
        streamInfo.get('player') &&
        streamInfo.get('player').get('type') !== 'local'
      ) {
        this.ui.player.text(streamInfo.get('player').get('name'));
        this.ui.streaming.css('visibility', 'visible');
      }
    },

    onProgressUpdate: function () {
    var streamInfo = this.model.get('streamInfo');

    var downloaded = streamInfo.get('downloaded') / (1024 * 1024);
    this.ui.progressTextDownload.text(downloaded.toFixed(2) + ' Mb');

    if (streamInfo.get('downloaded') < streamInfo.get('size')) {
        this.ui.stateTextDownload.text(i18n.__('Downloading'));
        this.ui.stateTextDownloadedFormatted.text(Common.fileSize(streamInfo.get('downloaded')) + ' / ');
        this.ui.progressTextPeers.text(streamInfo.get('active_peers'));
        this.ui.progressTextSeeds.text(streamInfo.get('total_peers'));
        this.ui.downloadSpeed.text(streamInfo.get('downloadSpeed'));
        this.ui.stateTextRemaining.text(this.remainingTime());
    } else {
        this.ui.stateTextDownload.text(i18n.__('Downloaded'));
        this.ui.stateTextDownloadedFormatted.hide();
        this.ui.progressTextPeers.hide();
        this.ui.progressTextSeeds.hide();
        this.ui.downloadSpeed.hide();
        this.ui.stateTextRemaining.hide();
        $('#rbreak1,#rbreak2,#rbreak3').hide();
        $('#rdownl').hide();
        $('#ractpr').hide();
        if (this.ddone === 'false') {
            var cancelButton = $('.cancel-button');
            var maximizeIcon = $('.maximize-icon');

            this.ddone = 'true';
            cancelButton.css('background-color', '#27ae60');
            cancelButton.css('left', '-45px');
            if (Settings.activateLoCtrl === false) {
                $('.open-button').css('visibility', 'visible').css('display', 'block');
            } else if (Settings.activateLoCtrl === true) {
                $('.open-button').css('visibility', 'visible').css('display', 'none');
            }
            if (maximizeIcon.css('visibility') === 'visible') {
                maximizeIcon.css('visibility', 'visible');
                maximizeIcon.css('visibility', 'hidden');
            }
            this.listenTo(this.model.get('streamInfo'), 'change:uploadSpeed', this.onProgressUpdate);
        }
    }

    this.ui.bufferPercent.text(streamInfo.get('downloadedPercent').toFixed() + '%');
    this.ui.uploadSpeed.text(streamInfo.get('uploadSpeed'));

    this.ui.loadingInfos.show();

    if (this.model.get('state') === 'playingExternally') {
        this.ui.bufferPercent.text(streamInfo.get('downloadedPercent').toFixed() + '%');
    }
},

    onDeviceStatus: function(status) {
      if (status.media !== undefined && status.media.duration !== undefined) {
        // Update playingbar width
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
        // First PLAYING state. Start requesting device status update every 5 sec
        this.extPlayerStatusUpdater = setInterval(function() {
          App.vent.trigger('device:status:update');
        }, 5000);
      }
      if (this.extPlayerStatusUpdater && status.playerState === 'IDLE') {
        // Media started streaming and is now finished playing
        this.cancelStreaming();
      }
    },

    cancelStreaming: function() {
      // call stop if we play externally
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
              $('.show-pcontrols').removeClass('fa-angle-down').addClass('fa-angle-up').tooltip('hide').attr('data-original-title', 'Hide playback controls');
              this.ui.cancel_button.css('display', 'none');
              $('.open-button').css('display', 'none');
              this.ui.controls.css('display', 'block');
              this.ui.playingbarBox.css('display', 'block');
          } else if (Settings.activateLoCtrl === true) {
              AdvSettings.set('activateLoCtrl', false);
              $('.show-pcontrols').removeClass('fa-angle-up').addClass('fa-angle-down').tooltip('hide').attr('data-original-title', 'Show playback controls');
              this.ui.cancel_button.css('display', 'block');
              $('.open-button').css('display', 'block');
              this.ui.controls.css('display', 'none');
              this.ui.playingbarBox.css('display', 'none');
          }
      },

      tempf: function (e) {
          nw.Shell.openExternal(Settings.tmpLocation);
      },

      filenameovrflsh: function () {
          $('.text_filename').css('overflow', 'visible');
      },

      filenameovrflhd: function () {
          $('.text_filename').css('overflow', 'hidden');
      },
      remainingTime: function () {
    var streamInfo = this.model.get('streamInfo');
    var timeLeft = streamInfo.get('time_left');

    if (timeLeft === undefined) {
        return i18n.__('Unknown time remaining');
    } else if (timeLeft > 3600) {
        return i18n.__('%s hour(s) remaining', Math.round(timeLeft / 3600));
    } else if (timeLeft > 60) {
        return i18n.__('%s minute(s) remaining', Math.round(timeLeft / 60));
    } else if (timeLeft <= 60) {
        return i18n.__('%s second(s) remaining', timeLeft);
    }
},

titletoclip: function (e) {
    if ((e.button === 2) && ($('.minimize-icon').css('visibility') === 'visible')) {
        var streamInfo = this.model.get('streamInfo');
        var clipboard = nw.Clipboard.get();
        clipboard.set(streamInfo.get('title'), 'text');
        $('.notification_alert').text(i18n.__('The title was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
    }
},

filenametoclip: function (e) {
    if ((e.button === 2) && ($('.minimize-icon').css('visibility') === 'visible')) {
        var streamInfo = this.model.get('streamInfo');
        var clipboard = nw.Clipboard.get();
        clipboard.set(streamInfo.get('filename'), 'text');
        $('.notification_alert').text(i18n.__('The filename was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
    }
},

streamurltoclip: function (e) {
    if ((e.button === 2) && ($('.minimize-icon').css('visibility') === 'visible')) {
        var streamInfo = this.model.get('streamInfo');
        var clipboard = nw.Clipboard.get();
        clipboard.set(streamInfo.get('src').replace('127.0.0.1', Settings.ipAddress), 'text');
        $('.notification_alert').text(i18n.__('The stream url was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
    }
},
    pauseStreaming: function() {
      App.vent.trigger('device:pause');
      $('.pause')
        .removeClass('fa-pause')
        .removeClass('pause')
        .addClass('fa-play')
        .addClass('play');
    },

    resumeStreaming: function() {
      win.debug('Play triggered');
      App.vent.trigger('device:unpause');
      $('.play')
        .removeClass('fa-play')
        .removeClass('play')
        .addClass('fa-pause')
        .addClass('pause');
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
          stdoutParse =
            stdoutParse[stdoutParse.length - 1] !== ''
              ? stdoutParse[stdoutParse.length - 1]
              : stdoutParse[stdoutParse.length - 2];
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
      Mousetrap.bind('esc', function(e) {
        App.vent.trigger('show:closeDetail');
        App.vent.trigger('movie:closeDetail');
      });
    }
  });

  App.View.Loading = Loading;
})(window.App);
