var Common = {};
var crypt = require('crypto');
var fs = require('fs');
Common.healthMap = {
    0: 'bad',
    1: 'medium',
    2: 'good',
    3: 'excellent'
};

Common.calcHealth = function (torrent) {
    var seeds = torrent.seed;
    var peers = torrent.peer;

    // First calculate the seed/peer ratio
    var ratio = peers > 0 ? (seeds / peers) : seeds;

    // Normalize the data. Convert each to a percentage
    // Ratio: Anything above a ratio of 5 is good
    var normalizedRatio = Math.min(ratio / 5 * 100, 100);
    // Seeds: Anything above 30 seeds is good
    var normalizedSeeds = Math.min(seeds / 30 * 100, 100);

    // Weight the above metrics differently
    // Ratio is weighted 60% whilst seeders is 40%
    var weightedRatio = normalizedRatio * 0.6;
    var weightedSeeds = normalizedSeeds * 0.4;
    var weightedTotal = weightedRatio + weightedSeeds;

    // Scale from [0, 100] to [0, 3]. Drops the decimal places
    var scaledTotal = ((weightedTotal * 3) / 100) | 0;

    return scaledTotal;
};

Common.md5 = function (arg) {
    return crypt.createHash('md5').update(arg).digest('hex');
};

Common.copyFile = function (source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);

    function done(err) {
        if (!cbCalled) {
            if (err) {
                fs.unlink(target);
            }
            cb(err);
            cbCalled = true;
        }
    }

    rd.on('error', done);

    var wr = fs.createWriteStream(target);
    wr.on('error', done);
    wr.on('close', function (ex) {
        done();
    });

    rd.pipe(wr);
};

Common.fileSize = function (num) {
    if (isNaN(num)) {
        return;
    }

    num = parseInt(num);

    var exponent, unit, units, base;
    var neg = num < 0;

    switch (os.platform()) {
    case 'linux':
        base = 1024;
        units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        break;
    case 'win32':
        base = 1024;
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        break;
    case 'darwin':
        /* falls through */
    default:
        base = 1000;
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    }

    if (neg) {
        num = -num;
    }

    if (num < 1) {
        unit = units[0];
        if (Settings.language === 'fr') {
            unit = unit.replace('B', 'o');
        }
        return (neg ? '-' : '') + num + ' ' + unit;
    }

    exponent = Math.min(Math.floor(Math.log(num) / Math.log(base)), units.length - 1);
    num = (num / Math.pow(base, exponent)).toFixed(2) * 1;
    unit = units[exponent];

    var matcher = Settings.language.match(/sq|es|hy|az|be|qu|pt|bs|ca|bg|hr|cs|da|et|fo|fi|fr|de|ka|el|hu|is|id|it|kk|lv|lt|mn|nl|nn|nb|no|pl|ro|ru|sr|sk|sl|sv|tr|uk|uz|vi/);
    if (matcher !== null) {
        num = num.toString().replace('.', ',');
    }
    if (Settings.language === 'fr') {
        unit = unit.replace('B', 'o');
    }
    return (neg ? '-' : '') + num + ' ' + unit;
};
