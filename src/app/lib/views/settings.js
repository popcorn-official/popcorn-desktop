(function (App) {
	'use strict';
	var clipboard = gui.Clipboard.get();

	var AdmZip = require('adm-zip');
	var fdialogs = require('node-webkit-fdialogs');
	var fs = require('fs');
	var waitComplete;
	var oldTmpLocation;

	var that;

	var Settings = Backbone.Marionette.ItemView.extend({
		template: '#settings-container-tpl',
		className: 'settings-container-contain',

		ui: {
			success_alert: '.success_alert',
			fakeTempDir: '#faketmpLocation',
			tempDir: '#tmpLocation',
		},

		events: {
			'click .keyboard': 'showKeyboard',
			'click .help': 'showHelp',
			'click .close-icon': 'closeSettings',
			'change select,input': 'saveSetting',
			'contextmenu input': 'rightclick_field',
			'click .flush-bookmarks': 'flushBookmarks',
			'click .flush-databases': 'flushAllDatabase',
			'click .flush-subtitles': 'flushAllSubtitles',
			'click #faketmpLocation': 'showCacheDirectoryDialog',
			'click .default-settings': 'resetSettings',
			'click .open-tmp-folder': 'openTmpFolder',
			'click .open-database-folder': 'openDatabaseFolder',
			'click .export-database': 'exportDatabase',
			'click .import-database': 'inportDatabase',
			'keyup #traktUsername': 'checkTraktLogin',
			'keyup #traktPassword': 'checkTraktLogin',
			'click #unauthTrakt': 'disconnectTrakt',
			'change #tmpLocation': 'updateCacheDirectory',
			'click #syncTrakt': 'syncTrakt',
			'click .qr-code': 'generateQRcode',
			'click #qrcode-overlay': 'closeModal',
			'click #qrcode-close': 'closeModal'
		},

		onShow: function () {

			this.render();

			$('.filter-bar').hide();
			$('#movie-detail').hide();
			$('#header').addClass('header-shadow');
			$('.tooltipped').tooltip({
				delay: {
					'show': 800,
					'hide': 100
				}
			});
			Mousetrap.bind('backspace', function (e) {
				App.vent.trigger('settings:close');
			});
			that = this;

			AdvSettings.set('ipAddress', this.getIPAddress());
		},

		onRender: function () {
			if (App.settings.showAdvancedSettings) {
				$('.advanced').css('display', 'flex');
			}
			oldTmpLocation = $('#faketmpLocation').val();
		},

		rightclick_field: function (e) {
			e.preventDefault();
			var menu = new this.context_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'), e.target.id);
			menu.popup(e.originalEvent.x, e.originalEvent.y);
		},

		context_Menu: function (cutLabel, copyLabel, pasteLabel, field) {
			var gui = require('nw.gui'),
				menu = new gui.Menu(),

				cut = new gui.MenuItem({
					label: cutLabel || 'Cut',
					click: function () {
						document.execCommand('cut');
					}
				}),

				copy = new gui.MenuItem({
					label: copyLabel || 'Copy',
					click: function () {
						document.execCommand('copy');
					}
				}),

				paste = new gui.MenuItem({
					label: pasteLabel || 'Paste',
					click: function () {
						var text = clipboard.get('text');
						$('#' + field).val(text);
					}
				});

			menu.append(cut);
			menu.append(copy);
			menu.append(paste);

			return menu;
		},
		onClose: function () {
			Mousetrap.bind('backspace', function (e) {
				App.vent.trigger('show:closeDetail');
				App.vent.trigger('movie:closeDetail');
			});
			$('.filter-bar').show();
			$('#header').removeClass('header-shadow');
			$('#movie-detail').show();
			clearInterval(waitComplete);
		},

		closeSettings: function () {
			App.vent.trigger('settings:close');
		},

		generateQRcode: function () {

			var QRCodeInfo = {
				ip: AdvSettings.get('ipAddress'),
				port: $('#httpApiPort').val(),
				user: $('#httpApiUsername').val(),
				pass: $('#httpApiPassword').val()
			};
			var qrcodecanvus = document.getElementById('qrcode');
			qrcodecanvus.width = qrcodecanvus.width;
			$('#qrcode').qrcode({
				'text': JSON.stringify(QRCodeInfo)
			});
			$('#qrcode-modal, #qrcode-overlay').fadeIn(500);
		},

		closeModal: function () {
			$('#qrcode-modal, #qrcode-overlay').fadeOut(500);
		},

		showHelp: function () {
			App.vent.trigger('help:toggle');
		},

		showKeyboard: function () {
			App.vent.trigger('keyboard:toggle');
		},

		saveSetting: function (e) {
			var value = false;
			var data = {};

			// get active field
			var field = $(e.currentTarget);

			var apiDataChanged = false;
			var tmpLocationChanged = false;
			switch (field.attr('name')) {
			case 'httpApiPort':
				apiDataChanged = true;
				value = parseInt(field.val());
				break;
			case 'tvshowAPI':
				value = field.val();
				if (value.substr(-1) !== '/') {
					value += '/';
				}
				if (value.substr(0, 8) !== 'https://' && value.substr(0, 7) !== 'http://') {
					value = 'http://' + value;
				}
				value = {
					url: value,
					index: 0,
					proxies: ['']
				};
				break;
			case 'subtitle_size':
			case 'tv_detail_jump_to':
			case 'subtitle_language':
			case 'subtitle_decoration':
			case 'movies_quality':
			case 'subtitle_font':
			case 'start_screen':
				if ($('option:selected', field).val() === 'Last Open') {
					AdvSettings.set('lastTab', App.currentview);
				}
				/* falls through */
			case 'watchedCovers':
			case 'theme':
				value = $('option:selected', field).val();
				break;
			case 'language':
				value = $('option:selected', field).val();
				i18n.setLocale(value);
				break;
			case 'moviesShowQuality':
			case 'deleteTmpOnClose':
			case 'coversShowRating':
			case 'showAdvancedSettings':
			case 'alwaysOnTop':
			case 'syncOnStart':
			case 'playNextEpisodeAuto':
			case 'automaticUpdating':
			case 'events':
			case 'alwaysFullscreen':
			case 'allowTorrentStorage':
				value = field.is(':checked');
				break;
			case 'httpApiUsername':
			case 'httpApiPassword':
				apiDataChanged = true;
				value = field.val();
				break;
			case 'connectionLimit':
			case 'dhtLimit':
			case 'streamPort':
			case 'subtitle_color':
				value = field.val();
				break;
			case 'traktUsername':
			case 'traktPassword':
				return;
			case 'tmpLocation':
				tmpLocationChanged = true;
				value = path.join(field.val(), 'Popcorn-Time');
				break;
			case 'vpnDisabledPerm':
				$('.vpn-connect').toggle();
				value = field.is(':checked');
				break;
			default:
				win.warn('Setting not defined: ' + field.attr('name'));
			}
			win.info('Setting changed: ' + field.attr('name') + ' - ' + value);


			// update active session
			App.settings[field.attr('name')] = value;

			if (apiDataChanged) {
				App.vent.trigger('initHttpApi');
			}

			// move tmp folder safely
			if (tmpLocationChanged) {
				that.moveTmpLocation(value);
			}

			//save to db
			App.db.writeSetting({
					key: field.attr('name'),
					value: value
				})
				.then(function () {
					that.ui.success_alert.show().delay(3000).fadeOut(400);
				});
			that.syncSetting(field.attr('name'), value);
		},
		syncSetting: function (setting, value) {

			switch (setting) {
			case 'coversShowRating':
				if (value) {
					$('.rating').show();
				} else {
					$('.rating').hide();
				}
				break;
			case 'moviesShowQuality':
				if (value) {
					$('.quality').show();
				} else {
					$('.quality').hide();
				}
				break;
			case 'showAdvancedSettings':
				if (value) {
					$('.advanced').css('display', 'flex');
				} else {
					$('.advanced').css('display', 'none');
				}
				break;
			case 'language':
			case 'watchedCovers':
				App.vent.trigger('movies:list');
				App.vent.trigger('settings:show');
				break;
			case 'alwaysOnTop':
				win.setAlwaysOnTop(value);
				break;
			case 'theme':
				$('link#theme').attr('href', 'themes/' + value + '.css');
				App.vent.trigger('updatePostersSizeStylesheet');
				break;
			case 'start_screen':
				AdvSettings.set('startScreen', value);
				break;
			case 'events':
				if ($('.events').css('display') === 'none') {
					$('.events').css('display', 'block');
				} else {
					$('.events').css('display', 'none');
				}
				break;
			case 'allowTorrentStorage':
				if ($('#torrent_col').css('display') === 'none') {
					$('#torrent_col').css('display', 'block');
				} else {
					$('#torrent_col').css('display', 'none');
					App.vent.trigger('torrentCollection:close');
				}
				break;
			case 'movies_quality':
				App.Providers.delete('Yts');
				App.vent.trigger('movies:list');
				App.vent.trigger('settings:show');
				break;
			case 'tvshowAPI':
				App.Providers.delete('Eztv');
				App.vent.trigger('movies:list');
				App.vent.trigger('settings:show');
				break;
			default:
			}

		},
		checkTraktLogin: _.debounce(function (e) {
			var self = this;
			var username = document.querySelector('#traktUsername').value;
			var password = document.querySelector('#traktPassword').value;

			if (username === '' || password === '') {
				return;
			}

			$('.invalid-cross').hide();
			$('.valid-tick').hide();
			$('.loading-spinner').show();
			// trakt.authenticate automatically saves the username and pass on success!
			App.Trakt.authenticate(username, password).then(function (valid) {
				$('.loading-spinner').hide();
				// Stop multiple requests interfering with each other
				$('.invalid-cross').hide();
				$('.valid-tick').hide();
				if (valid) {
					$('.valid-tick').show().delay(2000).queue(function () {
						self.render().dequeue;
					});
				} else {
					$('.invalid-cross').show();
				}
			}).catch(function (err) {
				$('.loading-spinner').hide();
				$('.invalid-cross').show();
			});
		}, 750),

		disconnectTrakt: function (e) {
			var self = this;

			App.settings['traktUsername'] = '';
			App.settings['traktPassword'] = '';
			App.Trakt.authenticated = false;

			App.db.writeSetting({
					key: 'traktUsername',
					value: ''
				})
				.then(function () {
					return App.db.writeSetting({
						key: 'traktPassword',
						value: ''
					});
				})
				.then(function () {
					self.ui.success_alert.show().delay(3000).fadeOut(400);
				});

			_.defer(function () {
				App.Trakt = App.Providers.get('Trakttv');
				self.render();
			});
		},

		flushBookmarks: function (e) {
			var that = this;
			var btn = $(e.currentTarget);

			if (!that.areYouSure(btn, i18n.__('Flushing bookmarks...'))) {
				return;
			}

			that.alertMessageWait(i18n.__('We are flushing your database'));

			Database.deleteBookmarks()
				.then(function () {
					that.alertMessageSuccess(true);
				});
		},

		resetSettings: function (e) {
			var that = this;
			var btn = $(e.currentTarget);

			if (!that.areYouSure(btn, i18n.__('Resetting...'))) {
				return;
			}

			that.alertMessageWait(i18n.__('We are resetting the settings'));

			Database.resetSettings()
				.then(function () {
					that.alertMessageSuccess(true);
					AdvSettings.set('disclaimerAccepted', 1);
				});
		},

		flushAllDatabase: function (e) {
			var that = this;
			var btn = $(e.currentTarget);

			if (!that.areYouSure(btn, i18n.__('Flushing...'))) {
				return;
			}

			that.alertMessageWait(i18n.__('We are flushing your databases'));

			Database.deleteDatabases()
				.then(function () {
					that.alertMessageSuccess(true);
				});
		},

		flushAllSubtitles: function (e) {
			var that = this;
			var btn = $(e.currentTarget);

			if (!that.areYouSure(btn, i18n.__('Flushing...'))) {
				return;
			}

			that.alertMessageWait(i18n.__('We are flushing your subtitle cache'));

			var cache = new App.Cache('subtitle');
			cache.flushTable()
				.then(function () {

					that.alertMessageSuccess(false, btn, i18n.__('Flush subtitles cache'), i18n.__('Subtitle cache deleted'));

				});
		},

		restartApplication: function () {
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
		},

		showCacheDirectoryDialog: function () {
			var that = this;
			that.ui.tempDir.click();
		},

		openTmpFolder: function () {
			win.debug('Opening: ' + App.settings['tmpLocation']);
			gui.Shell.openItem(App.settings['tmpLocation']);
		},

		moveTmpLocation: function (location) {
			if (!fs.existsSync(location)) {
				fs.mkdir(location);
			}
			if (App.settings['deleteTmpOnClose']) {
				deleteFolder(oldTmpLocation);
			} else {
				$('.notification_alert').show().text(i18n.__('You should save the content of the old directory, then delete it')).delay(5000).fadeOut(400);
				gui.Shell.openItem(oldTmpLocation);
			}
		},

		openDatabaseFolder: function () {
			win.debug('Opening: ' + App.settings['databaseLocation']);
			gui.Shell.openItem(App.settings['databaseLocation']);
		},

		exportDatabase: function (e) {
			var that = this;
			var zip = new AdmZip();
			var btn = $(e.currentTarget);
			var databaseFiles = fs.readdirSync(App.settings['databaseLocation']);

			databaseFiles.forEach(function (entry) {
				zip.addLocalFile(App.settings['databaseLocation'] + '/' + entry);
			});

			fdialogs.saveFile(zip.toBuffer(), function (err, path) {
				that.alertMessageWait(i18n.__('Exporting Database...'));
				win.info('Database exported to:', path);
				that.alertMessageSuccess(false, btn, i18n.__('Export Database'), i18n.__('Database Successfully Exported'));
			});

		},

		inportDatabase: function () {
			var that = this;

			fdialogs.readFile(function (err, content, path) {

				that.alertMessageWait(i18n.__('Importing Database...'));

				try {
					var zip = new AdmZip(content);

					zip.extractAllTo(App.settings['databaseLocation'] + '/', /*overwrite*/ true);
					that.alertMessageSuccess(true);
				} catch (err) {

					that.alertMessageFailed(i18n.__('Invalid PCT Database File Selected'));
					win.warn('Failed to Import Database');
				}


			});


		},

		updateCacheDirectory: function (e) {
			// feel free to improve/change radically!
			var that = this;
			var field = $('#tmpLocation');
			that.ui.fakeTempDir.val = field.val();
			that.render();
		},

		areYouSure: function (btn, waitDesc) {
			if (!btn.hasClass('confirm')) {
				btn.addClass('confirm').css('width', btn.css('width')).text(i18n.__('Are you sure?'));
				return false;
			}
			btn.text(waitDesc).addClass('disabled').prop('disabled', true);
			return true;
		},

		alertMessageWait: function (waitDesc) {
			var $el = $('#notification');

			$el.removeClass().addClass('red').show();
			$el.html('<h1>' + i18n.__('Please wait') + '...</h1><p>' + waitDesc + '.</p>');

			$('body').addClass('has-notification');
		},

		alertMessageSuccess: function (btnRestart, btn, btnText, successDesc) {
			var that = this;
			var $el = $('#notification');

			$el.removeClass().addClass('green');
			$el.html('<h1>' + i18n.__('Success') + '</h1>');

			if (btnRestart) {
				// Add restart button
				$el.append('<p>' + i18n.__('Please restart your application') + '.</p><span class="btn-grp"><a class="btn restart">' + i18n.__('Restart') + '</a></span>');
				$('.btn.restart').on('click', function () {
					that.restartApplication();
				});
			} else {
				// Hide notification after 2 seconds
				$el.append('<p>' + successDesc + '.</p>');
				setTimeout(function () {
					btn.text(btnText).removeClass('confirm disabled').prop('disabled', false);
					$('body').removeClass('has-notification');
					$el.hide();
				}, 3000);
			}
		},

		alertMessageFailed: function (errorDesc) {

			var $el = $('#notification');

			$el.html('<h1>' + i18n.__('Error') + '</h1>');

			// Hide notification after 5 seconds
			$el.append('<p>' + errorDesc + '.</p>');
			setTimeout(function () {

				$('body').removeClass('has-notification');
				$el.hide();

			}, 5000);

		},

		syncTrakt: function () {

			var oldHTML = document.getElementById('syncTrakt').innerHTML;
			$('#syncTrakt').text(i18n.__('Syncing...')).addClass('disabled').prop('disabled', true);

			App.Trakt.sync()
				.then(function () {
					$('#syncTrakt').text(i18n.__('Done')).removeClass('disabled').addClass('green').delay(3000).queue(function () {
						$('#syncTrakt').removeClass('green').prop('disabled', false);
						document.getElementById('syncTrakt').innerHTML = oldHTML;
						$('#syncTrakt').dequeue();
					});
				})
				.catch(function (err) {
					win.error(err);
					$('#syncTrakt').text(i18n.__('Error')).removeClass('disabled').addClass('red').delay(3000).queue(function () {
						$('#syncTrakt').removeClass('red').prop('disabled', false);
						document.getElementById('syncTrakt').innerHTML = oldHTML;
						$('#syncTrakt').dequeue();
					});
				});
		},

		getIPAddress: function () {
			var ip, alias = 0;
			var ifaces = require('os').networkInterfaces();
			for (var dev in ifaces) {
				ifaces[dev].forEach(function (details) {
					if (details.family === 'IPv4') {
						if (!/(loopback|vmware|internal|hamachi|vboxnet)/gi.test(dev + (alias ? ':' + alias : ''))) {
							if (details.address.substring(0, 8) === '192.168.' ||
								details.address.substring(0, 7) === '172.16.' ||
								details.address.substring(0, 5) === '10.0.'
							) {
								ip = details.address;
								++alias;
							}
						}
					}
				});
			}
			return ip;
		}
	});

	App.View.Settings = Settings;
})(window.App);
