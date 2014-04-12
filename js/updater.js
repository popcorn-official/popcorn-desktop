(function() {
    function testInstalled() {
        return (!_.contains(require('fs').readdirSync('.'), '.git') || // Test Development
                (   // Test Windows
                    Settings.get('os') == 'windows' &&
                    process.cwd().indexOf(process.env.APPDATA) != -1
                ) ||
                (   // Test Linux
                    Settings.get('os') == 'linux' &&
                    _.contains(require('fs').readdirSync('.'), 'package.nw')
                ) ||
                (   // Test Mac OS X
                    Settings.get('os') == 'mac' &&
                    process.cwd().indexOf('Resources/app.nw') != -1
                ));
    }


    console.debug('Testing if we should check for update...', testInstalled());
    if(testInstalled()) {
        var request = require('request')
          , fs = require('fs')
          , rm = require('rimraf')
          , path = require('path')
          , crypto = require('crypto')
          , zip = require('adm-zip');

        var updateUrl = Settings.get('updateNotificationUrl');

        var CWD = process.cwd();

        /* HARDCODED DSA PUBLIC KEY... DO NOT MODIFY, CHANGE, OR OTHERWISE MESS WITH THIS
         * IF I SEE A PULL REQUEST CHANGING THIS LINE, I WILL, REPEAT.. I WILL COME AFTER YOU
         * AND KILL YOU! You have been warned -jduncanator
         * On a side note, this is here as its easier for an attacker to modify localStorage
         * than source code!                                                                */
        var VERIFY_PUBKEY =
            '-----BEGIN PUBLIC KEY-----\n' +
            'AAAAB3NzaC1kc3MAAACBAPJ04ITBTO4WLtGxWb2VTZTbRY297MsAg3+dvOjCp+LuNbncZJbv\n' +
            '2aq+XADYkrsOgUcXxNte93POth0FtosySTSA683dNmOmy2GlglVgYMJyR8ZuEPti1CKzfLWN8hl318zl\n' +
            'IrGggHKk2fkBm6SOQj9vGAzk0VoAcVXG2dCrD5Z1AAAAFQDOczyBZVTpvXtxNpnzFDIbTCZt4QAAAIEA\n' +
            '0fAceqI+DjQ5LB156v4SVU4laCL8kt02uHh4rx8AwsVD41Rp1HCeljR8Kj+u4oPRWKPiilE+CvBDal/z\n' +
            'vZ/mZZYrA7eX715EO80Uw2+6EPoMsvvzg//oHccnI3dWNjhbMZxDtKJTWsOUzd5faX88RobVdtKFjZDo\n' +
            '0RYqqpDG5LEAAACBALMhusYLoEI4KxufL9aohoaKrzgsk16v0frr3PLr599Cb/G4PFM0NX0tJgQTKKSm\n' +
            'AOESHmu+lTeI8JtyZBOnYQQQ+KPY5pXdZ+lu9hlmmcXkSeYXV1FO6vnAbmw49rZ+8+R7zbwSLh7IjqDi\n' +
            'dsRb3iakUGgo0l3VMCpMpB49MLRv\n'+
            '-----END PUBLIC KEY-----\n';

        var checkVersion = function(ver1, ver2) {
            // returns `-` when ver2 less than
            // returns `0` when ver2 equal
            // returns `+` when ver2 greater than
            ver1 = _.map(ver1.replace(/[^0-9.]/g, '').split('.'), function(num) { var num = parseInt(num); return Number.isNaN(num) ? 0 : num; });
            ver2 = _.map(ver2.replace(/[^0-9.]/g, '').split('.'), function(num) { var num = parseInt(num); return Number.isNaN(num) ? 0 : num; });

            var count = Math.max(ver1.length, ver2.length);

            for(var i = 0; i < count; i++) {
                if(ver1[i] === undefined)
                    ver1[i] = 0;
                if(ver2[i] === undefined)
                    ver2[i] = 0;

                if(i == count - 1) {
                    if(ver1[i] === ver2[i])
                        return 0;
                    if(ver1[i] > ver2[i])
                        return 1;
                    return -1;
                }

                if(ver1[i] === ver2[i])
                    continue;
                if(ver1[i] > ver2[i])
                    return 1;
                return -1;
            }
        }

        request(updateUrl, {json: true}, function(err, res, data) {
            if(err || !data) return; // Its just an updater, we don't care :P

            if(!_.contains(Object.keys(data), Settings.get('os'))) {
                // No update for this OS, FreeBSD or SunOS.
                // Must not be an official binary
                return;
            }

            var updateData = data[Settings.get('os')];

            if(Settings.get('os') == 'linux')
                updateData = updateData[Settings.get('arch')];

            console.debug('Testing if we should install update...', checkVersion(updateData.version, Settings.get('version')) > 0);

            // Should use SemVer here in v0.2.9 (refactor)
            // As per checkVersion, -1 == lt; 0 == eq; 1 == gt
            if(checkVersion(updateData.version, Settings.get('version')) > 0) {
                var outDir = Settings.get('os') == 'linux' ? process.execPath : CWD;
                var outputFile = path.join(path.dirname(outDir), 'package.nw.new');
                var downloadRequest = request(updateData.updateUrl);
                downloadRequest.pipe(fs.createWriteStream(outputFile));
                downloadRequest.on('complete', function() {
                    var hash = crypto.createHash('SHA1'),
                        verify = crypto.createVerify('DSA-SHA1');
                    fs.createReadStream(outputFile)
                        .on('data', function(chunk) {
                            hash.update(chunk);
                            verify.update(chunk);
                        })
                        .on('end', function() {
                            var checksum = hash.digest('hex');
                            //if(updateData.checksum !== checksum || verify.verify(VERIFY_PUBKEY, updateData.signature, 'base64') === false) {
                            if(updateData.checksum !== checksum) {
                                // Corrupt download or tampered update
                                // Wait until next start to attempt the update again
                                if(fs.existsSync(outputFile)) {
                                    fs.unlink(outputFile, function(err) {
                                        if(err) throw err;
                                    })
                                }
                            } else {
                                // Valid update data! Overwrite the old data and move on with life!
                                var os = Settings.get('os');
                                if(os == 'mac')
                                    installMac(outputFile, updateData);
                                else if(os == 'linux')
                                    installLin(outputFile, updateData);
                                else if(os == 'windows')
                                    installWin(outputFile, updateData);
                                else
                                    return;
                            }
                        });
                });
            }
        })

        // Under Windows, we install to %APPDATA% and the app
        // is in a folder called 'app'.
        function installWin(dlPath, updateData) {
            var outDir = path.dirname(dlPath),
                installDir = path.join(outDir, 'app');

            var pack = new zip(dlPath);
            try {
                pack.extractAllTo(installDir, true);
                fs.unlink(dlPath, function(err) {
                    if(err) throw err;
                    installationComplete(updateData);
                })
            } catch(ex) {
                // It's cool, worst comes to worst, we have a 17mb
                // .nw file lying around :P
            }
        }

        // Under Linux, we package the app alongside the binary
        // in a file called 'package.nw'.
        function installLin(dlPath, updateData) {
            var outDir = path.dirname(dlPath);
            fs.rename(path.join(outDir, 'package.nw'), path.join(outDir, 'package.nw.old'), function(err) {
                if(err) throw err;

                fs.rename(dlPath, path.join(outDir, 'package.nw'), function(err) {
                    if(err) {
                        // Sheeet! We got a booboo :'(
                        // Quick! Lets erase it before anyone realizes!
                        if(fs.existsSync(dlPath)) {
                            fs.unlink(dlPath, function(err) {
                                if(err) throw err;
                            })
                        }
                        throw err;
                    } else {
                        fs.unlink(path.join(outDir, 'package.nw.old'), function(err) {
                            if(err) throw err;
                            installationComplete(updateData);
                        })
                    }
                })
            })
        }

        // Under Mac, we install the app into a folder called
        // 'app.nw' under the 'Resources' directory of the .app
        function installMac(dlPath, updateData) {
            var outDir = path.dirname(dlPath),
                installDir = path.join(outDir, 'app.nw');
            rm(installDir, function(err) {
                if(err) throw err;

                var pack = new zip(dlPath);
                try {
                    pack.extractAllTo(installDir, true);
                    fs.unlink(dlPath, function(err) {
                        if(err) throw err;
                        installationComplete(updateData);
                    })
                } catch(ex) {
                    // Dunno what to do here :( We deleted the app files,
                    // and now we can't extract it... sheet!
                }
            })
        }

        function installationComplete(updateData) {
            var $el = $('#notification');
            $el.html(
                '<h1>' + updateData.title + ' Installed</h1>'   +
                '<p>&nbsp;- ' + updateData.description + '</p>' +
                '<span class="btn-grp">'                        +
                    '<a class="btn chnglog">Changelog</a>'      +
                    '<a class="btn restart">Restart Now</a>'    +
                '</span>'
            ).addClass('blue');

            var $restart = $('.btn.restart'),
                $chnglog = $('.btn.chnglog');

            $restart.on('click', function() {
                var spawn = require('child_process').spawn,
                    argv = gui.App.fullArgv;
                argv.push(CWD);
                spawn(process.execPath, argv, { cwd: CWD, detached: true, stdio: [ 'ignore', 'ignore', 'ignore' ] }).unref();
                gui.App.quit();
            })

            $chnglog.on('click', function() {
                var $changelog = $('#changelog-container').html(_.template($('#changelog-tpl').html())(updateData));
                $changelog.find('.btn-close').on('click', function() {
                    $changelog.hide();
                });
                $changelog.show();
            })

            $('body').addClass('has-notification')
        }
    }
})();