(function (App) {
    'use strict';

    var client = App.WebTorrent,
        CHANNELS = ['stable', 'beta', 'nightly'],
        FILENAME = 'package.nw.new',
        VERIFY_PUBKEY = Settings.updateKey;

    function forcedBind(func, thisVar) {
        return function () {
            return func.apply(thisVar, arguments);
        };
    }

    function Updater(options) {
        if (!(this instanceof Updater)) {
            return new Updater(options);
        }

        var self = this;

        this.options = _.defaults(options || {}, {
            endpoint: AdvSettings.get('updateEndpoint').url + 'updatemagnet.json' + '?version=' + App.settings.version + '&nwversion=' + process.versions['node-webkit'],
            channel: 'beta'
        });

        this.outputDir = App.settings.os === 'linux' ? process.execPath : process.cwd();
        this.updateData = null;
    }

    Updater.prototype.check = function () {
        var defer = Q.defer();
        var promise = defer.promise;
        var self = this;

        // Don't update if development or update disabled in Settings


        request(this.options.endpoint, {
            json: true
        }, function (err, res, data) {
            if (err || !data) {
                defer.reject(err);
            } else {
                defer.resolve(data);
            }
        });

        return promise.then(function (data) {
            if (!_.contains(Object.keys(data), App.settings.os)) {
                // No update for this OS, FreeBSD or SunOS.
                // Must not be an official binary
                return false;
            }

            var updateData = data[App.settings.os];
            if (App.settings.os === 'linux') {
                updateData = updateData[App.settings.arch];
            }

            // Update has more than just src & modules
            updateData.extended = data.extended || false;

            // Normalize the version number
            if (!updateData.version.match(/-\d+$/)) {
                updateData.version += '-0';
            }
            if (!App.settings.version.match(/-\d+$/)) {
                App.settings.version += '-0';
            }

            if (semver.gt(updateData.version, App.settings.version)) {
                win.log('Updating to version %s', updateData.version);
                self.updateData = updateData;
                return true;
            }
            win.log('Not updating because we are running the latest version');
            return false;
        });
    };

    Updater.prototype.download = function (source, outputDir) {
        var defer = Q.defer();

        client.on('error', function (err) {
          win.log('ERROR: ' + err.message);
            defer.reject(err);
        });

        client.add(source, { path: outputDir }, function (torrent) {
            win.log('Downloading update... Please allow a few minutes');
            torrent.on('error', function (err) {
                win.log('ERROR' + err.message);
                defer.reject(err);
            });
            torrent.on('done', function () {
                win.log('Update downloaded!');
                defer.resolve(path.join(outputDir, torrent.name));
            });
        });

        return defer.promise;
      };

    Updater.prototype.verify = function (source) {
        var defer = Q.defer();
        var self = this;
        win.log('Verifying update authenticity with SDA-SHA1 signature...');

        var hash = crypt.createHash('SHA1'),
            verify = crypt.createVerify('DSS1');

        var readStream = fs.createReadStream(source);
        readStream.pipe(hash);
        readStream.pipe(verify);
        readStream.on('end', function () {
            hash.end();
            if (
                self.updateData.checksum !== hash.read().toString('hex') ||
                verify.verify(VERIFY_PUBKEY, self.updateData.signature, 'base64') === false
            ) {
                defer.reject('invalid hash or signature');
            } else {
                win.log('Update was correctly signed and is safe to install!');
                defer.resolve(source);
            }
        });
        return defer.promise;
    };

    function extractSimple(pack, downloadPath) {
        // Extended: false
        var installDir = path.dirname(downloadPath);
        var defer = Q.defer();

        pack.extractAllToAsync(installDir, true, function (err) {
            if (err) {
                defer.reject(err);
            } else {
                fs.unlink(downloadPath, function (err) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        win.log('Extraction success!');
                        defer.resolve();
                    }
                });
            }
        });

        return defer.promise;
    }

    function installWindows(downloadPath, updateData) {
        var pack = new AdmZip(downloadPath);

        if (!updateData.extended) {
            return extractSimple(pack, downloadPath);
        }

        var defer = Q.defer();


        // Extended: true
        var extractDir = os.tmpdir();
        win.log('Extracting update.exe');
        pack.extractAllToAsync(extractDir, true, function (err) {
            if (err) {
                defer.reject(err);
            } else {
                var startWinUpdate = function () {
                    fs.unlinkSync(downloadPath);
                    var updateEXE = 'update.exe';
                    var cmd = path.join(extractDir, updateEXE);

                    var updateprocess = child.spawn(cmd, [], {
                        detached: true,
                        stdio: ['ignore', 'ignore', 'ignore']
                    });
                    win.close(true);
                };

                var backupDB = function () {
                    var zip = new AdmZip();
                    var databaseFiles = fs.readdirSync(App.settings['databaseLocation']);
                    var fileinput = document.querySelector('input[id=exportdatabase]');

                    $('#exportdatabase').on('change', function () {
                        var path = fileinput.value;
                        try {
                            databaseFiles.forEach(function (entry) {
                                zip.addLocalFile(App.settings['databaseLocation'] + '/' + entry);
                            });
                            fs.writeFile(path + '/database.zip', zip.toBuffer(), function (err) {
                                win.info('Database exported to:', path);
                                document.getElementsByClassName('export-database')[0].innerHTML = i18n.__('Database Exported');
                            });
                        } catch (err) {
                            console.log(err);
                        }
                    });
                };

                App.vent.trigger('notification:show', new App.Model.Notification({
                    title: 'Update ' + (updateData.version || 'Hotfix') + ' Installed',
                    body: (updateData.description + '<p style="font-size:75%;opacity:0.75">* ' + i18n.__('Remember to Export your Database before updating in case its necessary to restore your Favorites, marked as watched or settings') + '</font>' || 'Auto update'),
                    showRestart: false,
                    type: 'info',
                    buttons: [
                        { title: '<label class="export-database" for="exportdatabase">' + i18n.__('Export Database') + '</label>' + '<input type="file" id="exportdatabase" style="display:none" nwdirectory="">', action: backupDB },
                        { title: i18n.__('Update Now'), action: startWinUpdate }
                    ]
                }));
                win.on('close', function () {
                    startWinUpdate();
                });

                win.log('Extraction success!');
                win.log('Update ready to be installed!');
            }
        });

        return defer.promise;
    }

    function installUnix(downloadPath, outputDir, updateData) {
        win.log('Extracting update...');

        var packageFile = path.join(outputDir, 'package.nw'),
            pack = new AdmZip(downloadPath);

        if (!updateData.extended) {
            return extractSimple(pack, downloadPath);
        }

        var defer = Q.defer();

        // Extended: true
        var extractDir = os.tmpdir();
        var updateTAR = path.join(extractDir, 'update.tar');

        pack.extractAllToAsync(extractDir, true, function (err) { //extract tar from zip
            if (err) {
                defer.reject(err);
            } else {
                var delDir = process.cwd().match('Contents') ? path.join(outputDir, 'Contents') : outputDir;
                rimraf(delDir, function (err) { //delete old app
                    if (err) {
                        defer.reject(err);
                    } else {
                        var extractor = tar.extract({
                                cwd: outputDir
                            }) //extract files from tar
                            .on('error', function (err) {
                                defer.reject(err);
                            })
                            .on('end', function () {
                                App.vent.trigger('notification:show', new App.Model.Notification({
                                    title: 'Update ' + (updateData.version || 'Hotfix') + ' Installed',
                                    body: (updateData.description || 'Auto update'),
                                    showRestart: true,
                                    type: 'info'
                                }));

                                win.log('Extraction success!');
                            });
                        fs.createReadStream(updateTAR)
                            .on('error', function (err) {
                                defer.reject(err);
                            })
                            .pipe(extractor);
                    }
                });
            }
        });

        return defer.promise;
    }

    function installLinux(downloadPath, updateData) {
        return installUnix(downloadPath, path.dirname(downloadPath), updateData);
    }

    function installOSX(downloadPath, updateData) {
        var outputDir = updateData.extended ? process.cwd().split('Contents')[0] : path.dirname(downloadPath);

        return installUnix(downloadPath, outputDir, updateData);
    }

    function alertMessageFailed(errorDesc) {
        App.vent.trigger('notification:show', new App.Model.Notification({
            title: i18n.__('Error'),
            body: errorDesc + '.',
            type: 'danger',
            autoclose: true
        }));
    }

    Updater.prototype.install = function (downloadPath) {
        var os = App.settings.os;
        var promise;
        if (os === 'windows') {
            promise = installWindows;
        } else if (os === 'linux') {
            promise = installLinux;
        } else if (os === 'mac') {
            promise = installOSX;
        } else {
            return Q.reject('Unsupported OS');
        }

        return promise(downloadPath, this.updateData);
    };

    Updater.prototype.displayNotification = function () {
        var self = this;

        function onChangelogClick() {
            var $changelog = $('#changelog-container').html(_.template($('#changelog-tpl').html())(self.updateData));
            $changelog.find('.btn-close').on('click', function () {
                $changelog.hide();
            });
            $changelog.show();
        }

        App.vent.trigger('notification:show', new App.Model.Notification({
            title: this.updateData.title + ' Installed',
            body: this.updateData.description,
            showRestart: true,
            type: 'info',
            buttons: [{
                title: 'Changelog',
                action: onChangelogClick
            }]
        }));
    };

    Updater.onlyNotification = async function (e) {
        const initBtn = e === 'about' ? $('.update-app i') : $('.update-app');
        if (e) {
            initBtn.removeClass('fa-rotate valid-tick invalid-cross').addClass('fa-spin fa-spinner');
        }
        const currentVer = parseInt(nw.global.manifest.version ? nw.global.manifest.version.replace(/[^0-9]+/g, '') : App.settings.version.replace(/[^0-9]+/g, '')),
            response = await fetch(Settings.sourceUrl.replace('github.com', 'api.github.com/repos') + 'releases/latest').catch((error) => {}),
            data = response ? await response.json().catch((error) => {}) : null,
            latestVer = data && data.tag_name ? parseInt(data.tag_name.replace(/[^0-9]+/g, '')) : null;
        if (!latestVer) {
            if (e) {
                App.vent.trigger('notification:show', new App.Model.Notification({
                    title: i18n.__('Error'),
                    body: i18n.__('Failed to check for new version'),
                    autoclose: true,
                    showClose: false,
                    type: 'error'
                }));
                initBtn.removeClass('fa-spin fa-spinner').addClass('invalid-cross');
                setTimeout(function() { initBtn.removeClass('invalid-cross').addClass('fa-rotate');}, 6000);
            }
            return;
        }
        if (e) {
            initBtn.removeClass('fa-spin fa-spinner').addClass('valid-tick');
            setTimeout(function() { initBtn.removeClass('valid-tick').addClass('fa-rotate');}, 6000);
        }
        if (latestVer > currentVer) {
            let downloadUpdate = function () {
                App.vent.trigger('notification:close');
                nw.Shell.openExternal(Settings.projectUrl);
                win.close();
            };
            let dontUpdate = function () {
                App.vent.trigger('notification:close');
            };
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('New version available !'),
                body: '<p style="margin:4px 0">' + i18n.__('Exit %s and download now ?', Settings.projectName) + '</p>',
                showClose: false,
                type: 'success',
                buttons: [{ title: '<label class="export-database" for="exportdatabase">&nbsp;' + i18n.__('Yes') + '&nbsp;</label>', action: downloadUpdate }, { title: '<label class="export-database" for="exportdatabase">&nbsp;' + i18n.__('No') + '&nbsp;</label>', action: dontUpdate }]
            }));
        } else if (e) {
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('Success'),
                body: i18n.__('Already using the latest version'),
                autoclose: true,
                showClose: false,
                type: 'success'
            }));
        }
    };

    Updater.prototype.update = function () {
        var outputFile = path.join(path.dirname(this.outputDir), FILENAME);

        if (this.updateData) {
            // If we have already checked for updates...
            return this.download(this.updateData.updateUrl, outputFile)
                .then(forcedBind(this.verify, this))
                .then(forcedBind(this.install, this))
                .then(forcedBind(this.displayNotification, this))
                .catch(function(err) {
                  alertMessageFailed(i18n.__('Something went wrong downloading the update'));
                });
        } else {
            // Otherwise, check for updates then install if needed!
            var self = this;
            return this.check().then(function (updateAvailable) {
                if (updateAvailable) {
                    return self.download(self.updateData.updateUrl, outputFile)
                        .then(forcedBind(self.verify, self))
                        .then(forcedBind(self.install, self))
                        .then(forcedBind(self.displayNotification, self))
                        .catch(function(err) {
                          alertMessageFailed(i18n.__('Something went wrong downloading the update'));
                        });
                } else {
                    return false;
                }
            });
        }
    };

    App.Updater = Updater;

})(window.App);
