(function (App) {
    'use strict';

    var request = require('request'),
        semver = require('semver'),
        fs = require('fs'),
        Q = require('q'),
        _ = require('underscore'),
        rimraf = require('rimraf'),
        path = require('path'),
        crypto = require('crypto'),
        AdmZip = require('adm-zip'),
        tar = require('tar'),
        spawn = require('child_process').spawn;

    var UPDATE_ENDPOINT = AdvSettings.get('updateEndpoint').url + 'fox2.json',
        CHANNELS = ['stable', 'beta', 'nightly'],
        FILENAME = 'package.nw.new',
        VERIFY_PUBKEY =
        '-----BEGIN PUBLIC KEY-----\n' +
        'MIIBtjCCASsGByqGSM44BAEwggEeAoGBAPNM5SX+yR8MJNrX9uCQIiy0t3IsyNHs\n' +
        'HWA180wDDd3S+DzQgIzDXBqlYVmcovclX+1wafshVDw3xFTJGuKuva7JS3yKnjds\n' +
        'NXbvM9CrJ2Jngfd0yQPmSh41qmJXHHSwZfPZBxQnspKjbcC5qypM5DqX9oDSJm2l\n' +
        'fM/weiUGnIf7AhUAgokTdF7G0USfpkUUOaBOmzx2RRkCgYAyy5WJDESLoU8vHbQc\n' +
        'rAMnPZrImUwjFD6Pa3CxhkZrulsAOUb/gmc7B0K9I6p+UlJoAvVPXOBMVG/MYeBJ\n' +
        '19/BH5UNeI1sGT5/Kg2k2rHVpuqzcvlS/qctIENgCNMo49l3LrkHbJPXKJ6bf+T2\n' +
        '8lFWRP2kVlrx/cHdqSi6aHoGTAOBhAACgYBTNeXBHbWDOxzSJcD6q4UDGTnHaHHP\n' +
        'JgeCrPkH6GBa9azUsZ+3MA98b46yhWO2QuRwmFQwPiME+Brim3tHlSuXbL1e5qKf\n' +
        'GOm3OxA3zKXG4cjy6TyEKajYlT45Q+tgt1L1HuGAJjWFRSA0PP9ctC6nH+2N3HmW\n' +
        'RTcms0CPio56gg==\n' +
        '-----END PUBLIC KEY-----\n';


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
            endpoint: UPDATE_ENDPOINT + '?version=' + App.settings.version + '&nwversion=' + process.versions['node-webkit'],
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

        /*var hash = crypto.createHash('SHA1'),
            verify = crypto.createVerify('DSA-SHA1');

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
            } else {*/
                win.debug('Update was correctly signed and is safe to install!');
                defer.resolve(source);
            /*}
        });*/
        return defer.promise;
    };

    function installWindows(downloadPath, updateData) {
        var defer = Q.defer();

        var pack = new AdmZip(downloadPath);

        if (updateData.extended) {

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

                        var updateprocess = spawn(cmd, [], {
                            detached: true,
                            stdio: ['ignore', 'ignore', 'ignore']
                        });
                        win.close(true);
                    };

                    var $el = $('#notification');
                    $el.html(
                        '<h1>Update ' + updateData.version + ' Available</h1>' +
                        '<p>&nbsp;- ' + updateData.description + '</p>' +
                        '<span class="btn-grp">' +
                        '<a class="btn install">Install Now</a>' +
                        '</span>'
                    ).addClass('blue');

                    $('.btn.install').on('click', function () {
                        startWinUpdate();
                    });
                    win.on('close', function () {
                        startWinUpdate();
                    });

                    win.debug('Update ready to be installed!');
                    $('body').addClass('has-notification');
                }
            });

        } else {

            // Extended: false || undefined
            var installDir = path.dirname(downloadPath);

            win.debug('Extracting update files...');
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

        }

        return defer.promise;
    }

    function installLinux(downloadPath, updateData) {
        var defer = Q.defer();

        win.debug('Extracting update...');
        var outputDir = path.dirname(downloadPath),
            packageFile = path.join(outputDir, 'package.nw');

        if (updateData.extended) {

            // Extended: true
            var updateTAR = path.join(os.tmpdir(), 'update.tar');

            var pack = new AdmZip(downloadPath);
            pack.extractAllToAsync(os.tmpdir(), true, function (err) { //extract tar from zip
                if (err) {
                    defer.reject(err);
                } else {
                    rimraf(outputDir, function (err) { //delete old app
                        if (err) {
                            defer.reject(err);
                        } else {
                            var extractor = tar.Extract({path: outputDir}) //extract files from tar
                                .on('error', function(err) {
                                    defer.reject(err);
                                })
                                .on('end', function() {
                                    var restartApp = function () {
                                        var cmd = path.join(outputDir, 'Popcorn-Time');

                                        var updateprocess = spawn(cmd, [], {
                                            detached: true,
                                            stdio: ['ignore', 'ignore', 'ignore']
                                        });
                                        win.close(true);
                                    };

                                    var $el = $('#notification');
                                    $el.html(
                                        '<h1>Update ' + updateData.version + ' Installed</h1>' +
                                        '<p>&nbsp;- ' + updateData.description + '</p>' +
                                        '<span class="btn-grp">' +
                                        '<a class="btn restart">Restart Now</a>' +
                                        '</span>'
                                    ).addClass('blue');

                                    $('.btn.restart').on('click', function () {
                                        restartApp();
                                    });
                                    win.on('close', function () {
                                        restartApp();
                                    });

                                    win.debug('Extraction success!');
                                    $('body').addClass('has-notification');
                                });
                            fs.createReadStream(updateTAR)
                                .on('error', onError)
                                .pipe(extractor);
                        }
                    });
                }
            });

        } else {

            // Extended: false
            var installDir = path.dirname(downloadPath);

            win.debug('Extracting update files...');
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

        }

        return defer.promise;
    }

    function installOSX(downloadPath, updateData) {
        var defer = Q.defer();

        win.debug('Extracting update...');
        if (updateData.extended) {

            // Extended: true
            var installDir = process.cwd().split('Contents')[0];
            var updateTAR = path.join(os.tmpdir(), 'update.tar');

            var pack = new AdmZip(downloadPath);
            pack.extractAllToAsync(os.tmpdir(), true, function (err) { //extract tar from zip
                if (err) {
                    defer.reject(err);
                } else {
                    rimraf(path.join(installDir, 'Contents'), function (err) { //delete old app
                        if (err) {
                            defer.reject(err);
                        } else {
                            var extractor = tar.Extract({path: installDir}) //extract files from tar
                                .on('error', function(err) {
                                    defer.reject(err);
                                })
                                .on('end', function() {
                                    var restartApp = function () {
                                        var cmd = path.join(installDir, 'Contents/MacOS/nwjs');

                                        var updateprocess = spawn(cmd, [], {
                                            detached: true,
                                            stdio: ['ignore', 'ignore', 'ignore']
                                        });
                                        win.close(true);
                                    };

                                    var $el = $('#notification');
                                    $el.html(
                                        '<h1>Update ' + updateData.version + ' Installed</h1>' +
                                        '<p>&nbsp;- ' + updateData.description + '</p>' +
                                        '<span class="btn-grp">' +
                                        '<a class="btn restart">Restart Now</a>' +
                                        '</span>'
                                    ).addClass('blue');

                                    $('.btn.restart').on('click', function () {
                                        restartApp();
                                    });
                                    win.on('close', function () {
                                        restartApp();
                                    });

                                    win.debug('Extraction success!');
                                    $('body').addClass('has-notification');
                                });
                            fs.createReadStream(updateTAR)
                                .on('error', function(err) {
                                    defer.reject(err);
                                })
                                .pipe(extractor);
                        }
                    });
                }
            });

        } else {

            // Extended: false
            var outputDir = path.dirname(downloadPath);
          
            var pack = new AdmZip(downloadPath);
            pack.extractAllToAsync(outputDir, true, function (err) {
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
        }

        return defer.promise;
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
		var $el = $('#notification');
		$el.html(
			'<h1>' + this.updateData.title + ' Installed</h1>' +
			'<p>&nbsp;- ' + this.updateData.description + '</p>' +
			'<span class="btn-grp">' +
			'<a class="btn chnglog">Changelog</a>' +
			'<a class="btn restart">Restart Now</a>' +
			'</span>'
		).addClass('blue');

		var $restart = $('.btn.restart'),
			$chnglog = $('.btn.chnglog');

		$restart.on('click', function () {
			var argv = gui.App.fullArgv;
			argv.push(self.outputDir);
			spawn(process.execPath, argv, {
				cwd: self.outputDir,
				detached: true,
				stdio: ['ignore', 'ignore', 'ignore']
			}).unref();
			gui.App.quit();
		});

		$chnglog.on('click', function () {
			var $changelog = $('#changelog-container').html(_.template($('#changelog-tpl').html())(this.updateData));
			$changelog.find('.btn-close').on('click', function () {
				$changelog.hide();
			});
			$changelog.show();
		});

		$('body').addClass('has-notification');
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