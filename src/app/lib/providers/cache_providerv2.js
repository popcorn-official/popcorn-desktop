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
                win.debug('Loaded ' + items.length + ' items from the ' + self._table + ' cache!');
                return items;
            });
        } else {
            return this._cache._openPromise.then(function () {
                return self._cache.getMultiple(ids).then(function (items) {
                    win.debug('Loaded ' + items.length + ' items from the ' + self._table + ' cache!');
                    return items;
                });
            });
        }
    };

    CacheProvider.prototype.store = function (key, items) {
        var promises = [];
        var self = this;
        win.debug('Stored ' + items.length + ' items in the ' + this._table + ' cache!');
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
