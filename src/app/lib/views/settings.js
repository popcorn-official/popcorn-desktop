(function(App) {
    "use strict";

    var Settings = Backbone.Marionette.ItemView.extend({
        template: '#settings-container-tpl',
        className: 'settings-container-contain',

        ui: {
            success_alert: '.success_alert',
            fakeTempDir: '#fakeTemporaryDirectory',
            tempDir: '#temporaryDirectory',
        },

        events: {
            'click .close': 'closeSettings',
            'change select,input': 'saveSetting',
            'click .rebuild-tvshows-database': 'rebuildTvShows',
            'click .flush-bookmarks': 'flushBookmarks',
            'click .flush-databases': 'flushAllDatabase',
            'click #fakeTemporaryDirectory' : 'showCacheDirectoryDialog',
			'change #temporaryDirectory' : 'updateCacheDirectory',
        },

        onShow: function() {
            $(".filter-bar").hide();    
            $("#movie-detail").hide();
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('settings:close');
            });
        },

        onClose: function() {
            $(".filter-bar").show();    
            $("#movie-detail").show();
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
				if (value.substr(-1) != '/') value += '/';
				break;
			case 'subtitle_size':
			case 'subtitle_language':
			case 'movies_quality':
				value = $("option:selected", field).val();
				break;
			case 'language':
				value = $("option:selected", field).val();
				i18n.setLocale(value);
				break;
			case 'moviesShowQuality':
            case 'deleteTmpOnClose':
				value = field.is(':checked');
				break;
            case 'connectionLimit':
            case 'dhtLimit':
            case 'tmpLocation':
                value = field.val();
                break;
			case 'temporaryDirectory':
				value = field.val();
				break;
			default:
				console.log('Setting not defined: '+field.attr('name'));
			}
			
			console.log('Setting changed: ' + field.attr('name') + ' - ' + value);
            
            // update active session
            App.settings[field.attr('name')] = value;

            //save to db
            App.db.writeSetting({key: field.attr('name'), value: value}, function() {
                that.ui.success_alert.show().delay(3000).fadeOut(400);
            });
        },


        rebuildTvShows: function() {
            App.vent.trigger('shows:init');
        },

        flushBookmarks: function() {
            var that = this;

            // we build our notification
            var $el = $('#notification');
            $el.html(
                '<h1>' + i18n.__('Please wait') + '...</h1>'   +
                '<p>' + i18n.__('We are flushing your database') + '.</p>'
            ).addClass('red');

            // enable the notification on current view
            $('body').addClass('has-notification')

            Database.deleteBookmarks(function(err, setting) {

                // ask user to restart (to be sure)
                $el.html(
                    '<h1>' + i18n.__('Success') + '</h1>'   +
                    '<p>' + i18n.__('Please restart your application') + '.</p>' +
                    '<span class="btn-grp">'                        +
                        '<a class="btn restart">' + i18n.__('Restart') + '</a>'    +
                    '</span>'
                ).removeClass().addClass('green');

                // add restart button function
                var $restart = $('.btn.restart');
                $restart.on('click', function() {
                    that.restartApplication();
                });

            });
        },

        flushAllDatabase: function() {
            var that = this;

            // we build our notification
            var $el = $('#notification');
            $el.html(
                '<h1>' + i18n.__('Please wait') + '...</h1>'   +
                '<p>' + i18n.__('We are flushing your databases') + '.</p>'
            ).addClass('red');

            // enable the notification on current view
            $('body').addClass('has-notification')

            Database.deleteDatabases(function(err, setting) {

                // ask user to restart (to be sure)
                $el.html(
                    '<h1>' + i18n.__('Success') + '</h1>'   +
                    '<p>' + i18n.__('Please restart your application') + '.</p>' +
                    '<span class="btn-grp">'                        +
                        '<a class="btn restart">' + i18n.__('Restart') + '</a>'    +
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
            var field = $('#temporaryDirectory');
            var size  = field.val().length * 2.5;
            that.ui.fakeTempDir.val = field.val();  // set the value to the styled textbox
            that.render();
            that.ui.fakeTempDir.css('width', size * 3);
        },
    });

    App.View.Settings = Settings;
})(window.App);

