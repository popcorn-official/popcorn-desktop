var Common = {},
	torrentHealth = require('webtorrent-health');
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

Common.calcRatio = function (seeds, peers) {
	if (isNaN(seeds) || isNaN(peers)) {
		return NaN;
	}

	if (peers > 0) {
		return seeds / peers;
	}

	return +seeds;
};

Common.retrieveTorrentHealth = function (torrent, cb) {
	const torrentURL = typeof torrent === 'string'
		? torrent
		: torrent.magnet || torrent.url || torrent.magnetURI;

	if (!torrentURL) {
		cb(new Error('Torrent URL could not be obtained'), null);
	}

	// check for 'magnet:?' because api sometimes sends back links, not magnets
	if (!torrentURL.startsWith('magnet:?')) {
		return cb(new Error('Torrent is not a magnet URL'), null);
	}

	torrentHealth(
		torrentURL,
		{
			timeout: 2500,
			trackers: Settings.trackers.forced
		},
		cb
	);
};

Common.HealthButton = function (selector, retrieveHealthCallback) {
	if (!(this instanceof Common.HealthButton)) {
		throw new TypeError('This class must be constructed with "new"');
	}

	const maxChecksWhenNoSeeds = 3;
	let zeroSeedCheckCount = 0;
	let pendingRender = null;

	const getIcon = () => {
		return $(selector);
	};

	this.reset = () => {
		getIcon()
			.tooltip({
				html: true
			})
			.removeClass('Bad Medium Good Excellent')
			.addClass('None')
			.attr('data-original-title', i18n.__('Health Unknown'))
			.tooltip('fixTitle');
	};

	this.cancelPendingRenders = () => {
		if (pendingRender) {
			pendingRender.isCancelled = true;
		}
	};

	this.render = () => {
		// because this is an object, we can keep a ref to it while
		// allowing other callers to modify it outside of the current
		// scope. this lets us know if anyone outside wants this
		// request to be cancelled
		const cancellationLock = {isCancelled: false};
		this.cancelPendingRenders();
		pendingRender = cancellationLock;

		retrieveHealthCallback((err, res) => {
			if (err || cancellationLock.isCancelled) {
				return;
			}

			const seeds = Math.max.apply(Math, res.extra.map(function(o) { return o.seeds || 0; }));
			const peers = Math.max.apply(Math, res.extra.map(function(o) { return o.peers || 0; }));

			if (seeds === 0 && zeroSeedCheckCount < maxChecksWhenNoSeeds) {
				zeroSeedCheckCount++;
				getIcon().click();
			} else {
				zeroSeedCheckCount = 0;
				const healthValue = Common.calcHealth({seed: seeds, peer: peers});
				const healthString = Common.healthMap[healthValue].capitalize();
				const ratio = res.ratio || Common.calcRatio(seeds, peers);

				const tooltipPieces = [
					i18n.__(`Health ${healthString}`)
				];

				if (!isNaN(ratio)) {
					tooltipPieces.push(` &nbsp;-&nbsp; ${i18n.__('Ratio:')} ${ratio.toFixed(2)}<br/>`);
				}

				if (!isNaN(seeds)) {
					tooltipPieces.push(`${i18n.__('Seeds:')} ${seeds}`);
				}

				if (!isNaN(peers)) {
					tooltipPieces.push(` &nbsp;/&nbsp; ${i18n.__('Peers:')} ${peers}`);
				}

				getIcon()
					.tooltip({
						html: true
					})
					.removeClass('None Bad Medium Good Excellent')
					.addClass(healthString)
					.attr('data-original-title', tooltipPieces.join(''))
					.tooltip('fixTitle');

        			if ($(selector + '~ .tooltip:contains("Health")').is(':visible')) {
          				getIcon().tooltip('show');
        			}
			}
		});
	};
};

Common.md5 = function (arg) {
	return crypt.createHash('md5').update(arg).digest('hex');
};

Common.fileSize = function (num) {
	if (isNaN(num) || num === null) {
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

Common.sanitize = function (input) {
	function sanitizeString(string) {
		return require('sanitizer').sanitize(string);
	}

	function sanitizeObject(obj) {
		var result = obj;
		for (var prop in obj) {
			result[prop] = obj[prop];
			if (obj[prop] && (obj[prop].constructor === Object || obj[prop].constructor === Array)) {
				result[prop] = sanitizeObject(obj[prop]);
			} else if (obj[prop] && obj[prop].constructor === String) {
				result[prop] = sanitizeString(obj[prop]);
			}
		}
		return result;
	}

	var output = input;
	if (input && (input.constructor === Object || input.constructor === Array)) {
		output = sanitizeObject(input);
	} else if (input && input.constructor === String) {
		output = sanitizeString(input);
	}

	return output;
};

Common.normalize = (function () {
	var from = 'ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç';
	var to = 'AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc';
	var mapping = {};

	for (var i = 0, j = from.length; i < j; i++) {
		mapping[from.charAt(i)] = to.charAt(i);
	}

	return function (str) {
		var ret = [];
		for (var i = 0, j = str.length; i < j; i++) {
			var c = str.charAt(i);
			if (mapping.hasOwnProperty(str.charAt(i))) {
				ret.push(mapping[c]);
			} else {
				ret.push(c);
			}
		}
		return ret.join('').replace(/[^\w,'-]/g, '');
	};
})();

Common.loadImage = function(img, proxy = false) {
	return new Promise(function(resolve, reject) {
		let cache = new Image();
		cache.onload = () => {
			if (img.indexOf('.gif') !== -1) {
				// freeze gifs
				let c = document.createElement('canvas');
				let w = (c.width = img.width);
				let h = (c.height = img.height);

				c.getContext('2d').drawImage(cache, 0, 0, w, h);
				img = c.toDataURL();
			}
			resolve(img);
		};

		cache.onerror = () => {
			if (proxy || img.indexOf('image.tmdb.org') === -1) {
				resolve(null);
				return;
			}
			const apiUrl = App.Config.getProviderForType('tvshow')[0].apiURL;
			const url = apiUrl[0] + 'posters/' + img.split('/').pop();
			resolve(Common.loadImage(url, true));
		};
		cache.src = img;
	});
};

Common.Promises = {
	allSettled: function (promises) {
		var wrappedPromises = promises.map(
			p => Promise.resolve(p)
				.then(val => ({ok: true, value: val}), err => ({ok: false, reason: err})
				));
		return Promise.all(wrappedPromises);
	}
};

Common.getTorrentUri = torrent => torrent.magnet || torrent.url || torrent;

Common.openOrClipboardLink = function(e, link, text, noOpen = false, noCopy = false) {
	if (e.button === 2 && !noCopy) {
		var clipboard = nw.Clipboard.get();
		clipboard.set(link, 'text');
		$('.notification_alert')
			.text(i18n.__('The %s was copied to the clipboard', text))
			.fadeIn('fast')
			.delay(2500)
			.fadeOut('fast')
		;
	}
	if (e.button === 0 && !noOpen) {
		nw.Shell.openExternal(link);
	}
};

Common.qualityCollator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
