(function (App) {
    'use strict';

    var Q = require('q');

    // Wraps a IndexedDB Request in a promise
    function WrapRequest(deferred, request) {
        if (request === undefined) {
            request = deferred;
            deferred = Q.defer();
        }

        var existingSuccess = request.onsuccess;
        request.onsuccess = function () {
            deferred.resolve(this.result);
            if (existingSuccess !== null) {
                existingSuccess.call(request);
            }
        };

        var existingError = request.onerror;
        request.onerror = function () {
            deferred.reject(this.error);
            if (existingError !== null) {
                existingError.call(request);
            }
        };

        return deferred;
    }

    function Cache(table) {
        var self = this;

        this.table = table;

        var db = indexedDB.open(App.Config.cachev2.name, App.Config.cachev2.version);
        db.onsuccess = function () {
            self.db = this.result;
        };
        db.onupgradeneeded = function () {
            var self = this;
            App.Config.cachev2.tables.forEach(function (tableName) {
                if (_.contains(self.result.objectStoreNames, tableName)) {
                    return;
                }
                self.result.createObjectStore(tableName, {
                    keyPath: '_id'
                });
            });
        };
        this._openPromise = WrapRequest(db).promise;
    }

    Cache.prototype.set = function (key, value, options) {
        options = options || {};
        var data = _.extend(value, {
            _id: key,
            _ttl: options.ttl || 14400000,
            _lastModified: +new Date()
        });
        return WrapRequest(this.db.transaction(this.table, 'readwrite').objectStore(this.table).put(data)).promise;
    };

    Cache.prototype.get = function (key) {
        var deferred = Q.defer();
        var request = this.db.transaction(this.table, 'readonly').objectStore(this.table).get(key);
        request.onsuccess = function () {
            delete this.result._id;
            delete this.result._ttl;
            delete this.result._lastModified;
            deferred.resolve(this.result);
        };
        request.onerror = function () {
            deferred.reject(this.error);
        };
        return deferred.promise;
    };

    Cache.prototype.getMultiple = function (keys) {
        var deferred = Q.defer();
        var request = this.db.transaction(this.table, 'readonly').objectStore(this.table).openCursor();
        var results = [];
        request.onsuccess = function () {
            var cursor = this.result;
            if (cursor) {
                if (_.contains(keys, cursor.key)) {
                    results.push(cursor.value);
                }
                cursor.continue();
            } else {
                deferred.resolve(results);
            }
        };
        request.onerror = function () {
            deferred.reject(this.error);
        };
        return deferred.promise;
    };

    Cache.prototype.update = function (key, value, options) {
        var self = this;
        options = options || {};
        var deferred = Q.defer();
        var request = this.db.transaction(this.table, 'readonly').objectStore(this.table).get(key);
        request.onsuccess = function () {
            var data = _.extend(this.result, value);
            data._id = key;
            data._ttl = options.ttl || 14400000;
            data._lastModified = +new Date();
            WrapRequest(deferred, self.db.transaction(this.table, 'readwrite').objectStore(this.table).put(data));
        };
        request.onerror = function () {
            deferred.reject(this.error);
        };
        return deferred.promise;
    };

    Cache.prototype.gc = function () {
        var request = this.db.transaction(this.table, 'readwrite').objectStore(this.table).openCursor();
        request.onsuccess = function () {
            var cursor = this.result;
            if (cursor) {
                var ttl = cursor.value._ttl;
                var lastModified = cursor.value._lastModified;
                if (new Date() - lastModified > ttl) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
    };

    App.CacheV2 = Cache;

})(window.App);
