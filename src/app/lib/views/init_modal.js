(function (App) {
	'use strict';
	var fixer;
	var InitModal = Backbone.Marionette.ItemView.extend({
		template: '#initializing-tpl',
		className: 'init-container',

		ui: {
			initstatus: '.init-status',
			initbar: '#initbar-contents',
			waitingblock: '#waiting-block'
		},

		events: {
			'click .fixApp': 'fixApp',
		},

		initialize: function () {
			win.info('Loading DB');
		},

		onShow: function () {
			var self = this;

			this.ui.initbar.animate({
				width: '25%'
			}, 1000, 'swing');
			this.ui.initstatus.text(i18n.__('Status: Checking Database...'));

			fixer = setTimeout(function () {
				self.ui.waitingblock.show();
			}, 7000);
		},

		onClose: function () {
			clearTimeout(fixer);
		},

		fixApp: function (e) {

			e.preventDefault();

			var cache = new App.Cache('subtitle');
			cache.flushTable()
				.then(function () {

					Database.deleteDatabases()
						.then(function () {
							var spawn = require('child_process').spawn,
								argv = gui.App.fullArgv,
								CWD = process.cwd();

							argv.push(CWD);
							spawn(process.execPath, argv, {
								cwd: CWD,
								detached: true,
								stdio: ['ignore', 'ignore', 'ignore']
							}).unref();
							gui.App.quit();

						});
				});

		},

	});

	App.View.InitModal = InitModal;
})(window.App);
