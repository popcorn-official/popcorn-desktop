(function (App) {
    'use strict';

    var srt2vtt = require('srt-to-vtt');

    var self;

    var findSrt = function (input) {
        var files = fs.readdirSync(input);
        for (var f in files) {
            var stats = fs.lstatSync(path.join(input, files[f]));
            if (path.extname(files[f]) === '.srt' && stats.isFile()) {
                return path.join(input, files[f]);
            }
            if (stats.isDirectory()) {
                var found = findSrt(path.join(input, files[f]));
                if (found) {
                    return found;
                }
            }
        }
    };

    var downloadFromUrl = function (data) {
        return new Promise(function (resolve, reject) {
            var vpath = data.path; // video file path
            var vext = path.extname(vpath); // video extension
            var vname = path.basename(vpath).substring(0, path.basename(vpath).lastIndexOf(vext)); // video file name
            var folder = path.dirname(vpath); // cwd
            var furl = data.url; // subtitle url
            var fpath = path.join(folder, vname + '.' + data.lang.substr(0,2)); // subtitle local path, no extension

            request.get(furl).on('response', function (response) {
                var rtype = (response.headers['content-type'] || '').split(';')[0].trim(); // response type
                var cdisp = (response.headers['content-disposition'] || ''); // content disposition
                var fgz,fzip,fsrt;
                var ext;

                if (rtype.match('gz') || cdisp.match('gz')) {
                    // gzipped file
                    ext = '.gz';
                    fgz = true;
                } else if (rtype.match('zip') || cdisp.match('zip')) {
                    // zipped file
                    ext = '.zip';
                    fzip = true;
                } else if (rtype.match('srt') || cdisp.match('srt')) {
                    // srt subtitle
                    ext = '.srt';
                    fsrt = true;
                } else {
                    reject(new Error('Subtitle: response error, file is not gz,zip,srt'));
                }

                var fileStream = fs.createWriteStream(fpath+ext).on('finish', function () {
                    if (fsrt) {
                        resolve(fpath+ext);
                    } else if (fzip) {
                        try {
                            var zip = new AdmZip(fpath),
                                zipEntries = zip.getEntries();
                            zip.extractAllTo( /*target path*/ fpath, /*overwrite*/ true);
                            fs.unlink(fpath+ext, function (err) {});
                            var found = findSrt(fpath);
                            if (found) {
                                fs.renameSync(found, fpath + '.srt');
                                resolve(fpath + '.srt');
                            } else {
                                throw 'no SRT file in the downloaded archive';
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else if (fgz) {
                        require('zlib').unzip(fs.readFileSync(fpath+ext), (error, buffer) => {
                            if (error) {
                                reject(error);
                            } else {
                                var charset = charsetDetect.detect(buffer);
                                var denc = charset.encoding;
                                var subtitle_content = buffer.toString(denc);
                                fs.writeFileSync(fpath+'.srt', subtitle_content, {encoding: denc});
                                resolve(fpath+'.srt');
                            }
                        });
                    }
                });
                this.pipe(fileStream);

            }).on('error', function (error) {
                reject(error);
            });
        });
    };

    var Subtitles = Backbone.Model.extend({
        defaults: {
            id: 'generic',
            name: 'Generic'
        },
        initialize: function () {
            App.vent.on('subtitle:download', this.download);
            App.vent.on('subtitle:convert', this.convert);
            self = this;
        },
        download: function (data) {
            if (data.path && data.url) {
                var fileFolder = path.dirname(data.path);

                try {
                    mkdirp.sync(fileFolder);
                } catch (e) {
                    // Ignore EEXIST
                }

                downloadFromUrl(data).then(function (spath) {
                    App.vent.trigger('subtitle:downloaded', spath);
                }).catch(function (error) {
                    win.error('Subtitle download error:', error);
                    App.vent.trigger('subtitle:downloaded', null);
                });
            } else {
                if (Settings.subtitle_language !== 'none') {
                    win.info('No subtitles downloaded. None picked or language not available');
                    App.vent.trigger('notification:show', new App.Model.Notification({
                        title: i18n.__('No subtitles found'),
                        body: i18n.__('Try again later or drop a subtitle in the player'),
                        showRestart: false,
                        type: 'warning',
                        autoclose: true
                    }));
                }
                App.vent.trigger('subtitle:downloaded', null);
            }
        },
        convert: function (data, cb) { // Converts .srt's to .vtt's
            try {
                const srtPath = data.path;
                const vttPath = srtPath.replace('.srt', '.vtt');
                fs.createReadStream(srtPath)
                    .pipe(srt2vtt())
                    .pipe(fs.createWriteStream(vttPath));
                cb(null, {
                    vtt: vttPath,
                    srt: srtPath,
                    encoding: 'utf8'
                });
            } catch (e) {
                cb(e, null);
            }
        },
        // Handles charset encoding
        decode: function (dataBuff, language, callback) {
            var targetEncodingCharset = 'utf8';

            var charset = charsetDetect.detect(dataBuff);
            var detectedEncoding = charset.encoding;
            // Do we need decoding?
            if (detectedEncoding.toLowerCase().replace('-', '') === targetEncodingCharset) {
                callback(dataBuff.toString('utf8'));
                // We do
            } else {
                var langInfo = App.Localization.langcodes[language] || {};
                if (langInfo.encoding !== undefined && langInfo.encoding.indexOf(detectedEncoding) < 0) {
                    // The detected encoding was unexepected to the language, so we'll use the most common
                    // encoding for that language instead.
                    detectedEncoding = langInfo.encoding[0];
                }
                dataBuff = iconv.encode(iconv.decode(dataBuff, detectedEncoding), targetEncodingCharset);
                callback(dataBuff.toString('utf8'));
            }
        }

    });

    App.Subtitles = {
        Generic: new Subtitles()
    };
})(window.App);
