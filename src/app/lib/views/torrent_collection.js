(function (App) {
    'use strict';

    var clipboard = nw.Clipboard.get(),
        collection = path.join(data_path + '/TorrentCollection/'),
        hidetooltps;

    var TorrentCollection = Marionette.View.extend({
        template: '#torrent-collection-tpl',
        className: 'torrent-collection',

        events: {
            'click .file-item a': 'openFileSelector',
            'contextmenu .file-item > *:not(.torrent-icon)': 'openMagnet',
            'click .result-item': 'onlineOpen',
            'contextmenu .result-item > *': 'openMagnet',
            'mousedown .item-delete': 'deleteItem',
            'mousedown .item-rename': 'renameItem',
            'click .magnet-icon': 'openMagnet',
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
            'change #enableRarbgSearch': 'toggleRarbg',
            'change #enableTgxtorrentSearch': 'toggleTgxtorrent'
        },

        initialize: function () {
            if (!fs.existsSync(collection)) {
                fs.mkdirSync(collection);
                console.debug('TorrentCollection: data directory created');
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

        toggleRarbg: function () {
            AdvSettings.set('enableRarbgSearch', !Settings.enableRarbgSearch);
        },

        toggleTgxtorrent: function () {
            AdvSettings.set('enableTgxtorrentSearch', !Settings.enableTgxtorrentSearch);
        },

        onlineSearch: function (e, retry) {
            if (e) {
                e.preventDefault();
            }
            var that = this;
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

            $('.togglesengines').css('visibility', 'hidden');
            $('.online-search').removeClass('fa-search').addClass('fa-spin fa-spinner');
            $('.online-search, #enableThepiratebaySearchL, #enable1337xSearchL, #enableRarbgSearchL, #enableTgxtorrentSearchL').attr('title', '0 results').tooltip('fixTitle');
            $('.onlinesearch-info').hide();
            $('.onlinesearch-info>ul.file-list').html('');

            clearTimeout(hidetooltps);

            var index = 0;

            var piratebay = function () {
                if (Settings.enableThepiratebaySearch) {
                    return new Promise(function (resolve) {
                        var results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 6000);
                        var tpb = torrentCollection.tpb;
                        tpb.search({
                            query: input,
                            category: category,
                            sort: 'seeders',
                            verified: false
                        }).then(function (data) {
                            console.debug('ThePirateBay search: %s results', data.torrents.length);
                            $('#enableThepiratebaySearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                var itemModel = {
                                    provider: 'https://thepiratebay.org',
                                    icon: 'tpb',
                                    title: item.title,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                if (item.title.match(/trailer/i) !== null && input.match(/trailer/i) === null) {
                                    return;
                                }
                                results.push(itemModel);
                                index++;
                            });
                        }).catch(function (err) {
                            console.error('ThePirateBay search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var leetx = function () {
                if (Settings.enable1337xSearch) {
                    return new Promise(function (resolve) {
                        var results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 6000);
                        var leet = torrentCollection.leet;
                        leet.search({
                            query: input.toLocaleLowerCase(),
                            category: category,
                            orderBy: 'seeders',
                            sortBy: 'desc'
                        }).then(function (data) {
                            console.debug('1337x search: %s results', data.torrents.length);
                            $('#enable1337xSearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                leet.info('https://1337x.to' + item.href).then(function (ldata) {
                                    var itemModel = {
                                        provider: '1337x.to',
                                        icon: 'T1337x',
                                        title: ldata.title,
                                        magnet: ldata.download.magnet,
                                        seeds: ldata.seeders,
                                        peers: ldata.leechers,
                                        size: ldata.size,
                                        index: index
                                    };
                                    if (item.title.match(/trailer/i) !== null && input.match(/trailer/i) === null) {
                                        return;
                                    }
                                    results.push(itemModel);
                                    index++;
                                }).catch(function (err) {
                                    throw 'nope';
                                });
                            });
                        }).catch(function (err) {
                            console.error('1337x search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var rarbg = function () {
                if (Settings.enableRarbgSearch) {
                    return new Promise(function (resolve) {
                        var results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 6000);
                        var rbg = torrentCollection.rbg;
                        rbg.search({
                            query: input.toLocaleLowerCase(),
                            category: category.toLocaleLowerCase(),
                            sort: 'seeders',
                            verified: false
                        }).then(function (data) {
                            console.debug('RARBG search: %s results', data.length);
                            $('#enableRarbgSearchL').attr('title', data.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.forEach(function (item) {
                                var itemModel = {
                                    provider: 'rarbg.to',
                                    icon: 'rarbg',
                                    title: item.title,
                                    magnet: item.download,
                                    seeds: item.seeders,
                                    peers: item.leechers,
                                    size: Common.fileSize(parseInt(item.size)),
                                    index: index
                                };
                                if (item.title.match(/trailer/i) !== null && input.match(/trailer/i) === null) {
                                    return;
                                }
                                results.push(itemModel);
                                index++;
                            });
                        }).catch(function (err) {
                            console.error('RARBG search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var torrentgalaxy = function () {
                if (Settings.enableTgxtorrentSearch) {
                    return new Promise(function (resolve) {
                        var results = [];
                        setTimeout(function () {
                            resolve(results);
                        }, 6000);
                        var tgx = torrentCollection.tgx;
                        tgx.search({
                            query: input,
                            category: category,
                            sort: 'seeders',
                            verified: false
                        }).then(function (data) {
                            console.debug('TorrentGalaxy search: %s results', data.torrents.length);
                            $('#enableTgxtorrentSearchL').attr('title', data.torrents.length + ' results').tooltip('fixTitle').tooltip('show');
                            data.torrents.forEach(function (item) {
                                var itemModel = {
                                    provider: 'torrentgalaxy.to',
                                    icon: 'TorrentGalaxy',
                                    title: item.title,
                                    magnet: item.magnet,
                                    seeds: item.seed,
                                    peers: item.leech,
                                    size: item.size,
                                    index: index
                                };
                                if (item.title.match(/trailer/i) !== null && input.match(/trailer/i) === null) {
                                    return;
                                }
                                results.push(itemModel);
                                index++;
                            });
                        }).catch(function (err) {
                            console.error('TorrentGalaxy search:', err);
                            resolve(results);
                        });
                    });
                }
            };

            var removeDupes = function (arr) {
                var found = [];
                var unique = [];
                for (var a in arr) {
                    var provider = arr[a];
                    for (var p in provider) {
                        var obj = provider[p];
                        var link = obj.magnet.split('&dn');
                        if (found.indexOf(link[0]) === -1) {
                            found.push(link);
                            unique.push(obj);
                        }
                    }
                }
                return unique;
            };

            var sortBySeeds = function (items) {
                return items.sort(function (a, b) {
                    return b.seeds - a.seeds;
                });
            };

            $('.notorrents-info,.torrents-info').hide();
            return Promise.all([
                piratebay(),
                leetx(),
                rarbg(),
                torrentgalaxy(),
            ]).then(function (results) {
                var items = sortBySeeds(removeDupes(results));
                console.log('Search Providers: %d results', items.length);
                $('.online-search').attr('title', items.length + ' results').tooltip('fixTitle').tooltip('show');

                hidetooltps = setTimeout(function() {
                    $('.tooltip').tooltip('hide');
                }, 2000);

                return Promise.all(items.map(function (item) {
                    that.onlineAddItem(item);
                })).then(function () {
                    if ($('.loading .maximize-icon').is(':visible')) {
                        $('.result-item, .collection-paste, .collection-import').addClass('disabled').prop('disabled', true);
                    }
                    $('.online-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
                    $('.togglesengines').css('visibility', 'visible');
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

        onlineAddItem: function (item) {
            $('.onlinesearch-info>ul.file-list').append(
                '<li class="result-item" data-index="' + item.index + '" data-file="' + item.magnet + '">'+
                    '<a>' + item.title + '</a>'+
                    '<div class="item-icon magnet-icon tooltipped" data-toogle="tooltip" data-placement="left" title="' + item.provider + '"><img src="/src/app/images/icons/' + item.icon + '.png" onerror="this.parentElement.innerHTML=`&#xf076`"></div>'+
                    '<div class="online-health tooltipped" title="' + i18n.__('Seeds') + ' / ' + i18n.__('Peers') + '" data-toggle="tooltip" data-container="body" data-placement="top">'+item.seeds+' / '+item.peers+'</div>'+
                    '<div class="online-size">'+item.size+'</div>'+
                '</li>'
            );
        },

        onlineOpen: function (e) {
            var file = e.currentTarget.dataset.file;
            Settings.droppedMagnet = file;
            window.handleTorrent(file);
        },

        onlineClose: function () {
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
            var torrentFile;
            if (e.currentTarget.parentNode.className.indexOf('file-item') !== -1) {
                var _file = e.currentTarget.parentNode.innerText,
                    torrentFile = path.join(collection ,_file.substring(0, _file.length - 2)).toString(); // avoid ENOENT
            }
            Common.openOrClipboardLink(e, torrentFile, i18n.__('torrent file'), false, true);
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
                console.debug('Torrent Collection: deleted', file);
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
                console.debug('Torrent Collection: renamed', file, 'to', newName);
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
            console.debug('Opening: ' + collection);
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
