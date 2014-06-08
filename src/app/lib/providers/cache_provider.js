(function(App) {
    'use strict';

    var CacheProvider = function(table, ttl) {
        this._table = table;
        this._cache = new App.Cache(table);
        this.ttl = ttl;
    };

    CacheProvider.prototype.fetch = function(ids) {
        var self = this;

        console.log(ids);
        return this._cache.getItems(ids).then(function(items) {
            win.info('Loaded ' + items.length + ' items from ' + self._table + ' cache');
            return items;
        });
    };

    CacheProvider.prototype.store = function(key, items) {
        win.info('Just Cached ' + items.length + ' items in ' + this._table);
        this._cache.setItems(key, items, this.ttl);
        return items;
    };

    App.Providers.CacheProvider = CacheProvider;
})(window.App);