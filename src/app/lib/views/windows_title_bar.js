(function (App) {
  'use strict';
  var WindowsTitleBar = Marionette.View.extend({
    template: '#win-header-tpl',

    events: {
      'click .window-minimize': 'minimize',
      'click .window-maximize': 'maximize',
      'click .window-close': 'closeWindow'
    },

    initialize: function () {
      this.nativeWindow = win;

      this.nativeWindow.on('maximize', function () {
        $('.window-maximize').addClass('window-umaximize');
      });

      this.nativeWindow.on('restore', function () {
        $('.window-maximize').removeClass('window-umaximize');
      });
    },

    maximize: function () {
      if (this.nativeWindow.isFullscreen) {
        this.nativeWindow.toggleFullscreen();
      } else {
        if (window.screen.availHeight <= this.nativeWindow.height) {
          this.nativeWindow.restore();
          if (process.platform === 'win32') {
            $('.window-maximize').removeClass('window-umaximize');
          }
        } else {
          this.nativeWindow.maximize();
          if (process.platform === 'win32') {
            $('.window-maximize').addClass('window-umaximize');
          }
        }
      }
    },

    minimize: function () {
      var that = this.nativeWindow;
      if (AdvSettings.get('minimizeToTray')) {
        minimizeToTray();
      } else {
        that.minimize();
      }
    },

    closeWindow: function () {
      this.nativeWindow.close();
    },

    onAttach: function () {
      $('.tooltipped').tooltip({
        delay: {
          'show': 800,
          'hide': 100
        }
      });
    }
  });

  App.View.WindowsTitleBar = WindowsTitleBar;
})(window.App);