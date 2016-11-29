(function (App) {
    'use strict';

    var CacheProvider = function (table, ttl) {
        this._table = table;
        this._cache = new App.CacheV2(table);
        this.ttl = ttl;
    };

    CacheProvider.prototype.config = {
        name: 'CacheProviderV2'
    };

    CacheProvider.prototype.fetch = function (ids) {
        var self = this;
        if (this._cache._openPromise.isFulfilled()) {
            return this._cache.getMultiple(ids).then(function (items) {
                console.log('Loaded %d items from the %s cache!', items.length, self._table);
                return items;
            });
        } else {
            return this._cache._openPromise.then(function () {
                return self._cache.getMultiple(ids).then(function (items) {
                    console.log('Loaded %d items from the %s cache!', items.length, self._table);
                    return items;
                });
            });
        }
    };

    CacheProvider.prototype.store = function (key, items) {
        var promises = [];
        var self = this;
        console.log('Stored %d items in the %s cache!', items.length, this._table);
        _.each(items, function (item) {
            if (!item[key]) {
                return;
            }
            promises.push(self._cache.set(item[key], item, {
                ttl: self.ttl
            }));
        });
        return Q(items);
    };

    App.Providers.CacheProviderV2 = CacheProvider;
})(window.App);
