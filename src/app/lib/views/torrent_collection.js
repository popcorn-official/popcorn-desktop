(function (App) {
    'use strict';

    var clipboard = nw.Clipboard.get(),
        collection = path.join(data_path + '/TorrentCollection/');

    var TorrentCollection = Marionette.View.extend({
        template: '#torrent-collection-tpl',
        className: 'torrent-collection',

        events: {
            'mousedown .file-item': 'openFileSelector',
            'mousedown .result-item': 'onlineOpen',
            'mousedown .item-delete': 'deleteItem',
            'mousedown .item-rename': 'renameItem',
            'mousedown .magnet-icon': 'openMagnet',
            'click .collection-delete': 'clearCollection',
            'click .collection-open': 'openCollection',
            'click .collection-import': 'importItem',
            'click .notorrents-frame': 'importItem',
            'click .online-search': 'onlineSearch',
            'submit #online-form': 'onlineSearch',
            'click .online-back': 'onlineClose',
            'contextmenu #online-input': 'rightclick_search'
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
                $('.collection-actions').css('display', 'block');
                $('.torrents-info').css('display', 'block');
            }

            this.$('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
        },

        onlineSearch: function (e, retry) {
            if (e) {
                e.preventDefault();
            }
            var that = this;
            var input = $('#online-input').val();
            var category = $('.online-categories > select').val();
            AdvSettings.set('OnlineSearchCategory', category);
            if (category === 'TV Series') {
                category = 'TV';
            }
            var current = $('.onlinesearch-info > ul.file-list').html();

            if (input === '' && current === '') {
                return;
            } else if (input === '' && current !== '') {
                this.onlineClose();
                return;
            }

            $('.onlinesearch-info>ul.file-list').html('');

            $('.online-search').removeClass('fa-search').addClass('fa-spin fa-spinner');

            var index = 0;
            console.warn(category);

            var leetx = function () {
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
                        sortBy: 'desc',
                    }).then(function (data) {
                        console.debug('1337x search: %s results', data.torrents.length);
                        var indx = 1, totl = data.length;
                        data.torrents.forEach(function (item) {
                            leet.info('https://1337x.to' + item.href).then(function (ldata) {
                                var itemModel = {
                                    title: ldata.title,
                                    magnet: ldata.download.magnet,
                                    seeds: ldata.seeders,
                                    peers: ldata.leechers,
                                    size: ldata.size,
                                    index: index
                                };
                                indx++;
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
            };

            var omgtorrent = function () {
                return new Promise(function (resolve) {
                    var results = [];
                    setTimeout(function () {
                        resolve(results);
                    }, 6000);
                    var omg = torrentCollection.omg;
                    omg.search({
                        query: input.toLocaleLowerCase(),
                        type: category.toLocaleLowerCase() === 'movies' ? 'films' : 'series',
                        order: 'seeders',
                        orderBy: 'desc',
                    }).then(function (data) {
                        console.debug('OMG search: %s results', data.torrents.length);
                        var indx = 1, totl = data.length;
                        data.torrents.forEach(function (item) {
                            omg.info(item.href).then(function (ldata) {
                                var itemModel = {
                                    title: ldata.title,
                                    magnet: ldata.download.magnet,
                                    seeds: ldata.seeders,
                                    peers: ldata.leechers,
                                    size: ldata.size,
                                    index: index
                                };
                                indx++;
                                if (item.title.match(/trailer/i) !== null && input.match(/trailer/i) === null) {
                                    return;
                                }
                                results.push(itemModel);
                                index++;
                            }).catch(function (err) {
                                throw 'OMG info failed';
                            });
                        });
                    }).catch(function (err) {
                        console.error('OMG search:', err);
                        resolve(results);
                    });
                });
            };

            var piratebay = function () {
                return new Promise(function (resolve) {
                    var results = [];
                    setTimeout(function () {
                        resolve(results);
                    }, 6000);
                    var tpb = torrentCollection.tpb;
                    tpb.search(input.toLocaleLowerCase(), {
                        category: 'video',
                        page : 0,
                        orderBy: 'seeds',
                        sortBy: 'desc'
                    }).then(function (data) {
                        console.debug('TPB search: %s results', data.length);
                        data.forEach(function (item) {
                            if (!item.category) {
                                return;
                            }

                            var itemModel = {
                                title: item.name,
                                magnet: item.magnetLink,
                                seeds: item.seeders,
                                peers: item.leechers,
                                size: item.size,
                                index: index
                            };

                            if (item.name.match(/trailer/i) !== null && item.name.match(/trailer/i) === null) {
                                return;
                            }
                            results.push(itemModel);
                            index++;
                        });
                        resolve(results);
                    }).catch(function (err) {
                        console.error('tpb search:', err);
                        resolve(results);
                    });
                });
            };

            var rarbg = function (retry) {
                return new Promise(function (resolve) {
                    var results1 = [];
                    setTimeout(function () {
                        resolve(results1);
                    }, 6000);
                    var rbg = torrentCollection.rbg;
                    rbg.search({
                        query: input.toLocaleLowerCase(),
                        category: category.toLocaleLowerCase() === 'movies' ? 'movies' : 'tv',
                        sort: 'seeders',
                        verified: false
                    }).then(function (results) {
                        console.debug('rarbg search: %s results', results.length);
                        results.forEach(function (item) {
                            var itemModel = {
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
                            results1.push(itemModel);
                            index++;
                        });
                        resolve(results1);
                    }).catch(function (err) {
                        console.error('rarbg search:', err);
                        if (!retry) {
                            return resolve(rarbg(true));
                        } else {
                            resolve(results1);
                        }
                    });
                });
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
                leetx(),
                omgtorrent(),
                rarbg(),
                piratebay(),
            ]).then(function (results) {
                var items = sortBySeeds(removeDupes(results));
                console.log('search providers: %d results', items.length);

                return Promise.all(items.map(function (item) {
                    that.onlineAddItem(item);
                })).then(function () {
                    $('.online-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
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
            var ratio = item.peers > 0 ? item.seeds / item.peers : +item.seeds;
            $('.onlinesearch-info>ul.file-list').append(
                '<li class="result-item" data-index="' + item.index + '" data-file="' + item.magnet + '">'+
                    '<a>' + item.title + '</a>'+
                    '<div class="item-icon magnet-icon tooltipped" data-toogle="tooltip" data-placement="right" title="' + i18n.__('Magnet link') + '"></div>'+
                    '<i class="online-size tooltipped" data-toggle="tooltip" data-placement="left" title="' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + '<br>' + i18n.__('Seeds:') + ' ' + item.seeds + ' - ' + i18n.__('Peers:') + ' ' + item.peers + '">'+
                        item.size+
                    '</i>'+
                '</li>'
            );
            if (item.seeds === 0) { // recalc the peers/seeds
                require('webtorrent-health')(item.magnet, {
                    timeout: 1000,
                    blacklist: Settings.trackers.blacklisted,
                    force: Settings.trackers.forced
                }).then(function (res) {
                    //console.log('torrent index %s: %s -> %s (seeds)', item.index, item.seeds, res.seeds)
                    ratio = res.peers > 0 ? res.seeds / res.peers : +res.seeds;
                    $('.result-item[data-index=' + item.index + '] i').attr('data-original-title', i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + '<br>' + i18n.__('Seeds:') + ' ' + res.seeds + ' - ' + i18n.__('Peers:') + ' ' + res.peers);
                });
            }
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
                        var text = clipboard.get('text');
                        $('#online-input').val(text);
                    }
                });

            menu.append(cut);
            menu.append(copy);
            menu.append(paste);

            return menu;
        },

        openFileSelector: function (e) {
            var _file = e.currentTarget.innerText,
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

            if (e.currentTarget.parentNode.className === 'file-item') {
                // stored
                var _file = e.currentTarget.parentNode.innerText,
                    file = _file.substring(0, _file.length - 2); // avoid ENOENT
                magnetLink = fs.readFileSync(collection + file, 'utf8');
            } else {
                // search result
                magnetLink = e.currentTarget.parentNode.attributes['data-file'].value;
            }

            if (e.button === 2) { //if right click on magnet link
                var clipboard = nw.Clipboard.get();
                clipboard.set(magnetLink, 'text'); //copy link to clipboard
                $('.notification_alert').text(i18n.__('The magnet link was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else {
                nw.Shell.openExternal(magnetLink);
            }
        },

        deleteItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = e.currentTarget.parentNode.innerText,
                file = _file.substring(0, _file.length - 2); // avoid ENOENT

            fs.unlinkSync(collection + file);
            console.debug('Torrent Collection: deleted', file);

            // update collection
            this.files = fs.readdirSync(collection);
            this.render();
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

        clearCollection: function () {
            var btn = confirm(i18n.__('Are you sure you want to clear the entire Torrent Collection ?'));
            if (btn === true) {
                deleteFolder(collection);
                console.debug('Torrent Collection: delete all', collection);
                App.vent.trigger('torrentCollection:show');
            }
        },

        openCollection: function () {
            console.debug('Opening: ' + collection);
            nw.Shell.openItem(collection);
        },

        importItem: function () {
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

        onBeforeDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        closeTorrentCollection: function () {
            App.vent.trigger('torrentCollection:close');
        }

    });

    App.View.TorrentCollection = TorrentCollection;
})(window.App);
