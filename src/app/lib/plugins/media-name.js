((App) => {
    const mediaNameSymbol = Symbol('torrentMediaName');

    // If a value is in the cache for longer than a minute, it is
    // assumed to be invalid -- perhaps there was some error in
    // initializing the download. We generally expect operations
    // to be performed on the order of milliseconds, but we're
    // giving a lot of leeway here just for the sake of resilience.
    // We may also never consume if the torrent is ready immediately.
    const maxTimeInCacheMs = 60 * 1000;

    /**
     * When torrents are added, we don't know their title until they tell us they are "ready".
     * However, some torrents are never ready, and even if they are ready, it may take
     * anywhere from a few seconds for a torrent with good health up to minutes for one with
     * poor health.
     * This plugin helps provide the name of the source media until we know the actual title
     * of the torrent once it is ready.
     * To reduce memory usage, all media names are only able to be "consumed" rather than read,
     * meaning they can only be read once before they must be re-inserted into this cache.
     */
    class MediaNamePlugin {
        constructor() {
            this._infoHashToMediaName = new Map();
            this._infoHashToInsertTime = new Map();
            // the timeout is arbitrary and can be changed without consequence, but it shouldn't be too short so that
            // we avoid iterating over all the entries too often.
            this._cleanupTask = setInterval(() => this._clean(), maxTimeInCacheMs);
        }

        _remove(infoHash) {
            this._infoHashToInsertTime.delete(infoHash);
            this._infoHashToMediaName.delete(infoHash);
        }

        _clean() {
            const now = Date.now();
            for (const [infoHash, insertTime] of this._infoHashToInsertTime) {
                if (now - insertTime >= maxTimeInCacheMs) {
                    this._remove(infoHash);
                }
            }
        }

        /**
         * Given an infoHash, gets the cached name of that torrent's
         * source media, and deletes it from the cache if it exists.
         * @param infoHash - The torrent's infoHash
         * @returns {string}
         */
        _consumeMediaName(infoHash) {
            const mediaName = this._infoHashToMediaName.get(infoHash);
            this._remove(infoHash);
            return mediaName;
        }

        /**
         * Sets the original media name to be consumed once downloading begins
         * @param infoHash - The torrent to be downloaded
         * @param mediaName - The name of the source media for this torrent
         */
        setMediaName(infoHash, mediaName) {
            this._infoHashToMediaName.set(infoHash, mediaName);
            this._infoHashToInsertTime.set(infoHash, Date.now());
        }

        /**
         * Get the name of a given torrent. This will use torrent.name if available,
         * or the cached media name otherwise.
         * @param torrent
         * @returns {string}
         */
        getMediaName(torrent) {
            if (torrent.name) {
                return torrent.name;
            }

            if (torrent[mediaNameSymbol]) {
                return torrent[mediaNameSymbol];
            }

            const mediaName = this._consumeMediaName(torrent.infoHash);
            if (mediaName) {
                torrent[mediaNameSymbol] = mediaName;
                return mediaName;
            }

            return i18n.__('Unknown torrent');
        }
    }

    /**
     * @namespace {App}
     * @type {MediaNamePlugin}
     */
    App.plugins.mediaName = new MediaNamePlugin();
})(window.App);
