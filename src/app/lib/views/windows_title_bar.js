(function (App) {
  'use strict';
  var WindowsTitleBar = Marionette.View.extend({
    // Dirty way of getting proper value before app database initializes
    template: pkJson.window.frame ? false : '#win-header-tpl',

    events: {
      'click .window-minimize': 'minimize',
      'click .window-maximize': 'maximize',
      'click .window-close': 'closeWindow'
    },

    initialize: function () {
      if (Settings.nativeWindowFrame) {
        return;
      }

      this.nativeWindow = win;

      this.nativeWindow.on('maximize', function () {
        $('.window-maximize').addClass('window-umaximize');
      });

      this.nativeWindow.on('restore', function () {
        $('.window-maximize').removeClass('window-umaximize');
      });
    },

    templateContext: {
      events: function () {
        var date = new Date();
        var today = ('0' + (date.getMonth() + 　1)).slice(-2) + ('0' + (date.getDate())).slice(-2);
        if (today === '1231' || today === '0101') {
          return 'newyear';
        } else if (today >= '1218' || today <= '0103') {
          return 'xmas';
        } else if (today >= '1027' && today <= '1103') {
          return 'halloween';
        } else if (today === '0220') {
          return 'pt_anniv';
        } else if (today === '0214') {
          return 'stvalentine';
        } else if (today === '0317') {
          return 'stpatrick';
        } else if (today === '0401') {
          return 'aprilsfool';
        }
      } 
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
