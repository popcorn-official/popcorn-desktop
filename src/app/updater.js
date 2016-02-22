(function (App) {
    'use strict';

    var CHANNELS = ['stable', 'beta', 'nightly'],
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
            endpoint: AdvSettings.get('updateEndpoint').url + 'update3.json' + '?version=' + App.settings.version + '&nwversion=' + process.versions['node-webkit'],
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
        if (_.contains(fs.readdirSync('.'), '.git') || !App.settings.automaticUpdating) {
            win.debug(App.settings.automaticUpdating ? 'Not updating because we are running in a development environment' : 'Automatic updating disabled');
            defer.resolve(false);
            return defer.promise;
        }

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
                win.debug('Updating to version %s', updateData.version);
                self.updateData = updateData;
                return true;
            }

            win.debug('Not updating because we are running the latest version');
            return false;
        });
    };

    Updater.prototype.download = function (source, output) {
        var defer = Q.defer();
        var downloadStream = request(source);
        win.debug('Downloading update... Please allow a few minutes');
        downloadStream.pipe(fs.createWriteStream(output));
        downloadStream.on('complete', function () {
            win.debug('Update downloaded!');
            defer.resolve(output);
        });
        return defer.promise;
    };

    Updater.prototype.verify = function (source) {
        var defer = Q.defer();
        var self = this;
        win.debug('Verifying update authenticity with SDA-SHA1 signature...');

        var hash = crypt.createHash('SHA1'),
            verify = crypt.createVerify('DSA-SHA1');

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
                win.debug('Update was correctly signed and is safe to install!');
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
                        win.debug('Extraction success!');
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
        win.debug('Extracting update.exe');
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

                App.vent.trigger('notification:show', new App.Model.Notification({
                    title: 'Update ' + (updateData.version || 'Hotfix') + ' Installed',
                    body: (updateData.description || 'Auto update'),
                    showRestart: false,
                    type: 'info',
                    buttons: [{
                        title: 'Update Now',
                        action: startWinUpdate
                    }]
                }));
                win.on('close', function () {
                    startWinUpdate();
                });

                win.debug('Extraction success!');
                win.debug('Update ready to be installed!');
            }
        });

        return defer.promise;
    }

    function installUnix(downloadPath, outputDir, updateData) {
        win.debug('Extracting update...');

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
                        var extractor = tar.Extract({
                                path: outputDir
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

                                win.debug('Extraction success!');
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

    Updater.prototype.update = function () {
        var outputFile = path.join(path.dirname(this.outputDir), FILENAME);

        if (this.updateData) {
            // If we have already checked for updates...
            return this.download(this.updateData.updateUrl, outputFile)
                .then(forcedBind(this.verify, this))
                .then(forcedBind(this.install, this))
                .then(forcedBind(this.displayNotification, this));
        } else {
            // Otherwise, check for updates then install if needed!
            var self = this;
            return this.check().then(function (updateAvailable) {
                if (updateAvailable) {
                    return self.download(self.updateData.updateUrl, outputFile)
                        .then(forcedBind(self.verify, self))
                        .then(forcedBind(self.install, self))
                        .then(forcedBind(self.displayNotification, self));
                } else {
                    return false;
                }
            });
        }
    };

    App.Updater = Updater;

})(window.App);
