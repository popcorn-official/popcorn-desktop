(function (App) {
    'use strict';

    var clipboard = nw.Clipboard.get(),
        torrentsDir = path.join(App.settings.tmpLocation + '/TorrentCache/');

    var formatBytes = function (bytes, decimals) {
       if(bytes === 0) {
         return '0 Bytes';
       }

       let k = 1024,
           dm = decimals || 2,
           sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
           i = Math.floor(Math.log(bytes) / Math.log(k));
       return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    var Seedbox = Marionette.View.extend({
        template: '#seedbox-tpl',
        className: 'seedbox',

        events: {
            'mousedown .file-item': 'openFileSelector',
            'mousedown .result-item': 'onlineOpen',
            'mousedown .item-delete': 'deleteItem',
            'mousedown .item-rename': 'renameItem',
            'mousedown .magnet-icon': 'openMagnet',
            'mousedown .pause-torrent': 'pauseTorrent',
            'mousedown .resume-torrent': 'resumeTorrent',
            'mousedown .trash-torrent': 'removeTorrent',
            'click .tab-torrent': 'clickTorrent',
        },

        initialize: function () {
            if (!fs.existsSync(torrentsDir)) {
                fs.mkdirSync(torrentsDir);
                console.debug('Seedbox: data directory created');
            }

            App.WebTorrent.on('torrent', (torrent) => {
              this.onNewTorrents(torrent);
            });

            App.WebTorrent.torrents.forEach((torrent) => {
              this.onNewTorrents(torrent);
            });

            setInterval(() => {
              this.selectTorrent($('.tab-torrent.active'));
            }, 1000);
        },

        onAttach: function () {
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                $('#filterbar-seedbox').click();
            });

            this.render();
        },

        onRender: function () {
            $('#online-input').focus();
            this.$('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
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

        onNewTorrents: function (torrent) {
          setTimeout(() => {
            $('.notorrents-info').hide();
            if ($(`#${torrent.infoHash}`).length || !torrent.name) {
              return;
            }

            let activing = App.WebTorrent.torrents.filter(item => !item.paused).length;
            if (!torrent.paused && activing >= Settings.maxActiveTorrents) {
              this.pauseTorrent(null, torrent.infoHash);
              torrent.paused = true;
            }

            let lastUpdated = Date.now();
            torrent.on('download', function (bytes) {
              if (Date.now() - lastUpdated <= 1000) {
                return;
              }

              $(`#download-${torrent.infoHash}`).text(' ' + formatBytes(torrent.downloadSpeed) + '/s');
              $(`#upload-${torrent.infoHash}`).text(' ' + formatBytes(torrent.uploadSpeed) + '/s');
              lastUpdated = Date.now();
            });

            torrent.on('upload', function (bytes) {
              if (Date.now() - lastUpdated <= 1000) {
                return;
              }

              $(`#download-${torrent.infoHash}`).text(' ' + formatBytes(torrent.downloadSpeed) + '/s');
              $(`#upload-${torrent.infoHash}`).text(' ' + formatBytes(torrent.uploadSpeed) + '/s');
              lastUpdated = Date.now();
            });

            let className = 'tab-torrent';
            if ($('.tab-torrent.active').length <= 0) {
              className += ' active';
            }

            $('.seedbox-torrent-list>ul.file-list').append(
              `<li class="${className}" id="${torrent.infoHash}" data-season="1" data-episode="10">
                <a href="#" class="episodeData">
                    <span>1</span>
                    <div>${torrent.name}</div>
                </a>

                <i class="fa fa-trash-alt watched trash-torrent" id="trash-${torrent.infoHash}"></i>
                <i class="fa fa-play watched resume-torrent" id="play-${torrent.infoHash}" style="display: ${torrent.paused ? '' : 'none'};"></i>
                <i class="fa fa-pause-circle watched pause-torrent" id="resume-${torrent.infoHash}" style="display: ${torrent.paused ? 'none' : ''};"></i>
                <i class="fa fa-upload watched" id="upload-${torrent.infoHash}"> 0 Kb/s</i>
                <i class="fa fa-download watched" id="download-${torrent.infoHash}"> 0 Kb/s</i>
              </li>`
            );

            $('.seedbox-overview').show();
          }, 500 + Math.floor(Math.random() * Math.floor(500)));
        },

        pauseTorrent: (e, id) => {
          let hash = id || e.currentTarget.parentNode.getAttribute('id');
          App.WebTorrent.torrents.forEach(torrent => {
            if (torrent.infoHash === hash) {
              torrent.pause();
              // complete fause torrent, stop download data
              for (const id in torrent._peers) {
                torrent.removePeer(id);
              }

              torrent._xsRequests.forEach(req => {
                req.abort();
              });

              $(`#resume-${torrent.infoHash}`).hide();
              $(`#play-${torrent.infoHash}`).show();
            }
          });
        },

        resumeTorrent: (e, id) => {
          let hash = id || e.currentTarget.parentNode.getAttribute('id');
          App.WebTorrent.torrents.forEach(torrent => {
            if (torrent.infoHash === hash) {
              torrent.resume();
              $(`#resume-${torrent.infoHash}`).show();
              $(`#play-${torrent.infoHash}`).hide();
            }
          });
        },

        removeTorrent: (e) => {
          let hash = e.currentTarget.parentNode.getAttribute('id');
          App.WebTorrent.torrents.forEach(torrent => {
            if (torrent.infoHash === hash) {
              torrent.destroy(() => {
                fs.unlinkSync(path.join(torrentsDir, torrent.infoHash));
                rimraf(path.join(App.settings.tmpLocation, torrent.infoHash), () => {});
              });

              $(`#${torrent.infoHash}`).remove();
              if ($('.tab-torrent').length <= 0) {
                $('.notorrents-info').show();
                $('.seedbox-overview').hide();
              }
            }
          });
        },

        clickTorrent: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

            $('.tab-torrent.active').removeClass('active');
            $(e.currentTarget).addClass('active');
            this.selectTorrent($(e.currentTarget));
        },

        selectTorrent: function ($elem) {
            if ($elem.length === 0) {
                return;
            }

            let infoHash = $elem.attr('id');
            let stats = fs.statSync(App.settings.tmpLocation + '/TorrentCache/' + infoHash);
            let torrent = App.WebTorrent.get(infoHash);
            $('.seedbox-infos-title').text(torrent.name);
            $('.seedbox-downloaded').text(' ' + formatBytes(torrent.downloaded));
            $('.seedbox-uploaded').text(' ' + formatBytes(torrent.uploaded));
            $('.seedbox-infos-date').text(stats.ctime);
            $('.torrents-info>ul.file-list').empty();
            $('.progress-bar').css('width', (torrent.progress * 100).toFixed(2) + '%');
            $('.progress-percentage>span').text((torrent.progress * 100).toFixed(2) + '%');
            for (let file of torrent.files) {
              $('.torrents-info>ul.file-list').append(
                `<li class="file-item">
                    <a>${file.name}</a>
                    <i class="fa fa-folder-open item-delete tooltipped" data-toggle="tooltip" data-placement="left" title=""></i>
                </li>`
              );
            }
        },

        onBeforeDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        closeTorrentCollection: function () {
            App.vent.trigger('seedbox:close');
        }

    });

    App.View.Seedbox = Seedbox;
})(window.App);
