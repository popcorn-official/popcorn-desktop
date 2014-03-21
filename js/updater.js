(function() {
    var request = require('request')
      , fs = require('fs')
      , path = require('path')
      , crypto = require('crypto');

    var updateUrl = App.Settings.get('updateNotificationUrl');

    /* HARDCODED DSA PUBLIC KEY... DO NOT MODIFY, CHANGE, OR OTHERWISE MESS WITH THIS
     * IF I SEE A PULL REQUEST CHANGING THIS LINE, I WILL, REPEAT.. I WILL COME AFTER YOU
     * AND KILL YOU! You have been warned -jduncanator
     * On a side note, this is here as its easier for an attacker to modify localStorage 
     * than source code!                                                                */
    var VERIFY_PUBKEY = '-----BEGIN PUBLIC KEY-----\nMIHwMIGoBgcqhkjOOAQBMIGcAkEAxeL8WU2u6pTtblhnCmC+q8hUPmeU9UIpjSJ822/rth/kKOkeD/x08ELaVV9rDZfMsrJSimDAPjH98qOjCueIywIVAPdw1O+XVSc3tSewQ5dd4ZJj2oWZAkBbW7zPyfsz1bcUEWpf1NEfa031DiT0WXJfB3wQBjv4/l+LPm1AwImDKMFF+T2fRw5R1IadNcOfixxk50JkM3zaA0MAAkABaDW312KrdbU7+sbewd1F4FsmtrMVBriU6FJ378WErsDU48opgacBekTTsEYVVUK32skOQDK9SjSqq2DnBFCP\n-----END PUBLIC KEY-----';


    var checkVersion = function(ver1, ver2) {
        // returns `-` when ver2 less than
        // returns `0` when ver2 equal
        // returns `+` when ver2 greater than
        ver1 = u.map(ver1.replace(/^[0-9]/g, '').split('.'), function(num) { var num = parseInt(num); return Number.isNaN(num) ? 0 : num; });
        ver2 = u.map(ver2.replace(/^[0-9]/g, '').split('.'), function(num) { var num = parseInt(num); return Number.isNaN(num) ? 0 : num; });

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
            var outputFile = path.join(path.dirname(process.execPath), 'nw.pak.new');
            var downloadRequest = request(updateData.updateUrl).pipe(fs.createWriteStream(outputFile));
            downloadRequest.on('complete', function() {
                var hash = crypto.createHash('sha1'),
                    verify = crypto.createVerify('DSA');
                fs.createReadStream(outputFile)
                    .on('data', function(chunk) {
                        hash.update(chunk);
                    })
                    .on('end', function() {
                        var checksum = hash.digest('hex');
                        verify.update(checksum);
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
                            fs.rename(outputFile, path.join(path.dirname(process.execPath), 'nw.pak'), function(err) {
                                if(err) {
                                    // Sheeet! We got a booboo :'(
                                    // Quick! Lets erase it before anyone realizes!
                                    if(fs.existsSync(outputFile)) {
                                        fs.unlink(outputFile, function(err) {
                                            if(err) throw err;
                                        })
                                    }
                                    throw err;
                                }
                            })
                        }
                    });
            });
        }
    })
})();