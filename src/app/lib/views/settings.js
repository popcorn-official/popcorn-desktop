(function(App) {
	'use strict';

	var sha1 = require('sha1'); // Crypto doesn't work with field.val(), that's why sha1 is needed
	var trakt = null;

	var Settings = Backbone.Marionette.ItemView.extend({
		template: '#settings-container-tpl',
		className: 'settings-container-contain',

		ui: {
			success_alert: '.success_alert',
			fakeTempDir: '#faketmpLocation',
			tempDir: '#tmpLocation',
		},

		events: {
			'click .close': 'closeSettings',
			'change select,input': 'saveSetting',
			'click .flush-bookmarks': 'flushBookmarks',
			'click .flush-databases': 'flushAllDatabase',
			'click .flush-subtitles': 'flushAllSubtitles',
			'click .test-trakt-login': 'testTraktLogin',
			'click #faketmpLocation' : 'showCacheDirectoryDialog',
			'click .default-settings' : 'resetSettings',
			'change #tmpLocation' : 'updateCacheDirectory',
		},

		onShow: function() {
			$('.filter-bar').hide();    
			$('#movie-detail').hide();
			Mousetrap.bind('esc', function(e) {
				App.vent.trigger('settings:close');
			});
		},

		onClose: function() {
			$('.filter-bar').show();    
			$('#movie-detail').show();
		},
		showCover: function() {},

		closeSettings: function() {
			App.vent.trigger('settings:close');     
		},

		saveSetting: function(e){
			var that = this;
			var value = false;
			var data = {};

			// get active field
			var field = $(e.currentTarget);
			
			switch(field.attr('name')){
			case 'tvshowApiEndpoint':
				value = field.val();
				if (value.substr(-1) !== '/') {
					value += '/';
				}
				break;
			case 'subtitle_size':
			case 'subtitle_language':
			case 'movies_quality':
				value = $('option:selected', field).val();
				break;
			case 'language':
				value = $('option:selected', field).val();
				i18n.setLocale(value);
				break;
			case 'moviesShowQuality':
			case 'deleteTmpOnClose':
				value = field.is(':checked');
				break;
			case 'connectionLimit':
			case 'dhtLimit':
			case 'streamPort':
				value = field.val();
				break;
			case 'traktUsername':
				$('.test-trakt-login').removeClass('red').removeClass('green').text(i18n.__('Test Login'));
				value = field.val();
				break;
			case 'tmpLocation':
				value = path.join(field.val(), 'Popcorn-Time');
				break;
			case 'traktPassword':
				$('.test-trakt-login').removeClass('red').removeClass('green').text(i18n.__('Test Login'));
				value = sha1(field.val());
				break;
			default:
				win.warn('Setting not defined: '+field.attr('name'));
			}
			win.info('Setting changed: ' + field.attr('name') + ' - ' + value);
			
			// update active session
			App.settings[field.attr('name')] = value;

			//save to db
			App.db.writeSetting({key: field.attr('name'), value: value}, function() {
				that.ui.success_alert.show().delay(3000).fadeOut(400);
			});
		},

		testTraktLogin: function(e) {
			if(trakt === null) {
				trakt = new (App.Config.getProvider('metadata'))();
			}
			var btn = $(e.currentTarget);
			btn.text( i18n.__('Testing...') ).addClass('disabled').prop('disabled',true);
			var that = this;

			trakt.testLogin({
				username: App.settings.traktUsername,
				password: App.settings.traktPassword
			}, function(success) {
				if(success) {
					btn.removeClass('disabled').prop('disabled', false).addClass('green').text(i18n.__('Success!'));
				}
				else {
					btn.removeClass('disabled').prop('disabled', false).addClass('red').text(i18n.__('Failed!'));
				}
			});
		},

		flushBookmarks: function(e) {
			var btn = $(e.currentTarget);
			if(!btn.hasClass('confirm')){
				btn.addClass('confirm').css('width',btn.css('width')).text( i18n.__('Are you sure?') );
				return;
			}
			btn.text( i18n.__('Flushing bookmarks...') ).addClass('disabled').prop('disabled',true);
			var that = this;

			// we build our notification
			var $el = $('#notification');
			$el.html(
				'<h1>' + i18n.__('Please wait') + '...</h1>'   +
				'<p>' + i18n.__('We are flushing your database') + '.</p>'
			).addClass('red');

			// enable the notification on current view
			$('body').addClass('has-notification');

			Database.deleteBookmarks(function(err, setting) {

				// ask user to restart (to be sure)
				$el.html(
					'<h1>' + i18n.__('Success') + '</h1>'   +
					'<p>' + i18n.__('Please restart your application') + '.</p>' +
					'<span class=\'btn-grp\'>'                        +
						'<a class=\'btn restart\'>' + i18n.__('Restart') + '</a>'    +
					'</span>'
				).removeClass().addClass('green');

				// add restart button function
				var $restart = $('.btn.restart');
				$restart.on('click', function() {
					that.restartApplication();
				});

			});
		},

		resetSettings: function(e) {
			var btn = $(e.currentTarget);
			if(!btn.hasClass('confirm')){
				btn.addClass('confirm').css('width',btn.css('width')).text( i18n.__('Are you sure?') );
				return;
			}
			btn.text( i18n.__('Resetting...') ).addClass('disabled').prop('disabled',true);
			var that = this;

			// we build our notification
			var $el = $('#notification');
			$el.html(
				'<h1>' + i18n.__('Please wait') + '...</h1>'   +
				'<p>' + i18n.__('We are resetting the settings') + '.</p>'
			).addClass('red');

			// enable the notification on current view
			$('body').addClass('has-notification');

			Database.resetSettings(function(err, setting) {

				// ask user to restart (to be sure)
				$el.html(
					'<h1>' + i18n.__('Success') + '</h1>'   +
					'<p>' + i18n.__('Please restart your application') + '.</p>' +
					'<span class=\'btn-grp\'>'                        +
						'<a class=\'btn restart\'>' + i18n.__('Restart') + '</a>'    +
					'</span>'
				).removeClass().addClass('green');

				// add restart button function
				var $restart = $('.btn.restart');
				$restart.on('click', function() {
					that.restartApplication();
				});

			});
		},

		flushAllDatabase: function(e) {
			var btn = $(e.currentTarget);
			if(!btn.hasClass('confirm')){
				btn.addClass('confirm').css('width',btn.css('width')).text( i18n.__('Are you sure?') );
				return;
			}
			btn.text( i18n.__('Flushing...') ).addClass('disabled').prop('disabled',true);
			var that = this;

			// we build our notification
			var $el = $('#notification');
			$el.html(
				'<h1>' + i18n.__('Please wait') + '...</h1>'   +
				'<p>' + i18n.__('We are flushing your databases') + '.</p>'
			).addClass('red');

			// enable the notification on current view
			$('body').addClass('has-notification');

			Database.deleteDatabases(function(err, setting) {

				// ask user to restart (to be sure)
				$el.html(
					'<h1>' + i18n.__('Success') + '</h1>'   +
					'<p>' + i18n.__('Please restart your application') + '.</p>' +
					'<span class=\'btn-grp\'>'                        +
						'<a class=\'btn restart\'>' + i18n.__('Restart') + '</a>'    +
					'</span>'
				).removeClass().addClass('green');

				// add restart button function
				var $restart = $('.btn.restart');
				$restart.on('click', function() {
					that.restartApplication();
				});

			});
		},

		restartApplication: function() {
			var spawn = require('child_process').spawn,
				argv = gui.App.fullArgv,
				CWD = process.cwd();
					
			argv.push(CWD);
			spawn(process.execPath, argv, { cwd: CWD, detached: true, stdio: [ 'ignore', 'ignore', 'ignore' ] }).unref();
			gui.App.quit();            
		},

		showCacheDirectoryDialog : function()
		{
			var that = this;
			that.ui.tempDir.click();
		},

		updateCacheDirectory : function(e)
		{
			// feel free to improve/change radically!
			var that = this;
			var field = $('#tmpLocation');
			that.ui.fakeTempDir.val = field.val();  // set the value to the styled textbox
			that.render();
		},

		flushAllSubtitles : function(e) {
			var btn = $(e.currentTarget);
			if(!btn.hasClass('confirm')){
				btn.addClass('confirm').css('width',btn.css('width')).text( i18n.__('Are you sure?') );
				return;
			}
			btn.text( i18n.__('Flushing...') ).addClass('disabled').prop('disabled',true);
			var that = this;

			// we build our notification
			var $el = $('#notification');
			$el.html(
				'<h1>' + i18n.__('Please wait') + '...</h1>'   +
				'<p>' + i18n.__('We are flushing your subtitle cache') + '.</p>'
			).addClass('red').show();

			// enable the notification on current view
			$('body').addClass('has-notification');
			// TODO: ADD CONFIRM
			var cache = new App.Cache('subtitle');
			cache.flushTable(function() {
				$el.html(
					'<h1>' + i18n.__('Success') + '</h1>'   +
					'<p>' + i18n.__('Subtitle cache deleted') + '.</p>'
				).removeClass().addClass('green');
				setTimeout(function(){
					btn.text( i18n.__('Flush subtitles cache') ).removeClass('confirm disabled').prop('disabled',false);
					$('body').removeClass('has-notification');
					$el.hide();
				}, 2000);
			});
		}
	});

	App.View.Settings = Settings;
})(window.App);

