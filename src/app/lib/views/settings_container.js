(function (App) {
    'use strict';
    var clipboard = nw.Clipboard.get(),
        waitComplete,
        oldTmpLocation,
        that;

    var SettingsContainer = Marionette.View.extend({
        template: '#settings-container-tpl',
        className: 'settings-container-contain',

        ui: {
            success_alert: '.success_alert',
            fakeTempDir: '#faketmpLocation',
            tempDir: '#tmpLocation'
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
            'click .import-database': 'importDatabase',
            'click #authTrakt': 'connectTrakt',
            'click #unauthTrakt': 'disconnectTrakt',
            'click #connect-with-tvst': 'connectWithTvst',
            'click #disconnect-tvst': 'disconnectTvst',
            'click #authOpensubtitles': 'connectOpensubtitles',
            'click #unauthOpensubtitles': 'disconnectOpensubtitles',
            'click .reset-tvshow': 'resettvshow',
            'change #tmpLocation': 'updateCacheDirectory',
            'click #syncTrakt': 'syncTrakt',
            'click .qr-code': 'generateQRcode',
            'click #qrcode-overlay': 'closeModal',
            'click #qrcode-close': 'closeModal'
        },

        onAttach: function () {
            that = this;
            this.render();

            AdvSettings.set('ipAddress', this.getIPAddress());

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

            // connect opensubs on enter
            var osMousetrap = new Mousetrap(document.getElementById('opensubtitlesPassword'));
            osMousetrap.bind('enter', function (e) {
                this.connectOpensubtitles();
            }.bind(this));
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
            var menu = new nw.Menu(),

                cut = new nw.MenuItem({
                    label: cutLabel || 'Cut',
                    click: function () {
                        document.execCommand('cut');
                    }
                }),

                copy = new nw.MenuItem({
                    label: copyLabel || 'Copy',
                    click: function () {
                        document.execCommand('copy');
                    }
                }),

                paste = new nw.MenuItem({
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

        onBeforeDestroy: function () {
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

        resettvshow: function () {
            var value = [{
                url: 'https:///',
                strictSSL: true
            }, {
                url: 'https:///',
                strictSSL: true
            }];
            App.settings['tvshow'] = value;
            //save to db
            App.db.writeSetting({
                key: 'tvshow',
                value: value
            }).then(function () {
                that.ui.success_alert.show().delay(3000).fadeOut(400);
            });

            that.syncSetting('tvshow', value);
        },

        generateQRcode: function () {
            var qrcodecanvus = document.getElementById('qrcode'),
                QRCodeInfo = {
                    ip: AdvSettings.get('ipAddress'),
                    port: $('#httpApiPort').val(),
                    user: $('#httpApiUsername').val(),
                    pass: $('#httpApiPassword').val()
                };
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
            var value = false,
                apiDataChanged = false,
                apiServerChanged = false,
                tmpLocationChanged = false,
                field = $(e.currentTarget),
                data = {};

            switch (field.attr('name')) {
                case 'apiServer':
                case 'proxyServer':
                    apiServerChanged = true;
                    value = field.val();
                    break;
                case 'httpApiPort':
                    apiDataChanged = true;
                    value = parseInt(field.val());
                    break;
                case 'tvshow':
                    value = field.val();
                    if (value.substr(-1) !== '/') {
                        value += '/';
                    }
                    if (value.substr(0, 8) !== 'https://' && value.substr(0, 7) !== 'http://') {
                        value = 'http://' + value;
                    }
                    value = [{
                        url: value,
                        strictSSL: value.substr(0, 8) === 'https://'
                    }];
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
                case 'continueSeedingOnStart':
                case 'vpnEnabled':
                case 'coversShowRating':
                case 'translateSynopsis':
                case 'showAdvancedSettings':
                case 'alwaysOnTop':
                case 'traktSyncOnStart':
                case 'traktPlayback':
                case 'playNextEpisodeAuto':
                case 'automaticUpdating':
                case 'UpdateSeed':
                case 'events':
                case 'alwaysFullscreen':
                case 'minimizeToTray':
                case 'bigPicture':
                case 'activateTorrentCollection':
                case 'activateWatchlist':
                case 'activateRandomize':
                case 'opensubtitlesAutoUpload':
                case 'subtitles_bold':
                case 'rememberFilters':
                case 'animeTabDisable':
                case 'indieTabDisable':
                    value = field.is(':checked');
                    break;
                case 'httpApiEnabled':
                    apiDataChanged = true;
                    value = field.is(':checked');
                    break;
                case 'httpApiUsername':
                case 'httpApiPassword':
                    apiDataChanged = true;
                    value = field.val();
                    break;
                case 'connectionLimit':
                case 'streamPort':
                case 'subtitle_color':
                case 'maxActiveTorrents':
                    value = field.val();
                    break;
                case 'tmpLocation':
                    tmpLocationChanged = true;
                    value = path.join(field.val(), 'Popcorn-Time');
                    break;
                case 'opensubtitlesUsername':
                case 'opensubtitlesPassword':
                    return;
                default:
                    win.warn('Setting not defined: ' + field.attr('name'));
            }
            win.info('Setting changed: ' + field.attr('name') + ' - ' + value);


            // update active session
            App.settings[field.attr('name')] = value;

            if (apiServerChanged) {
                console.log(App.settings['apiServer'], App.settings['proxyServer']);
                App.Providers.updateConnection(App.settings['apiServer'], App.settings['proxyServer']);
            }

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
            }).then(function () {
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
                case 'vpnEnabled':
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
                    var events = $('.events');
                    if (events.css('display') === 'none') {
                        events.css('display', 'block');
                    } else {
                        events.css('display', 'none');
                    }
                    break;
                case 'activateTorrentCollection':
                    var torrentCol = $('#torrent_col');
                    if (torrentCol.css('display') === 'none') {
                        torrentCol.css('display', 'block');
                    } else {
                        torrentCol.css('display', 'none');
                        App.vent.trigger('torrentCollection:close');
                        App.vent.trigger('seedbox:close');
                    }
                    break;
                case 'animeTabDisable':
                    var animeTab = $('.animeTabShow');
                    if (animeTab.css('display') === 'none') {
                        animeTab.css('display', 'block');
                    } else {
                        animeTab.css('display', 'none');
                        App.vent.trigger('movies:list');
                        App.vent.trigger('settings:show');
                    }
                    break;
                case 'indieTabDisable':
                    var indieTab = $('.indieTabShow');
                    if (indieTab.css('display') === 'none') {
                        indieTab.css('display', 'block');
                    } else {
                        indieTab.css('display', 'none');
                        App.vent.trigger('movies:list');
                        App.vent.trigger('settings:show');
                    }
                    break;
                case 'activateRandomize':
                case 'activateWatchlist':
                    App.vent.trigger('movies:list');
                    App.vent.trigger('settings:show');
                    break;
                case 'movies_quality':
                case 'translateSynopsis':
                    App.Providers.delete('Yts');
                    App.vent.trigger('movies:list');
                    App.vent.trigger('settings:show');
                    break;
                case 'tvshow':
                    App.Providers.delete('tvshow');
                    App.vent.trigger('movies:list');
                    App.vent.trigger('settings:show');
                    break;
                case 'bigPicture':
                    if (!ScreenResolution.SD) {
                        if (App.settings.bigPicture) {
                            win.maximize();
                            AdvSettings.set('noBigPicture', win.zoomLevel);
                            var zoom = ScreenResolution.HD ? 2 : 3;
                            win.zoomLevel = zoom;
                        } else {
                            win.zoomLevel = AdvSettings.get('noBigPicture') || 0;
                        }
                    } else {
                        AdvSettings.set('bigPicture', false);
                        win.info('Setting changed: bigPicture - true');
                        $('input#bigPicture.settings-checkbox').attr('checked', false);
                        App.vent.trigger('notification:show', new App.Model.Notification({
                            title: i18n.__('Big Picture Mode'),
                            body: i18n.__('Big Picture Mode is unavailable on your current screen resolution'),
                            showRestart: false,
                            type: 'error',
                            autoclose: true
                        }));
                    }
                    break;
                default:
            }
        },

        connectTrakt: function (e) {
            if (!Settings.traktStatus) {
                $('#authTrakt').hide();
                $('#authTraktCode').show();

                App.Trakt.authenticate().then(this.render).catch(this.render);
            }
        },

        disconnectTrakt: function (e) {
            App.Trakt.disconnect();
            this.ui.success_alert.show().delay(3000).fadeOut(400);
            this.render();
        },

        connectWithTvst: function () {
            var self = this;

            $('#connect-with-tvst > i').css('visibility', 'hidden');
            $('.tvst-loading-spinner').show();

            App.vent.on('system:tvstAuthenticated', function () {
                $('.tvst-loading-spinner').hide();
                self.render();
            });
            App.TVShowTime.authenticate(function (activateUri) {
                nw.Shell.openExternal(activateUri);
            });
        },

        disconnectTvst: function () {
            var self = this;
            App.TVShowTime.disconnect(function () {
                self.render();
            });
        },

        connectOpensubtitles: function (e) {
            var self = this,
                usn = $('#opensubtitlesUsername').val(),
                pw = $('#opensubtitlesPassword').val(),
                OS = require('opensubtitles-api');

            var cross =  $('.opensubtitles-options .invalid-cross');
            var spinner = $('.opensubtitles-options .loading-spinner');

            cross.hide();

            if (usn !== '' && pw !== '') {
                spinner.show();
                var OpenSubtitles = new OS({
                    useragent: Settings.opensubtitles.useragent + ' v' + (Settings.version || 1),
                    username: usn,
                    password: Common.md5(pw),
                    ssl: true
                });
                const delay = function(ms) {
                  return new Promise(resolve => setTimeout(resolve, ms));
                };
                OpenSubtitles.login()
                    .then(function (obj) {
                        if (obj.token) {
                            AdvSettings.set('opensubtitlesUsername', usn);
                            AdvSettings.set('opensubtitlesPassword', Common.md5(pw));
                            AdvSettings.set('opensubtitlesAuthenticated', true);
                            spinner.hide();
                            $('.opensubtitles-options .valid-tick').show();
                            win.info('Setting changed: opensubtitlesAuthenticated - true');
                            return new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            throw new Error('no token returned by OpenSubtitles');
                        }
                    }).then(function () {
                        self.render();
                    }).catch(function (err) {
                        win.error('OpenSubtitles.login()', err);
                        spinner.hide();
                    cross.show();
                    });
            } else {
                cross.show();
            }

        },

        disconnectOpensubtitles: function (e) {
            var self = this;
            AdvSettings.set('opensubtitlesUsername', '');
            AdvSettings.set('opensubtitlesPassword', '');
            AdvSettings.set('opensubtitlesAuthenticated', false);
            setTimeout(self.render, 200);
        },

        flushBookmarks: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Flushing bookmarks...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are flushing your database'));

            Database.deleteBookmarks()
                .then(function () {
                    that.alertMessageSuccess(true);
                });
        },

        resetSettings: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Resetting...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are resetting the settings'));

            Database.resetSettings()
                .then(function () {
                    AdvSettings.set('disclaimerAccepted', 1);
                    that.alertMessageSuccess(true);
                });
        },

        flushAllDatabase: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Flushing...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are flushing your databases'));

            Database.deleteDatabases()
                .then(function () {
                    deleteCookies();
                    that.alertMessageSuccess(true);
                });
        },

        flushAllSubtitles: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Flushing...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are flushing your subtitle cache'));

            var cache = new App.Cache('subtitle');
            cache.flushTable()
                .then(function () {

                    that.alertMessageSuccess(false, btn, i18n.__('Flush subtitles cache'), i18n.__('Subtitle cache deleted'));

                });
        },

        restartApplication: function () {
            App.vent.trigger('restartButter');
        },

        showCacheDirectoryDialog: function () {
            this.ui.tempDir.click();
        },

        openTmpFolder: function () {
            win.debug('Opening: ' + App.settings['tmpLocation']);
            nw.Shell.openItem(App.settings['tmpLocation']);
        },

        moveTmpLocation: function (location) {
            if (!fs.existsSync(location)) {
                fs.mkdirSync(location);
                fs.mkdirSync(location + '/TorrentCache');
            }
            if (App.settings['deleteTmpOnClose']) {
                deleteFolder(oldTmpLocation);
            } else {
                $('.notification_alert').show().text(i18n.__('You should save the content of the old directory, then delete it')).delay(5000).fadeOut(400);
                nw.Shell.openItem(oldTmpLocation);
            }
        },

        openDatabaseFolder: function () {
            win.debug('Opening: ' + App.settings['databaseLocation']);
            nw.Shell.openItem(App.settings['databaseLocation']);
        },

        exportDatabase: function (e) {

            var zip = new AdmZip();
            var btn = $(e.currentTarget);
            var databaseFiles = fs.readdirSync(App.settings['databaseLocation']);
            var fileinput = document.querySelector('input[id=exportdatabase]');

            $('#exportdatabase').on('change', function () {
                var path = fileinput.value;
                try {
                    databaseFiles.forEach(function (entry) {
                        zip.addLocalFile(App.settings['databaseLocation'] + '/' + entry);
                    });
                    fs.writeFile(path + '/database.zip', zip.toBuffer(), function (err) {
                        that.alertMessageWait(i18n.__('Exporting Database...'));
                        win.info('Database exported to:', path);
                        that.alertMessageSuccess(false, btn, i18n.__('Export Database'), i18n.__('Database Successfully Exported'));

                    });
                } catch (err) {
                    console.log(err);
                }
            });

        },

        importDatabase: function () {

            var fileinput = document.querySelector('input[id=importdatabase]');


            $('#importdatabase').on('change', function () {
                var path = fileinput.value;
                fs.readFile(path, function (err, content) {
                    that.alertMessageWait(i18n.__('Importing Database...'));
                    try {
                        var zip = new AdmZip(content);
                        zip.extractAllTo(App.settings['databaseLocation'] + '/', /*overwrite*/ true);
                        that.alertMessageSuccess(true);
                    }
                    catch (err) {
                        console.log(err);
                        that.alertMessageFailed(i18n.__('Invalid Database File Selected'));
                        win.warn('Failed to Import Database');
                    }
                });
            });

        },

        updateCacheDirectory: function (e) {
            var field = $('#tmpLocation');
            this.ui.fakeTempDir.val = field.val();
            this.render();
        },

        areYouSure: function (btn, waitDesc) {
            if (!btn.hasClass('confirm')) {
                btn.addClass('confirm warning').css('width', btn.css('width')).text(i18n.__('Are you sure?'));
                return false;
            }
            btn.text(waitDesc).addClass('disabled').prop('disabled', true);
            return true;
        },

        alertMessageWait: function (waitDesc) {
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('Please wait') + '...',
                body: waitDesc + '.',
                type: 'danger'
            }));
        },

        alertMessageSuccess: function (btnRestart, btn, btnText, successDesc) {
            var notificationModel = new App.Model.Notification({
                title: i18n.__('Success'),
                body: successDesc,
                type: 'success'
            });

            if (btnRestart) {
                notificationModel.set('showRestart', true);
                notificationModel.set('body', i18n.__('Please restart your application'));
            } else {
                notificationModel.attributes.autoclose = 4000;
            }

            // Open the notification
            App.vent.trigger('notification:show', notificationModel);
        },

        alertMessageFailed: function (errorDesc) {
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('Error'),
                body: errorDesc + '.',
                type: 'danger',
                autoclose: true
            }));
        },

        syncTrakt: function () {
            var oldHTML = document.getElementById('syncTrakt').innerHTML;
            $('#syncTrakt')
                .text(i18n.__('Syncing...'))
                .addClass('disabled')
                .prop('disabled', true);

            Database.deleteWatched(); // Reset before sync

            App.Trakt.syncAll(true)
                .then(function () {
                    $('#syncTrakt')
                        .text(i18n.__('Done'))
                        .removeClass('disabled')
                        .addClass('ok')
                        .delay(3000)
                        .queue(function () {
                            var syncTrakt = $('#syncTrakt');
                            syncTrakt
                                .removeClass('ok')
                                .prop('disabled', false);
                            document.getElementById('syncTrakt').innerHTML = oldHTML;
                            syncTrakt.dequeue();
                        });
                })
                .catch(function (err) {
                    win.error('App.Trakt.syncAll()', err);
                    $('#syncTrakt')
                        .text(i18n.__('Error'))
                        .removeClass('disabled')
                        .addClass('warning')
                        .delay(3000)
                        .queue(function () {
                            var syncTrakt = $('#syncTrakt');
                            syncTrakt
                                .removeClass('warning')
                                .prop('disabled', false);
                            document.getElementById('syncTrakt').innerHTML = oldHTML;
                            syncTrakt.dequeue();
                        });
                });
        },

        getIPAddress: function () {
            var ip, alias = 0;
            var ifaces = os.networkInterfaces();
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

    App.View.Settings = SettingsContainer;
})(window.App);
