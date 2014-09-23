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
