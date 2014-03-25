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


    console.debug('Testing if we should install update...', testInstalled());
    if(testInstalled()) {
        var request = require('request')
          , fs = require('fs')
          , rm = require('rimraf')
          , path = require('path')
          , crypto = require('crypto')
          , zip = require('adm-zip');

        var updateUrl = Settings.get('updateNotificationUrl');

        /* HARDCODED DSA PUBLIC KEY... DO NOT MODIFY, CHANGE, OR OTHERWISE MESS WITH THIS
         * IF I SEE A PULL REQUEST CHANGING THIS LINE, I WILL, REPEAT.. I WILL COME AFTER YOU
         * AND KILL YOU! You have been warned -jduncanator
         * On a side note, this is here as its easier for an attacker to modify localStorage 
         * than source code!                                                                */
        var VERIFY_PUBKEY = '-----BEGIN PUBLIC KEY-----\nMIIDRjCCAjkGByqGSM44BAEwggIsAoIBAQDRuynMmlY768GtsgneDjCPjWVoIjQq\ng0QBIG/V9oO8TITGC0I/9+9jl603mxHf5N3/0u+AzQWjphbaxZEIQHM5/BJtBilt\n1SK4BJf+aEscUr34fOFK6yPpYRGYoOAvIHn93dFSaznA58L3CizQfQsrQHpE+bLQ\n7Yj0ZFJdilo4cYZ9keaU39I3su3szDh7nQGw7ma1AIgHPej8EY28Eem+Mi4FBncR\n8M6jsX2Nz1LVruuyGBGvvQXY1jf2LoPE53Xp5RdCw6iNinqBWO8EyF9o4/NHR5uq\nW/rZ528MyEIVzDFYCaVB6HLpXbm3d58EaTZ+TL4/jrvnL0NH3HRQLaiPAiEAzVB6\nCrTHmH7ejvwJkOLLKNtIjsXoBZNO9l/6zX9K0LsCggEAFGpQ24CBaSOCUc6w63y6\nClbPKjzvG8PjpB8erFXy1Yftef5vy3ES2k2A9FR5+kzZAq3mRX8Gbel4fvXkKga5\nSfECtRU9atnRpK2Tm7pMk4FVBGSbmJEG9SPYfDhx3FCLM8EGiID/8wKesWgtHTTc\n8KvDFvowupljI278e5P5DjTICdK9pWJlkqtepBbLFnrMipNPHrStQkIqRNx05DxA\nf2d99GZlDOxVxdJ6an+xCUhhx06+icOb5fQVP2zwYAMGqHdyhSvrrHNDpB862oF2\nkfXmhDx/4n/WTe0HwmuaPNpNZ7NccsT/zMJlxDLBCAXYkZ/R++U4yYju/rEp7D0n\ncAOCAQUAAoIBABID86dLyxUrf25Na+AtpfbTHG04O9VeKklPtKaLC4cf6CqFfHmd\nh/UPrvoMihDy0GgFCMyDb9EMO+eZZg1n3qoqa+oKkZqlf8dTXgXJE3sDMj3gkfFB\nXW2UaP9rNJvPrklHGUCy4yngeDtn1hRsK4jiLjgxCcK0b3UFNEu88/qvEWAF8Puy\n6qXhtNCjXWHpEDwdO9ZKYl9gStMc4cZDLKGaULY16sGVtrs0LWxoNuuf8FC4n87z\nyvDZMfROTVSL/xACx5EBROpDFHtFeh6oM7subxbIo9ZXutNxE9LT77g4W2t1AC7k\n+hSb+Q3Nq+tl2vHS6UEXzW0Kmsd2ulV6xP4=\n-----END PUBLIC KEY-----\n';

        var checkVersion = function(ver1, ver2) {
            // returns `-` when ver2 less than
            // returns `0` when ver2 equal
            // returns `+` when ver2 greater than
            ver1 = _.map(ver1.replace(/^[0-9]/g, '').split('.'), function(num) { var num = parseInt(num); return Number.isNaN(num) ? 0 : num; });
            ver2 = _.map(ver2.replace(/^[0-9]/g, '').split('.'), function(num) { var num = parseInt(num); return Number.isNaN(num) ? 0 : num; });

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
            if(!_.contains(Object.keys(data), Settings.get('os'))) {
                // No update for this OS, FreeBSD or SunOS.
                // Must not be an official binary
                return;
            }

            var updateData = data[Settings.get('os')];

            if(Settings.get('os') == 'linux')
                updateData = updateData[Settings.get('arch')];

            // Should use SemVer here in v0.2.9 (refactor)
            // As per checkVersion, -1 == lt; 0 == eq; 1 == gt
            if(checkVersion(updateData.version, Settings.get('version')) > 0) {
                var outDir = Settings.get('os') == 'linux' ? process.execPath : process.cwd();
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
                            if(updateData.checksum !== checksum || verify.verify(VERIFY_PUBKEY, updateData.signature, 'base64') === false) {
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
            fs.rename(path.join(path.dirname(outDir), 'package.nw'), path.join(path.dirname(outDir), 'package.nw.old'), function(err) {
                if(err) return;

                fs.rename(dlPath, path.join(path.dirname(outDir), 'package.nw'), function(err) {
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
                        fs.unlink(path.join(path.dirname(outDir), 'package.nw.old'), function(err) {
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

            $('body').addClass('has-notification')
        }
    }
})();