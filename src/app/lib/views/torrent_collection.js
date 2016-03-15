(function (App) {
    'use strict';

    var clipboard = gui.Clipboard.get(),
        collection = path.join(data_path + '/TorrentCollection/'),
        files;

    var TorrentCollection = Backbone.Marionette.ItemView.extend({
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
            'click .engine-icon': 'changeEngine',
            'submit #online-form': 'onlineSearch',
            'click .online-back': 'onlineClose',
            'contextmenu #online-input': 'rightclick_search'
        },

        initialize: function () {
            if (!fs.existsSync(collection)) {
                fs.mkdirSync(collection);
                win.debug('TorrentCollection: data directory created');
            }
            this.files = fs.readdirSync(collection);
            this.searchEngine = Settings.onlineSearchEngine;
        },

        onShow: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-torrent-collection').click();
            });

            $('#movie-detail').hide();
            $('#nav-filters').hide();

            this.render();
        },

        onRender: function () {
            /*$('.engine-icon').removeClass('active');
            $('#' + this.searchEngine.toLowerCase() + '-icon').addClass('active');
            $('#online-input').focus();*/
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

        changeEngine: function (e) {
            e.preventDefault();

            Settings.onlineSearchEngine = this.searchEngine = e.currentTarget.dataset.id;
            AdvSettings.set('onlineSearchEngine', this.searchEngine);

            if ($('#online-input').val().length !== 0) {
                $('.engine-icon').removeClass('active');
                $('#' + this.searchEngine.toLowerCase() + '-icon').addClass('active');
                this.onlineSearch();
            } else {
                this.render();
            }
        },

        onlineSearch: function (e) {
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

                var strike = require('strike-api');
                strike.search(input, category).then(function (result) {
                    win.debug('Strike search: %s results', result.results);
                    result.torrents.forEach(function (item) {
                        var itemModel = {
                            title: item.torrent_title,
                            magnet: item.magnet_uri,
                            seeds: item.seeds,
                            peers: item.leeches,
                            size: Common.fileSize(parseInt(item.size)),
                            index: index
                        };

                        that.onlineAddItem(itemModel);
                        index++;
                    });

                    that.$('.tooltipped').tooltip({
                        html: true,
                        delay: {
                            'show': 50,
                            'hide': 50
                        }
                    });
                    $('.notorrents-info,.torrents-info').hide();
                    $('.online-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
                    $('.onlinesearch-info').show();
                }).catch(function (err) {
                    win.debug('Strike search failed:', err.message);
                    var error;
                    if (err.message === 'Not Found') {
                        error = 'No results found';
                    } else {
                        error = 'Failed!';
                    }
                    $('.onlinesearch-info>ul.file-list').html('<br><br><div style="text-align:center;font-size:30px">' + i18n.__(error) + '</div>');

                    $('.online-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
                    $('.notorrents-info,.torrents-info').hide();
                    $('.onlinesearch-info').show();
                });
            
        },

        onlineAddItem: function (item) {
            var ratio = item.peers > 0 ? item.seeds / item.peers : +item.seeds;
            $('.onlinesearch-info>ul.file-list').append(
                '<li class="result-item" data-index="' + item.index + '" data-file="' + item.magnet + '"><a>' + item.title + '</a><div class="item-icon magnet-icon tooltipped" data-toogle="tooltip" data-placement="right" title="' + i18n.__('Magnet link') + '"></div><i class="online-size tooltipped" data-toggle="tooltip" data-placement="left" title="' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + '<br>' + i18n.__('Seeds:') + ' ' + item.seeds + ' - ' + i18n.__('Peers:') + ' ' + item.peers + '">' + item.size + '</i></li>'
            );
            if (item.seeds === 0) { // recalc the peers/seeds
                var torrent = item.magnet.split('&tr')[0] + '&tr=udp://tracker.openbittorrent.com:80/announce' + '&tr=udp://9.rarbg.com:2710/announce' + '&tr=udp://tracker.coppersurfer.tk:6969' + '&tr=udp://tracker.publicbt.com:80/announce';
                require('torrent-tracker-health')(torrent, {
                    timeout: 1000
                }).then(function (res) {
                    //console.log('torrent index %s: %s -> %s (seeds)', item.index, item.seeds, res.seeds)
                    ratio = res.peers > 0 ? res.seeds / res.peers : +res.seeds;
                    $('.result-item[data-index=' + item.index + '] i').attr('data-original-title', i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + '<br>' + i18n.__('Seeds:') + ' ' + res.seeds + ' - ' + i18n.__('Peers:') + ' ' + res.peers);
                });
            }
        },

        onlineOpen: function (e) {
            var file = $(e.currentTarget).context.dataset.file;
            Settings.droppedMagnet = file;
            window.handleTorrent(file);
        },

        onlineClose: function () {
            $('.onlinesearch-info>ul.file-list').html('');
            $('.onlinesearch-info').hide();
            this.render();
        },

        rightclick_search: function (e) {
            e.stopPropagation();
            var search_menu = new this.context_Menu(i18n.__('Cut'), i18n.__('Copy'), i18n.__('Paste'));
            search_menu.popup(e.originalEvent.x, e.originalEvent.y);
        },

        context_Menu: function (cutLabel, copyLabel, pasteLabel) {
            var menu = new gui.Menu(),

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
                        $('#online-input').val(text);
                    }
                });

            menu.append(cut);
            menu.append(copy);
            menu.append(paste);

            return menu;
        },

        openFileSelector: function (e) {
            var _file = $(e.currentTarget).context.innerText,
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

            if ($(e.currentTarget.parentNode).context.className === 'file-item') {
                // stored
                var _file = $(e.currentTarget.parentNode).context.innerText,
                    file = _file.substring(0, _file.length - 2); // avoid ENOENT
                magnetLink = fs.readFileSync(collection + file, 'utf8');
            } else {
                // search result
                magnetLink = $(e.currentTarget.parentNode).context.attributes['data-file'].value;
            }

            if (e.button === 2) { //if right click on magnet link
                var clipboard = gui.Clipboard.get();
                clipboard.set(magnetLink, 'text'); //copy link to clipboard
                $('.notification_alert').text(i18n.__('The magnet link was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else {
                gui.Shell.openExternal(magnetLink);
            }
        },

        deleteItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = $(e.currentTarget.parentNode).context.innerText,
                file = _file.substring(0, _file.length - 2); // avoid ENOENT

            fs.unlinkSync(collection + file);
            win.debug('Torrent Collection: deleted', file);

            // update collection
            this.files = fs.readdirSync(collection);
            this.render();
        },

        renameItem: function (e) {
            this.$('.tooltip').css('display', 'none');
            e.preventDefault();
            e.stopPropagation();

            var _file = $(e.currentTarget.parentNode).context.innerText,
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
                win.debug('Torrent Collection: renamed', file, 'to', newName);
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
            deleteFolder(collection);
            win.debug('Torrent Collection: delete all', collection);
            App.vent.trigger('torrentCollection:show');
        },

        openCollection: function () {
            win.debug('Opening: ' + collection);
            gui.Shell.openItem(collection);
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

        onDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
            $('#movie-detail').show();
            $('#nav-filters').show();
        },

        closeTorrentCollection: function () {
            App.vent.trigger('torrentCollection:close');
        }

    });

    App.View.TorrentCollection = TorrentCollection;
})(window.App);
