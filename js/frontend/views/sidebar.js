var SidebarTemplate = $('#sidebar-tpl').html();

App.View.Sidebar = Backbone.View.extend({
    template: _.template(SidebarTemplate),

    events: {
        'click .closer':           'hide',
        'click .play-button':      'play',
        'click .subtitles button': 'selectSubtitle',
        'click .dropdown-toggle':  'toggleDropdown',
        'click #switch-on':        'enableHD',
        'click #switch-off':       'disableHD'
    },

    toggleDropdown: function (evt) {
        $(evt.currentTarget).parent().toggleClass('active');
    },

    selectSubtitle: function (evt) {
        var $button = $(evt.currentTarget),
            lang = $button.val();

        $button
            .closest('.dropdown').removeClass('active')
            .find('.lang-placeholder').attr('src', $button.find('img').attr('src'));
        this.model.set('selectedSubtitle', lang);

    },

    play: function (evt) {
        evt.preventDefault();
        if( videoPeerflix != null ){ return; } 

        var file = this.model.get('torrent'),
            subs = this.model.get('subtitles'),
            selectedSub = this.model.get('selectedSubtitle'),
            subsFiles = [],
            subsFile,
            subtitle;

        function getSubtitle ( subUrl, subOutputFile ) {
            var request = require('request');
            var fs = require('fs');
            var AdmZip = require('adm-zip');
            var http = require('http');
            var url = require('url');
            var charsetDetect = require('jschardet');
            var targetCharset = 'UTF-8';
            var targetEncodingCharset = 'utf8';

            var options = {
                host: url.parse(subUrl).host,
                port: 80,
                path: url.parse(subUrl).pathname
            };

            http.get(options, function(res) {
                var data = [], dataLen = 0;
                res.on('data', function(chunk) {
                    data.push(chunk);
                    dataLen += chunk.length;
                }).on('end', function() {
                        var buf = new Buffer(dataLen);

                        for (var i=0, len = data.length, pos = 0; i < len; i++) {
                            data[i].copy(buf, pos);
                            pos += data[i].length;
                        }
                        var zip = new AdmZip(buf);
                        var zipEntries = zip.getEntries();
                        zipEntries.forEach(function(zipEntry, key) {
                            if (zipEntry.entryName.indexOf('.srt') != -1) {
                                var decompressedData = zip.readFile(zipEntry); // decompressed buffer of the entry
                                var charset = charsetDetect.detect(decompressedData);
                                if (charset == targetEncodingCharset || charset == targetCharset) {
                                    fs.writeFile( subOutputFile, decompressedData);
                                    return;
                                } else {
                                    var iconv = require('iconv-lite');
                                    decompressedData = iconv.encode( iconv.decode(decompressedData, charset.encoding), targetEncodingCharset);
                                    fs.writeFile( subOutputFile, decompressedData);
                                    return;
                                }
                            }
                        });
                    });
            });
        }

        if (subs) {
            // Download all the subs so they are available during the video playback
            for( lang in subs ) {
                subsFiles[lang] = 'tmp/' + this.model.get('title').replace(/([^a-zA-Z0-9-_])/g, '_') + '-' + this.model.get('quality') + '-' + lang + '.srt';
                getSubtitle(subs[lang], subsFiles[lang]);
            }
        }

        playTorrent(file, subsFiles, 
            function(){}, 
            function(percent){

                // Loading Progress Handler. Percent is 5% + Actual progress, to keep the progressbar moving even when it's at the min-width
                var $progress = $('.popcorn-load').find('.progress');
                var minWidth = parseFloat($progress.css('min-width'));
                percent = minWidth + percent * ((100.0-minWidth)/100.0);
                percent = percent > 100.0 ? 100.0 : percent;
                $('.popcorn-load').find('.progress').css('width', percent+'%');

                // Update the loader status
                var bufferStatus = i18n.__('connecting');
                if( videoPeerflix.peers.length > 0 ) {
                    bufferStatus = i18n.__('startingDownload');
                    if( videoPeerflix.downloaded > 0 ) {
                        bufferStatus = i18n.__('downloading');
                    }
                }
                $('.popcorn-load .progressinfo').text(bufferStatus);
            }
        );
        $('.popcorn-load').addClass('withProgressBar').addClass('cancellable').find('.progress').css('width', 0.0+'%');
        $('.popcorn-load .progressinfo').text( i18n.__('connecting') );

        App.loader(true, i18n.__('loadingVideo'));
    },

    initialize: function () {
        this.setElement($('sidebar'));
    },

    load: function (model) {
        // TODO: QUEUE PLAY BUTTON
        this.listenTo(model, 'change:subtitles', this.render);

        this.model = model;
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.show();
    },

    isVisible: function () {
        return !this.$el.is('.hidden');
    },

    hide: function () {
        $('body').removeClass('sidebar-open');
        $('.movie.active').removeClass('active');
        this.$el.addClass('hidden');
    },

    show: function () {
        $('body').addClass('sidebar-open');
        this.$el.removeClass('hidden');
    },

    enableHD: function (evt) {

        var torrents = this.model.get('torrents');
        console.log('HD Enabled');

        if(torrents['1080p'] !== undefined) {
            this.model.set('torrent', torrents['1080p']);
            this.model.set('quality', '1080p');
        }
    },

    disableHD: function (evt) {

        var torrents = this.model.get('torrents');
        console.log('HD Disabled');

        if(torrents['720p'] !== undefined) {
            this.model.set('torrent', torrents['720p']);
            this.model.set('quality', '720p');
        }
    }
});
