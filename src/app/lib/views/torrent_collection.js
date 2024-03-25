(function (App) {
    'use strict';

    var clipboard = nw.Clipboard.get(),
        collection = path.join(App.settings['databaseLocation'] + '/TorrentCollection/'),
        curitems,
        curprovider,
        hidetooltps;

    var TorrentCollection = Marionette.View.extend({
        template: '#torrent-collection-tpl',
        className: 'torrent-collection',

        events: {
            'click .file-item a': 'openFileSelector',
            'contextmenu .file-item > *:not(.torrent-icon)': 'openMagnet',
            'click .result-item > *:not(.item-icon)': 'onlineOpen',
            'contextmenu .result-item > *:not(.item-icon)': 'openMagnet',
            'mousedown .result-item .item-icon img': 'openSource',
            'mousedown .item-delete': 'deleteItem',
            'mousedown .item-rename': 'renameItem',
            'click .file-item .magnet-icon': 'openMagnet',
            'click .torrent-icon': 'openTorrent',
            'click .collection-paste': 'pasteItem',
            'click .collection-import': 'importItem',
            'click .collection-open': 'openCollection',
            'click .online-search': 'onlineSearch',
            'submit #online-form': 'onlineSearch',
            'click .online-back': 'onlineClose',
            'contextmenu #online-input': 'rightclick_search',
            'click .togglesengines': 'togglesengines',
            'change #enableThepiratebaySearch': 'toggleThepiratebay',
            'change #enable1337xSearch': 'toggle1337x',
            'change #enableSolidTorrentsSearch': 'toggleSolidtorrents',
            'change #enableTgxtorrentSearch': 'toggleTgxtorrent',
            'change #enableNyaaSearch': 'toggleNyaa',
            'contextmenu .online-search, #enableThepiratebaySearchL, #enable1337xSearchL, #enableSolidTorrentsSearchL, #enableTgxtorrentSearchL, #enableNyaaSearchL': 'onlineFilter',
            'change .online-categories select': 'setCategory',
        },

        ui: {
            spinner: '.spinner'
        },

        initialize: function () {
            if (!fs.existsSync(collection)) {
                fs.mkdirSync(collection);
            }
            this.files = fs.readdirSync(collection);
        },

        onAttach: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-torrent-collection').click();
            });

            this.render();
        },

        onRender: function () {
            if (typeof (this.ui.spinner) === 'object') {
                this.ui.spinner.hide();
            }
            $('#online-input').focus();
            if (this.files[0]) {
                $('.notorrents-info').css('display', 'none');
                $('.torrents-info').css('display', 'block');
            }
            if (Settings.toggleSengines) {
                this.togglesengines();
            }
            if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
                $('.file-item, .file-item a, .collection-paste, .collection-import').addClass('disabled').prop('disabled', true);
            }

            clearTimeout(hidetooltps);

            this.$('.tooltipped').tooltip({
                html: true,
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
        },

        togglesengines: function () {
            if($('.search_in').is(':visible')) {
                $('.togglesengines').removeClass('fa-caret-up').addClass('fa-caret-down');
                $('.search_in').css('display', 'none');
                AdvSettings.set('toggleSengines', false);
            } else {
                $('.togglesengines').removeClass('fa-caret-down').addClass('fa-caret-up');
                $('.search_in').css('display', 'block');
                if (!Settings.toggleSengines) {
                    AdvSettings.set('toggleSengines', true);
                }
            }
        },

        toggleThepiratebay: function () {
            AdvSettings.set('enableThepiratebaySearch', !Settings.enableThepiratebaySearch);
        },

        toggle1337x: function () {
            AdvSettings.set('enable1337xSearch', !Settings.enable1337xSearch);
        },

        toggleSolidtorrents: function () {
            AdvSettings.set('enableSolidTorrentsSearch', !Settings.enableSolidTorrentsSearch);
        },

        toggleTgxtorrent: function () {
            AdvSettings.set('enableTgxtorrentSearch', !Settings.enableTgxtorrentSearch);
        },

        toggleNyaa: function () {
            AdvSettings.set('enableNyaaSearch', !Settings.enableNyaaSearch);
        },

        setCategory: function () {
            var category = $('.online-categories > select').val();
            AdvSettings.set('OnlineSearchCategory', category);
        },

        onlineSearch: function (e, retry) {
            if (e) {
                e.preventDefault();
            }
            var that = this;
            that.curitems = '';
            var input = $('#online-input').val();
            var category = $('.online-categories > select').val();
            AdvSettings.set('OnlineSearchCategory', category);
            if (category === 'Series') {
                category = 'TV';
            }
            var current = $('.onlinesearch-info > ul.file-list').html();

            if (input === '' && current === '') {
                return;
            } else if (input === '' && current !== '') {
                this.onlineClose();
                return;
            }

            this.ui.spinner.show();
            that.$('.online-search').addClass('active');
            that.$('.online-search, #enableThepiratebaySearchL, #enable1337xSearchL, #enableSolidTorrentsSearchL, #enableTgxtorrentSearchL, #enableNyaaSearchL').attr('title', '0 results').tooltip('fixTitle');

            clearTimeout(hidetooltps);

            var index = 0;

            var piratebay = function () {
                if (Settings.enableThepiratebaySearch) {
                    return new Promise(function (resolve) {
                        const results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 8000);
                        const tpb = torrentCollection.tpb;
                        tpb.search({
                            query: input,
                            category: category,
                            verified: false
                        }).then(function (data) {
                            $('#enableThepiratebaySearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                const itemModel = {
                                    provider: 'thepiratebay.org',
                                    icon: 'tpb',
                                    title: item.title,
                                    url: item.url,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                results.push(itemModel);
                                index++;
                            });
                            resolve(results);
                        }).catch(function (err) {
                            win.error('ThePirateBay search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var leetx = function () {
                if (Settings.enable1337xSearch) {
                    return new Promise(function (resolve) {
                        const results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 8000);
                        const leet = torrentCollection.leet;
                        leet.search({
                            query: input,
                            category: category,
                            verified: false
                        }).then(function (data) {
                            $('#enable1337xSearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                const itemModel = {
                                    provider: '1337x.to',
                                    icon: 'T1337x',
                                    title: item.title,
                                    url: item.url,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                results.push(itemModel);
                                index++;
                            });
                            resolve(results);
                        }).catch(function (err) {
                            win.error('1337x search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var solidtorrents = function () {
                if (Settings.enableSolidTorrentsSearch) {
                    return new Promise(function (resolve) {
                        const results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 8000);
                        const stor = torrentCollection.stor;
                        stor.search({
                            query: input,
                            category: category,
                            verified: false
                        }).then(function (data) {
                            $('#enableSolidTorrentsSearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                const itemModel = {
                                    provider: 'solidtorrents.to',
                                    icon: 'solidtorrents',
                                    title: item.title,
                                    url: item.url,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                results.push(itemModel);
                                index++;
                            });
                            resolve(results);
                        }).catch(function (err) {
                            win.error('SolidTorrents search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var torrentgalaxy = function () {
                if (Settings.enableTgxtorrentSearch) {
                    return new Promise(function (resolve) {
                        const results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 8000);
                        const tgx = torrentCollection.tgx;
                        tgx.search({
                            query: input,
                            category: category,
                            verified: false
                        }).then(function (data) {
                            $('#enableTgxtorrentSearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                const itemModel = {
                                    provider: 'torrentgalaxy.to',
                                    icon: 'TorrentGalaxy',
                                    title: item.title,
                                    url: item.url,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                results.push(itemModel);
                                index++;
                            });
                            resolve(results);
                        }).catch(function (err) {
                            win.error('TorrentGalaxy search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var nyaaSI = function () {
                if (Settings.enableNyaaSearch) {
                    return new Promise(function (resolve) {
                        const results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 8000);
                        const nyaa = torrentCollection.nyaa;
                        nyaa.search({
                            query: input,
                            category: category,
                            verified: false
                        }).then(function (data) {
                            $('#enableNyaaSearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                const itemModel = {
                                    provider: 'nyaa.si',
                                    icon: 'nyaa',
                                    title: item.title,
                                    url: item.url,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                results.push(itemModel);
                                index++;
                            });
                            resolve(results);
                        }).catch(function (err) {
                            win.error('Nyaa search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var removeDupesAndSort = function (arr) {
                const found = [];
                const unique = [];
                for (const a in arr) {
                    const provider = arr[a];
                    for (const p in provider) {
                        const obj = provider[p];
                        const link = obj.magnet.split('&dn');
                        if (found.indexOf(link[0]) === -1) {
                            found.push(link);
                            unique.push(obj);
                        }
                    }
                }
                return unique.sort(function (a, b) {
                    return b.seeds - a.seeds;
                });
            };

            return Promise.all([
                piratebay(),
                leetx(),
                solidtorrents(),
                torrentgalaxy(),
                nyaaSI(),
            ]).then(function (results) {
                var items = removeDupesAndSort(results);
                that.curitems = items;
                win.info('Search Providers: %d results', items.length);
                that.$('.online-search').attr('title', items.length + ' results').tooltip('fixTitle').tooltip('show');

                hidetooltps = setTimeout(function() {
                    $('.tooltip').tooltip('hide');
                }, 2000);

                $('.onlinesearch-info').scrollTop(0).hide();
                $('.onlinesearch-info>ul.file-list').html('');
                $('.notorrents-info,.torrents-info').hide();
                that.ui.spinner.hide();
                return Promise.all(items.map(function (item) {
                    that.onlineAddItem(item);
                })).then(function () {
                    if ($('.loading .maximize-icon').is(':visible')) {
                        $('.result-item, .result-item > *:not(.item-icon), .collection-paste, .collection-import').addClass('disabled').prop('disabled', true);
                    }
                    $('.onlinesearch-info').show();
                    if (items.length === 0) {
                        $('.onlinesearch-info>ul.file-list').html('<br><br><div style="text-align:center;font-size:30px">' + i18n.__('No results found') + '</div>');
                    }
                    that.$('.tooltipped').tooltip({
                        html: true,
                        delay: {
                            'show': 50,
                            'hide': 50
                        }
                    });
                });
            });
        },

        onlineAddItem: function (item, provider) {
            if (!provider || item.provider === provider) {
                $('.onlinesearch-info>ul.file-list').append(
                    '<li class="result-item" data-index="' + item.index + '" data-file="' + item.magnet + '" data-source="' + item.url + '">'+
                        '<a>' + item.title + '</a>'+
                        '<div class="item-icon magnet-icon tooltipped" data-toggle="tooltip" data-placement="left" title="' + item.provider + '"><img src="/src/app/images/icons/' + item.icon + '.png"></div>'+
                        '<div class="online-health tooltipped" title="' + i18n.__('Seeds') + ' &nbsp;/&nbsp; ' + i18n.__('Peers') + '" data-toggle="tooltip" data-container="body" data-placement="top">'+item.seeds+' / '+item.peers+'</div>'+
                        '<div class="online-size">'+item.size+'</div>'+
                    '</li>'
                );
            }
        },

        onlineFilter: function (e) {
            var that = this;
            var provider = e.target.classList.contains('providerIcon') ? e.target.parentNode.textContent : e.target.textContent;
            if (!that.curitems || that.curprovider === provider) {
                return;
            }
            that.curprovider = provider;
            $('.onlinesearch-info>ul.file-list').html('');
            $('.onlinesearch-info').scrollTop(0);
            return Promise.all(that.curitems.map(function (item) {
                that.onlineAddItem(item, provider);
            })).then(function () {
                if ($('.loading .maximize-icon').is(':visible')) {
                    $('.result-item, .result-item > *:not(.item-icon), .collection-paste, .collection-import').addClass('disabled').prop('disabled', true);
                }
                if ($('.onlinesearch-info>ul.file-list').html() === '') {
                    $('.onlinesearch-info>ul.file-list').html('<br><br><div style="text-align:center;font-size:30px">' + i18n.__('No results found') + '</div>');
                }
                that.$('.tooltipped').tooltip({
                    html: true,
                    delay: {
                        'show': 50,
                        'hide': 50
                    }
                });
            });
        },

        onlineOpen: function (e) {
            var file = e.currentTarget.parentNode.dataset.file;
            Settings.droppedMagnet = file;
            window.handleTorrent(file);
        },

        onlineClose: function () {
            this.curitems = '';
            this.curprovider = '';
            $('.online-search').removeClass('active');
            $('.onlinesearch-info>ul.file-list').html('');
            $('.onlinesearch-info').hide();
            this.render();
        },

        rightclick_search: function (e) {
            e.preventDefault();
            var search_menu = new this.context_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'));
            search_menu.popup(e.originalEvent.x, e.originalEvent.y);
        },

        context_Menu: function (cutLabel, copyLabel, pasteLabel) {
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

        openFileSelector: function (e) {
            var _file = e.currentTarget.parentNode.innerText,
                file = _file.substring(0, _file.length - 2); // avoid ENOENT

            if (_file.indexOf('.torrent') !== -1) {
                Settings.droppedTorrent = file;
                window.handleTorrent(collection + file);
            } else { // assume magnet
                var content = fs.readFileSync(collection + file, 'utf8');
                Settings.droppedMagnet = content;
                Settings.droppedStoredMagnet = file;
                window.handleTorrent(content);
            }
        },

        openMagnet: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();
            var magnetLink;
            if (e.currentTarget.parentNode.className.indexOf('file-item') !== -1) {
                // stored
                var _file = e.currentTarget.parentNode.innerText,
                    file = _file.substring(0, _file.length - 2); // avoid ENOENT
                magnetLink = fs.readFileSync(collection + file, 'utf8');
            } else {
                // search result
                magnetLink = e.currentTarget.parentNode.attributes['data-file'].value;
            }
            magnetLink = magnetLink.split('&tr=')[0] + _.union(decodeURIComponent(magnetLink).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
            Common.openOrClipboardLink(e, magnetLink, i18n.__('magnet link'));
        },

        openTorrent: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget.parentNode.className.indexOf('file-item') !== -1) {
                let _file = e.currentTarget.parentNode.innerText;
                let torrentFile = path.join(collection ,_file.substring(0, _file.length - 2)).toString(); // avoid ENOENT
                Common.openOrClipboardLink(e, torrentFile, i18n.__('torrent file'), false, true);
            }
        },

        openSource: function(e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();
            var sourceLink;
            if (e.currentTarget.parentNode.className.indexOf('file-item') !== -1) {
                // stored
                var _file = e.currentTarget.parentNode.innerText,
                    file = _file.substring(0, _file.length - 2); // avoid ENOENT
                sourceLink = fs.readFileSync(collection + file, 'utf8');
            } else {
                // search result
                sourceLink = e.currentTarget.parentNode.parentNode.attributes['data-source'].value;
            }
            if (sourceLink) {
                Common.openOrClipboardLink(e, sourceLink, i18n.__('source link'));
            }
        },

        deleteItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = e.currentTarget.parentNode.innerText,
                file = _file.substring(0, _file.length - 2); // avoid ENOENT

            var delItem = function () {
                App.vent.trigger('notification:close');
                fs.unlinkSync(collection + file);
                this.files = fs.readdirSync(collection);
                this.render();
                $('.notification_alert').stop().text(i18n.__('Torrent removed')).fadeIn('fast').delay(1500).fadeOut('fast');
            }.bind(this);

            var keepItem = function () {
                App.vent.trigger('notification:close');
            };

            App.vent.trigger('notification:show', new App.Model.Notification({
                title: '',
                body: '<font size="3">' + i18n.__('Remove') + '</font><br>' + file,
                showClose: false,
                type: 'info',
                buttons: [{ title: '<label class="export-database" for="exportdatabase">' + i18n.__('Yes') + '</label>', action: delItem }, { title: '<label class="export-database" for="exportdatabase">' + i18n.__('No') + '</label>', action: keepItem }]
            }));
        },

        renameItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = e.currentTarget.parentNode.innerText,
                file = _file.substring(0, _file.length - 2), // avoid ENOENT
                isTorrent = false;

            if (file.endsWith('.torrent')) {
                isTorrent = 'torrent';
            }

            var newName = this.renameInput(file);
            if (!newName) {
                return;
            }

            if (isTorrent) { //torrent
                if (!newName.endsWith('.torrent')) {
                    newName += '.torrent';
                }
            } else { //magnet
                if (newName.endsWith('.torrent')) {
                    newName = newName.replace('.torrent', '');
                }
            }

            if (!fs.existsSync(collection + newName) && newName) {
                fs.renameSync(collection + file, collection + newName);
            } else {
                $('.notification_alert').show().text(i18n.__('This name is already taken')).delay(2500).fadeOut(400);
            }

            // update collection
            this.files = fs.readdirSync(collection);
            this.render();
        },

        renameInput: function (oldName) {
            var userInput = prompt(i18n.__('Enter new name'), oldName);
            if (!userInput || userInput === oldName) {
                return false;
            } else {
                return userInput;
            }
        },

        pasteItem: function () {
            if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
                return;
            }
            var data = clipboard.get('text');
            Settings.droppedMagnet = data;
            window.handleTorrent(data, 'text');
        },

        importItem: function () {
            if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
                return;
            }
            this.$('.tooltip').css('display', 'none');

            var that = this;
            var input = document.querySelector('.collection-import-hidden');
            input.addEventListener('change', function (evt) {
                var file = $('.collection-import-hidden')[0].files[0];
                that.render();
                window.ondrop({
                    dataTransfer: {
                        files: [file]
                    },
                    preventDefault: function () {}
                });
            }, false);

            input.click();
        },

        openCollection: function () {
            App.settings.os === 'windows' ? nw.Shell.openExternal(collection) : nw.Shell.openItem(collection);
        },

        onBeforeDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        closeTorrentCollection: function () {
            App.vent.trigger('torrentCollection:close');
        }

    });

    App.View.TorrentCollection = TorrentCollection;
})(window.App);
