(function (App) {
    'use strict';
    var waitComplete,
        oldTmpLocation,
        oldDownloadsLocation,
        that;

    var SettingsContainer = Marionette.View.extend({
        template: '#settings-container-tpl',
        className: 'settings-container-contain',

        ui: {
            success_alert: '.success_alert',
            fakeTempDir: '#faketmpLocation',
            fakeDownloadsDir: '#fakedownloadsLocation',
            tempDir: '#tmpLocation',
            downloadsDir: '#downloadsLocation'
        },

        events: {
            'click .keyboard': 'showKeyboard',
            'click .help': 'showHelp',
            'click .about': 'showAbout',
            'click .close-icon': 'closeSettings',
            'change select,input': 'saveSetting',
            'contextmenu input': 'rightclick_field',
            'click .rebuild-bookmarks': 'rebuildBookmarks',
            'click .flush-bookmarks': 'flushBookmarks',
            'click .flush-watched': 'flushWatched',
            'click .flush-databases': 'flushAllDatabase',
            'click #faketmpLocation': 'showCacheDirectoryDialog',
            'click #fakedownloadsLocation': 'showDownloadsDirectoryDialog',
            'click .default-settings': 'resetSettings',
            'click .open-tmp-folder': 'openTmpFolder',
            'click .open-downloads-folder': 'openDownloadsFolder',
            'click .open-database-folder': 'openDatabaseFolder',
            'click .export-database': 'exportDatabase',
            'click #importdatabase': 'importDatabase',
            'change #import-watched, #import-bookmarks, #import-torcol, #import-settings': 'checkImportSettings',
            'click .import-db': 'openModal',
            'click .modal-overlay, .modal-close': 'closeModal',
            'click #authTrakt': 'connectTrakt',
            'click #features input#activateWatchlist': 'connectTrakt',
            'click #unauthTrakt': 'disconnectTrakt',
            'click .closeTraktCode': 'disconnectTrakt',
            'mousedown .createOpensubtitles': 'createOpensubtitles',
            'click #authOpensubtitles': 'connectOpensubtitles',
            'click #unauthOpensubtitles': 'disconnectOpensubtitles',
            'change #tmpLocation': 'updateCacheDirectory',
            'change #downloadsLocation': 'updateDownloadsDirectory',
            'click #syncTrakt': 'syncTrakt',
            'click .qr-code': 'generateQRcode',
            'click .set-current-filter': 'saveFilter',
            'click .reset-current-filter': 'resetFilter',
            'click .update-dht': 'updateDht',
            'click .update-app': 'updateApp',
            'mousedown #customMoviesServer': 'showFullDatalist',
            'mousedown #customSeriesServer': 'showFullDatalist',
            'mousedown #customAnimeServer': 'showFullDatalist'
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

            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('settings:close');
            });

            App.vent.on('viewstack:pop', function() {
                if (_.last(App.ViewStack) === that.className) {
                    Mousetrap.bind(['esc', 'backspace'], function (e) {
                        App.vent.trigger('settings:close');
                    });
                }
            });

            // connect opensubs on enter
            var osMousetrap = new Mousetrap(document.getElementById('opensubtitlesPassword'));
            osMousetrap.bind('enter', function (e) {
                this.connectOpensubtitles();
            }.bind(this));

            if (!Settings.filters) {
                $('.reset-current-filter').addClass('disabled').attr('data-original-title', '');
            }
        },

        onRender: function () {
            if (App.settings.showAdvancedSettings) {
                $('.advanced').css('display', 'flex');
            }
            oldTmpLocation = $('#faketmpLocation').val();
            oldDownloadsLocation = $('#fakedownloadsLocation').val();
        },

        rightclick_field: function (e) {
            e.preventDefault();
            var menu;
            if (/customMoviesServer|customSeriesServer|customAnimeServer/.test(e.target.id)) {
                menu = new this.altcontext_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'), e.target.id);
            } else {
                menu = new this.context_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'), e.target.id);
            }
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
                        document.execCommand('paste');
                    }
                });

            menu.append(cut);
            menu.append(copy);
            menu.append(paste);
            return menu;
        },

        altcontext_Menu: function (cutLabel, copyLabel, pasteLabel, field) {
            var menu = new nw.Menu(),
                clipboard = nw.Clipboard.get(),
                text = $('#' + field).val(),

                cut = new nw.MenuItem({
                    label: cutLabel || 'Cut',
                    click: function () {
                        text = $('#' + field).val();
                        clipboard.set(text, 'text');
                        $('.notification_alert').text(i18n.__('The API Server URL(s) was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
                        $('#' + field).val('');
                    }
                }),

                copy = new nw.MenuItem({
                    label: copyLabel || 'Copy',
                    click: function () {
                        text = $('#' + field).val();
                        clipboard.set(text, 'text');
                        $('.notification_alert').text(i18n.__('The API Server URL(s) was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
                    }
                }),

                paste = new nw.MenuItem({
                    label: pasteLabel || 'Paste',
                    click: function () {
                        document.execCommand('paste');
                    }
                });

                $('#' + field).one('blur', function() {
                    if (text && !$('#' + field).val()) {
                        $('#' + field).val(text);
                        if (!AdvSettings.get(field)) {
                            AdvSettings.set(field, text);
                        }
                    }
                });

            menu.append(cut);
            menu.append(copy);
            menu.append(paste);
            return menu;
        },

        onBeforeDestroy: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');
            $('#movie-detail').show();
            clearInterval(waitComplete);
            if ($('#authTraktCode').is(':visible') && !App.Trakt.authenticated) {
                Settings.activateWatchlist = false;
            }
        },

        closeSettings: function () {
            App.vent.trigger('settings:close');
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
                'left': 5,
                'top': 5,
                'size': 190,
                'background': '#fff',
                'text': JSON.stringify(QRCodeInfo)
            });
            $('#qrcode-modal, #qrcode-overlay').fadeIn(500);
        },


        openModal: function (e) {
            var el = $(e.currentTarget);

            if (el[0].classList.contains('import-db')) {
                $('#importdb-modal, #importdb-overlay').fadeIn(500);
            }
        },

        closeModal: function (e) {
            var el = $(e.currentTarget);

            if (el.attr('id').startsWith('qrcode-')) {
                $('#qrcode-modal, #qrcode-overlay').fadeOut(500);
            } else if (el.attr('id').startsWith('importdb-') || el.attr('id') === 'importdatabase') {
                $('#importdb-modal, #importdb-overlay').fadeOut(500);
            }
        },

        showHelp: function () {
            App.vent.trigger('help:toggle');
        },

        showKeyboard: function () {
            App.vent.trigger('keyboard:toggle');
        },

        showAbout: function () {
            App.vent.trigger('about:show');
        },

        saveSetting: function (e) {
            var value = false,
                apiDataChanged = false,
                apiServerChanged = false,
                tmpLocationChanged = false,
                downloadsLocationChanged = false,
                field = $(e.currentTarget),
                data = {};

            switch (field.attr('name')) {
                case 'customMoviesServer':
                case 'customSeriesServer':
                case 'customAnimeServer':
                    apiServerChanged = true;
                    value = field.val().replace(/\s+/g, '');
                    if (value && value.slice(-1) !== '/') {
                        value = value + '/';
                    }
                    field.val(value);
                    break;
                case 'proxyServer':
                    apiServerChanged = true;
                    value = field.val().replace(/\s+/g, '');
                    field.val(value);
                    break;
                case 'httpApiPort':
                    apiDataChanged = true;
                    let npvalue = parseInt(field.val().replace(/[^0-9]/gi, ''));
                    field.val(npvalue);
                    value = npvalue;
                    break;
                case 'subtitle_size':
                case 'tv_detail_jump_to':
                case 'subtitle_language':
                case 'subtitle_decoration':
                case 'subtitle_font':
                case 'start_screen':
                    if ($('option:selected', field).val() === 'Last Open') {
                        AdvSettings.set('lastTab', App.currentview);
                    }
                /* falls through */
                case 'translateTitle':
                case 'watchedCovers':
                case 'defaultFilters':
                case 'theme':
                case 'delSeedboxCache':
                case 'maxLimitMult':
                case 'moviesUITransparency':
                case 'seriesUITransparency':
                    value = $('option:selected', field).val();
                    break;
                case 'poster_size':
                    value = $('option:selected', field).val();
                    App.db.writeSetting({
                        key: 'postersWidth',
                        value: value
                    }).then(function () {
                        App.vent.trigger('updatePostersSizeStylesheet');
                    });
                    break;
                case 'contentLanguage':
                    value = $('option:selected', field).val();
                    break;
                case 'language':
                    value = $('option:selected', field).val();
                    i18n.setLocale(value);
                    break;
                case 'deleteTmpOnClose':
                case 'separateDownloadsDir':
                case 'continueSeedingOnStart':
                case 'protocolEncryption':
                case 'contentLangOnly':
                case 'dhtEnable':
                case 'coversShowRating':
                case 'alwaysShowBookmarks':
                case 'showSeedboxOnDlInit':
                case 'expandedSearch':
                case 'nativeWindowFrame':
                case 'audioPassthrough':
                case 'translatePosters':
                case 'translateSynopsis':
                case 'translateEpisodes':
                case 'showAdvancedSettings':
                case 'alwaysOnTop':
                case 'playNextEpisodeAuto':
                case 'updateNotification':
                case 'events':
                case 'alwaysFullscreen':
                case 'minimizeToTray':
                case 'activateTorrentCollection':
                case 'activateSeedbox':
                case 'activateWatchlist':
                case 'activateTempf':
                case 'subtitles_bold':
                case 'multipleExtSubtitles':
                case 'moviesTabEnable':
                case 'seriesTabEnable':
                case 'animeTabEnable':
                case 'favoritesTabEnable':
                case 'watchedTabEnable':
                    value = field.is(':checked');
                    break;
                case 'httpApiEnabled':
                    apiDataChanged = true;
                    value = field.is(':checked');
                    break;
                case 'httpApiUsername':
                case 'httpApiPassword':
                    apiDataChanged = true;
                    let lvalue = field.val().replace(/"/g, '');
                    field.val(lvalue);
                    value = lvalue;
                    break;
                case 'connectionLimit':
                case 'streamPort':
                case 'maxActiveTorrents':
                case 'maxUdpReqLimit':
                    let ncvalue = parseInt(field.val().replace(/[^0-9]/gi, ''));
                    field.val(ncvalue);
                    value = ncvalue;
                    break;
                case 'subtitle_color':
                    value = field.val();
                    break;
                case 'downloadLimit':
                case 'uploadLimit':
                    let numvalue = field.val().replace(/[^0-9|.-]/gi, '').replace(/^([^.]*\.)|\./g, '$1');
                    if (numvalue <= 0) {
                        numvalue = '';
                    }
                    field.val(numvalue);
                    value = numvalue;
                    break;
                case 'bigPicture':
                    let nvalue = parseInt(field.val().replace(/[^0-9]/gi, ''));
                    if (nvalue === '') {
                        nvalue = AdvSettings.get('bigPicture');
                    } else if (nvalue < 25) {
                        nvalue = 25;
                    } else if (nvalue > 400) {
                        nvalue = 400;
                    }
                    field.val(nvalue + '%');
                    value = nvalue;
                    win.zoomLevel = Math.log(value/100) / Math.log(1.2);
                    break;
                case 'preloadNextEpisodeTime':
                    let nnvalue = field.val().replace(/[^0-9]/gi, '');
                    if (!nnvalue) {
                        nnvalue = 1;
                    } else {
                        nnvalue = parseInt(nnvalue);
                    }
                    field.val(nnvalue);
                    value = nnvalue;
                    break;
                case 'tmpLocation':
                    tmpLocationChanged = true;
                    value = field.val();
                    if (!value.endsWith(Settings.projectName)) {
                        value = path.join(value, Settings.projectName);
                    }
                    break;
                case 'downloadsLocation':
                    downloadsLocationChanged = true;
                    value = field.val();
                    break;
                case 'opensubtitlesUsername':
                case 'opensubtitlesPassword':
                case 'import-watched':
                case 'import-bookmarks':
                case 'import-torcol':
                case 'import-settings':
                    return;
                default:
                    win.warn('Setting not defined: ' + field.attr('name'));
                    return;
            }
            win.info('Setting changed: ' + field.attr('name') + ' - ' + value);


            // update active session
            App.settings[field.attr('name')] = value;

            if (apiServerChanged) {
                App.Providers.updateConnection(App.settings['customMoviesServer'], App.settings['customSeriesServer'], App.settings['customAnimeServer'], App.settings['proxyServer']);
            }

            if (apiDataChanged) {
                App.vent.trigger('initHttpApi');
            }

            // move tmp folder safely
            if (tmpLocationChanged) {
                that.moveTmpLocation(value);
            }

            // move downloads folder safely
            if (downloadsLocationChanged) {
                that.moveDownloadsLocation(value);
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
            let scrollPos = that.$el.scrollTop();
            let scrollPosOffset = 0;
            switch (setting) {
                case 'coversShowRating':
                    if (value) {
                        $('.rating').show();
                    } else {
                        $('.rating').hide();
                    }
                    break;
                case 'showAdvancedSettings':
                    if (value) {
                        $('.advanced').css('display', 'flex');
                    } else {
                        $('.advanced').css('display', 'none');
                    }
                    break;
                case 'protocolEncryption':
                case 'maxUdpReqLimit':
                    this.alertMessageSuccess(true);
                    break;
                case 'downloadLimit':
                    App.WebTorrent.throttleDownload(parseInt(parseFloat(value, 10) * parseInt(Settings.maxLimitMult, 10)) || -1);
                    break;
                case 'uploadLimit':
                    App.WebTorrent.throttleUpload(parseInt(parseFloat(value, 10) * parseInt(Settings.maxLimitMult, 10)) || -1);
                    break;
                case 'maxLimitMult':
                    if (Settings.downloadLimit) {
                        App.WebTorrent.throttleDownload(parseInt(parseFloat(Settings.downloadLimit, 10) * parseInt(value, 10)) || -1);
                    }
                    if (Settings.uploadLimit) {
                        App.WebTorrent.throttleUpload(parseInt(parseFloat(Settings.uploadLimit, 10) * parseInt(value, 10)) || -1);
                    }
                    break;
                case 'contentLanguage':
                case 'contentLangOnly':
                    App.Providers.updateLanguage(Settings.language, value || Settings.language, Settings.contentLangOnly);
                    this.alertMessageSuccess(true);
                    break;
                case 'language':
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (!Settings.contentLanguage) {
                        this.alertMessageSuccess(true);
                    }
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
                        if (os.platform() === 'win32' && $('.windows-titlebar .events').css('background-repeat') === 'no-repeat') {
                            $('.windows-titlebar .icon').css('opacity', '0');
                        }
                    } else {
                        events.css('display', 'none');
                        if (os.platform() === 'win32' && $('.windows-titlebar .events').css('background-repeat') === 'no-repeat') {
                            $('.windows-titlebar .icon').css('opacity', '1');
                        }
                    }
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    break;
                case 'activateTorrentCollection':
                    App.vent.trigger('torrentCollection:close');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'Torrent-collection') {
                        $('select[name=start_screen]').change();
                    }
                    value ? scrollPosOffset++ : scrollPosOffset--;
                    break;
                case 'moviesTabEnable':
                    App.vent.trigger('favorites:list');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'Movies') {
                        $('select[name=start_screen]').change();
                    }
                    break;
                case 'seriesTabEnable':
                    App.vent.trigger('favorites:list');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'TV Series') {
                        $('select[name=start_screen]').change();
                    }
                    break;
                case 'animeTabEnable':
                    App.vent.trigger('favorites:list');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'Anime') {
                        $('select[name=start_screen]').change();
                    }
                    break;
                case 'favoritesTabEnable':
                    App.vent.trigger('favorites:list');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'Favorites') {
                        $('select[name=start_screen]').change();
                    }
                    break;
                case 'watchedTabEnable':
                    App.vent.trigger('favorites:list');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'Watched') {
                        $('select[name=start_screen]').change();
                    }
                    break;
                case 'activateWatchlist':
                    if (App.Trakt.authenticated) {
                        $('.nav-hor.left li:first').click();
                        App.vent.trigger('settings:show');
                        if (AdvSettings.get('startScreen') === 'Watchlist') {
                            $('select[name=start_screen]').change();
                        }
                    }
                    break;
                case 'activateSeedbox':
                    App.vent.trigger('seedbox:close');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (AdvSettings.get('startScreen') === 'Seedbox') {
                        $('select[name=start_screen]').change();
                    }
                    value ? scrollPosOffset++ : scrollPosOffset--;
                    break;
                case 'separateDownloadsDir':
                    if (value) {
                        const torrent_cache_dir2 = path.join(Settings.downloadsLocation, 'TorrentCache');
                        if (!fs.existsSync(torrent_cache_dir2)) {
                            fs.mkdir(torrent_cache_dir2, function (err) {});
                        }
                    }
                    if (Settings.deleteTmpOnClose) {
                        value ? scrollPosOffset++ : scrollPosOffset--;
                    }
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    break;
                case 'deleteTmpOnClose':
                    if (!Settings.separateDownloadsDir) {
                        !value ? scrollPosOffset++ : scrollPosOffset--;
                    }
                    /* falls through */
                case 'alwaysShowBookmarks':
                case 'watchedCovers':
                case 'defaultFilters':
                case 'activateTempf':
                case 'multipleExtSubtitles':
                case 'httpApiEnabled':
                case 'expandedSearch':
                case 'moviesUITransparency':
                case 'seriesUITransparency':
                case 'playNextEpisodeAuto':
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    break;
                case 'nativeWindowFrame':
                    let packageJson = jsonFileEditor(`package.json`);
                    packageJson.get('window').frame = value;
                    packageJson.save();
                    this.alertMessageSuccess(true);
                    break;
                case 'audioPassthrough':
                    let packageJson2 = jsonFileEditor(`package.json`);
                    if (Settings.audioPassthrough) {
                        packageJson2.set('chromium-args', '--enable-node-worker --disable-audio-output-resampler');
                    } else {
                        packageJson2.set('chromium-args', '--enable-node-worker');
                    }
                    packageJson2.save();
                    this.alertMessageSuccess(true);
                    break;
                case 'customMoviesServer':
                case 'customSeriesServer':
                case 'customAnimeServer':
                    this.alertMessageSuccess(true);
                    break;
                case 'translateSynopsis':
                    App.Providers.delete('Yts');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    break;
                case 'dhtEnable':
                    if (Settings.dhtEnable) {
                        this.updateDht('enable');
                    } else {
                        this.alertMessageSuccess(true);
                    }
                    break;
                case 'updateNotification':
                    if (Settings.updateNotification) {
                        this.updateApp('enable');
                    }
                    break;
                default:
            }
            if (that.$el.scrollTop() !== scrollPos) {
                if (scrollPosOffset) {
                    scrollPos = scrollPos + scrollPosOffset * 40;
                }
                that.$el.scrollTop(scrollPos);
            }
        },

        saveFilter: function () {
            curSetDefaultFilters = true;
            $('.nav-hor.left li:first').click();
            var ddone = function () {
                curSetDefaultFilters = false;
                App.vent.trigger('notification:close');
                that.alertMessageSuccess(false, false, '', i18n.__('Your Default Filters have been changed'));
            };
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('Setting Filters...'),
                body: i18n.__('Set any number of the <i>Genre</i>, <i>Sort by</i> and <i>Type</i> filters and press \'Done\' to save your preferences.') + '<br>' + i18n.__('(*You can set multiple Filters and tabs at the same time and of course any additional ones later') + '<br>' + i18n.__('as well as overwrite or reset your preferences)'),
                showClose: false,
                showRestart: false,
                type: 'info',
                buttons: [{ title: '<label class="export-database" for="exportdatabase">' + i18n.__('Done') + '</label>', action: ddone }]
            }));
        },

        resetFilter: function () {
            if (!$('.reset-current-filter').hasClass('disabled')) {
                let scrollPos = that.$el.scrollTop();
                AdvSettings.set('filters', '');
                setTimeout(function(){
                    App.vent.trigger('favorites:list');
                    $('.nav-hor.left li:first').click();
                    App.vent.trigger('settings:show');
                    if (that.$el.scrollTop() !== scrollPos) {
                        that.$el.scrollTop(scrollPos);
                    }
                }, 100);
                that.alertMessageSuccess(false, false, '', i18n.__('Your Default Filters have been reset'));
            }
        },

        updateDht: function(e) {
            let updateMode = e === 'enable' ? e : (e ? 'manual' : '');
            App.DhtReader.update(updateMode);
        },

        updateApp: function(e) {
            let updateMode = e === 'enable' ? e : (e ? 'manual' : '');
            App.Updater.onlyNotification(updateMode);
        },

        connectTrakt: function (e) {
            if (!Settings.traktStatus) {
                $('#authTraktSp').hide();
                $('#authTraktCode').show();

                App.Trakt.authenticate().then(this.render).catch(this.render);
            }
        },

        disconnectTrakt: function (e) {
            App.Trakt.disconnect();
            Settings.activateWatchlist = false;
            this.ui.success_alert.show().delay(3000).fadeOut(400);
            this.render();
            let scrollPos = that.$el.scrollTop();
            let scrollPosOffset = 0;
            $('.nav-hor.left li:first').click();
            App.vent.trigger('settings:show');
            if (that.$el.scrollTop() !== scrollPos) {
                if (scrollPosOffset) {
                    scrollPos = scrollPos + scrollPosOffset * 40;
                }
                that.$el.scrollTop(scrollPos);
            }
        },

        createOpensubtitles: function (e) {
            Common.openOrClipboardLink(e, 'https://www.opensubtitles.org/newuser', 'link');
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

        showFullDatalist: function(e) {
            if (e.button === 0 && (!e.detail || e.detail === 1)) {
                var tmpDlist = $(e.target).val();
                $(e.target).val('');
                $(e.target).one('blur', function() {
                    if (tmpDlist && !$(e.target).val()) {
                        $(e.target).val(tmpDlist);
                    }
                });
            }
        },

        rebuildBookmarks: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Rebuilding bookmarks...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are rebuilding your database'));

            Database.getAllBookmarks()
                .then(async function (data) {
                    let movieProvider = App.Config.getProviderForType('movie')[0];
                    let showProvider = App.Config.getProviderForType('tvshow')[0];
                    for (let n in data) {
                        let item = data[n];
                        if (item.type === 'movie') {
                            await movieProvider.fetch({keywords: item.imdb_id, page:1}).then(function (movies) {
                                if (movies.results.length !== 1) {
                                    return;
                                }
                                let movie = movies.results[0];
                                Database.deleteMovie(item.imdb_id);
                                movie.providers = {};
                                movie.providers.torrent = movieProvider;
                                Database.addMovie(movie);
                            });
                        }
                        if (item.type === 'show') {
                            await showProvider.detail(item.imdb_id, {
                                contextLocale: App.settings.contextLanguage || App.settings.language
                            }).then(function (show) {
                                    Database.deleteTVShow(item.imdb_id);
                                    show.providers = {};
                                    show.providers.torrent = showProvider;
                                    Database.addTVShow(show);
                                });
                        }
                        that.alertMessageWait(i18n.__('Rebuilding bookmarks (%s)', n+'/'+data.length));
                        // api has nginx limit rps
                        await new Promise(resolve => setTimeout(resolve, 700));
                    }
                    that.alertMessageSuccess(true);
                });
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

        flushWatched: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Flushing watched...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are flushing your database'));

            Database.deleteWatched()
                .then(function () {
                    that.alertMessageSuccess(true);
                });
        },

        resetSettings: function (e) {
            var btn = $(e.currentTarget);

            if (!this.areYouSure(btn, i18n.__('Resetting settings...'))) {
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

            if (!this.areYouSure(btn, i18n.__('Resetting...'))) {
                return;
            }

            this.alertMessageWait(i18n.__('We are resetting all databases and settings'));

            Database.deleteDatabases()
                .then(function () {
                    deleteCookies();
                    that.alertMessageSuccess(true);
                });
        },

        restartApplication: function () {
            App.vent.trigger('restartButter');
        },

        showCacheDirectoryDialog: function () {
            this.ui.tempDir.click();
        },

        showDownloadsDirectoryDialog: function () {
            this.ui.downloadsDir.click();
        },

        openTmpFolder: function () {
            App.settings.os === 'windows' ? nw.Shell.openExternal(App.settings['tmpLocation']) : nw.Shell.openItem(App.settings['tmpLocation']);
        },

        openDownloadsFolder: function () {
            App.settings.os === 'windows' ? nw.Shell.openExternal(App.settings['downloadsLocation']) : nw.Shell.openItem(App.settings['downloadsLocation']);
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
                App.settings.os === 'windows' ? nw.Shell.openExternal(oldTmpLocation) : nw.Shell.openItem(oldTmpLocation);
            }
        },

        moveDownloadsLocation: function (location) {
            if (!fs.existsSync(location)) {
                fs.mkdirSync(location);
            }
            const torrent_cache_dir2 = path.join(location, 'TorrentCache');
            if (!fs.existsSync(torrent_cache_dir2)) {
                fs.mkdir(torrent_cache_dir2, function (err) {});
            }
        },

        openDatabaseFolder: function () {
            App.settings.os === 'windows' ? nw.Shell.openExternal(App.settings['databaseLocation']) : nw.Shell.openItem(App.settings['databaseLocation']);
        },

        exportDatabase: function (e) {

            var zip = new AdmZip();
            var btn = $(e.currentTarget);
            var databaseFiles = fs.readdirSync(App.settings['databaseLocation']);
            var fileinput = $('input[id=exportdatabase]');

            fileinput.on('change', function () {
                var path = fileinput.val();
                try {
                    zip.addLocalFolder(App.settings['databaseLocation']);
                    fs.writeFile(path + '/database.zip', zip.toBuffer(), function (err) {
                        that.alertMessageWait(i18n.__('Exporting Database...'));
                        win.info('Database exported to:', path);
                        that.alertMessageSuccess(false, btn, i18n.__('Export Database'), i18n.__('Database Successfully Exported'));

                    });
                } catch (err) {}
                // reset fileinput so it detect change even if we select same folder again
                fileinput.val('');
            });

        },

        importDatabase: function (e) {

            var fileinput = $('input[id=importdatabase]');
            var importTypes = $('#importdb-modal input[type=checkbox]:checked');

            fileinput.on('change', function () {
                var path = fileinput.val();
                fs.readFile(path, function (err, content) {
                    that.alertMessageWait(i18n.__('Importing Database...'));
                    try {
                        var zip = new AdmZip(content);
                        var targetFolder = App.settings['databaseLocation'] + '/';
                        for (const el of importTypes) {
                            switch (el.id) {
                                case 'import-bookmarks':
                                    zip.getEntry('bookmarks.db') ? zip.extractEntryTo('bookmarks.db', targetFolder, false, true) : null;
                                    zip.getEntry('movies.db') ? zip.extractEntryTo('movies.db', targetFolder, false, true) : null;
                                    zip.getEntry('shows.db') ? zip.extractEntryTo('shows.db', targetFolder, false, true) : null;
                                break;
                                case 'import-settings':
                                    zip.getEntry('settings.db') ? zip.extractEntryTo('settings.db', targetFolder, false, true) : null;
                                break;
                                case 'import-watched':
                                    zip.getEntry('watched.db') ? zip.extractEntryTo('watched.db', targetFolder, false, true) : null;
                                break;
                                case 'import-torcol':
                                    zip.getEntry('TorrentCollection/') ? zip.extractEntryTo('TorrentCollection/', targetFolder + 'TorrentCollection/', false, true) : null;
                                break;
                            }
                        }
                        that.closeModal(e);
                        win.info('Database imported from %s', path);
                        that.alertMessageSuccess(true);
                    }
                    catch (err) {
                        that.alertMessageFailed(i18n.__('Invalid Database File Selected'));
                    }
                    // reset fileinput so it detect change even if we select same folder again
                    fileinput.val('');
                });
            });

        },

        checkImportSettings: function () {
            var importBtn = $('input[id=importdatabase]');
            var importTypes = $('#importdb-modal input[type=checkbox]:checked');
            if (importTypes.length === 0) {
                importBtn.attr('disabled','disabled');
                importBtn.parent().addClass('disabled');
            }
            else{
                importBtn.removeAttr('disabled');
                importBtn.parent().removeClass('disabled');
            }
        },


        updateCacheDirectory: function (e) {
            var field = $('#tmpLocation');
            this.ui.fakeTempDir.val = field.val();
            this.render();
        },

        updateDownloadsDirectory: function (e) {
            var field = $('#downloadsLocation');
            this.ui.fakeDownloadsDir.val = field.val();
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
                body: waitDesc,
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
                notificationModel.attributes.autoclose = true;
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
