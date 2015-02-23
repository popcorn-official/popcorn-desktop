var os = require('os');

(function (App) {
	'use strict';

	// use of darwin string instead of mac (mac os x returns darwin as platform)
	var ButtonOrder = {
		'win32': ['min', 'max', 'close'],
		'darwin': ['close', 'min', 'max'],
		'linux': ['min', 'max', 'close']
	};

	// workaround/patch until node-webkit and windows 8 maximise/unmaximize works correctly
	// vars initialised by first maximise call
	var win8x, win8y, win8h, win8w;

	var TitleBar = Backbone.Marionette.ItemView.extend({
		template: '#header-tpl',

		events: {
			'click .btn-os.os-max': 'maximize',
			'click .btn-os.os-min': 'minimize',
			'click .btn-os.os-close': 'closeWindow',
			'click .btn-os.fullscreen': 'toggleFullscreen'
		},

		initialize: function () {
			this.nativeWindow = require('nw.gui').Window.get();
		},

		templateHelpers: {
			getButtons: function () {
				return ButtonOrder[App.Config.platform];
			},

			fsTooltipPos: function () {
				return App.Config.platform === 'darwin' ? 'left' : 'right';
			},

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
				// workaround/patch until node-webkit and windows 8 maximise/unmaximize works correctly
				if (process.platform === 'win32' && parseFloat(os.release(), 10) > 6.1) {
					if (window.screen.availHeight <= this.nativeWindow.height) {
						// unmaximise replacement
						this.nativeWindow.resizeTo(win8w, win8h);
						this.nativeWindow.moveTo(win8x, win8y);
						$('.os-max').removeClass('os-is-max');
					} else {
						// maximise replacement - always happens first as we start in a window
						win8x = this.nativeWindow.x;
						win8y = this.nativeWindow.y;
						win8h = this.nativeWindow.height;
						win8w = this.nativeWindow.width;
						$('.os-max').addClass('os-is-max');

						// does not support multiple monitors - will always use primary
						this.nativeWindow.moveTo(0, 0);
						this.nativeWindow.resizeTo(window.screen.availWidth, window.screen.availHeight);
					}
				} else {
					// end patch
					if (window.screen.availHeight <= this.nativeWindow.height) {
						this.nativeWindow.unmaximize();
						if (process.platform === 'win32') {
							$('.os-max').removeClass('os-is-max');
						}
					} else {
						this.nativeWindow.maximize();
						if (process.platform === 'win32') {
							$('.os-max').addClass('os-is-max');
						}
					}
				}
			}
		},

		minimize: function () {
			this.nativeWindow.minimize();
		},

		closeWindow: function () {
			this.nativeWindow.close();
		},

		toggleFullscreen: function () {
			win.toggleFullscreen();
			if (this.nativeWindow.isFullscreen) {
				$('.os-min, .os-max').css('display', 'none');
			} else {
				$('.os-min, .os-max').css('display', 'block');
			}
			this.$el.find('.btn-os.fullscreen').toggleClass('active');
		},

		onShow: function () {
			$('.tooltipped').tooltip({
				delay: {
					'show': 800,
					'hide': 100
				}
			});
		}

	});

	App.View.TitleBar = TitleBar;
})(window.App);
