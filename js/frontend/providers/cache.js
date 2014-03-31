var db = openDatabase('cachedb', '', 'Cache database', 50 * 1024 * 1024);
var Q = require('q');

App.Cache = {
    clear: function () {
        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM trakttv');
            tx.executeSql('DELETE FROM subtitle');
            tx.executeSql('DELETE FROM tmdb');
            tx.executeSql('DELETE FROM ysubs');
        });
    },

    deleteItems: function(provider, keys) {
        db.transaction(function (tx) {
            var query = 'DELETE FROM ' + provider + ' WHERE key IN ('+ _.map(keys, function(){return'?';}).join(',') +')';
            tx.executeSql(query, keys, function () {});
        });
    },

    getItems: function (provider, keys) {
        var deferred = Q.defer();
        db.transaction(function (tx) {
            var query = 'SELECT * FROM ' + provider + ' WHERE key IN ('+ _.map(keys, function(){return'?';}).join(',') +')';
            tx.executeSql(query, keys, function (tx, results) {
                var mappedData = {};
                var expiredData = [];
                var now = +new Date();

                for(var i=0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var data = JSON.parse(row.data);

                    if(data._TTL && data._TTL < now - data._saved) {
                        expiredData.push(row.key);
                    } else {
                        mappedData[row.key] = data;
                    }

                    delete data._TTL;
                    delete data._saved;
                }

                // Clear expired data
                if(!_.isEmpty(expiredData)) {
                    App.Cache.deleteItems(provider, expiredData);
                }

                deferred.resolve(mappedData);
            }, function(){
                deferred.resolve([]);
            });
        });
        return deferred.promise;
    },

    getItem: function (provider, key, cb) {
        if (typeof key !== 'string') {
            key = JSON.stringify(key);
        }

        db.transaction(function (tx) {
            tx.executeSql('SELECT data FROM ' + provider + ' WHERE key = ?', [key], function (tx, results) {
                try {
                    if (results.rows.length) {
                        var result = results.rows.item(0).data;

                        if (typeof result !== 'object') {
                            result = JSON.parse(result);
                        }

                        if (result.hasOwnProperty('_TTL') && result._TTL < +new Date() - result._saved) {
                            result = false;
                            db.transaction(function (tx) {
                                tx.executeSql('DELETE FROM ' + provider + ' WHERE key = ?', [key]);
                                console.logger.debug('One expired!');
                            });
                        }

                        cb(result);
                    } else {
                        cb();
                    }
                } catch (e) {
                    cb();

                    if (isDebug) {
                        throw e;
                    }
                }
            }, function () {
                // On error
                cb();
            });
        });
    },
    setItem: function (provider, key, data, ttl) {
        if (ttl) {
            data = _.extend({_saved: +new Date(), _TTL: ttl}, data);
        }

        if (typeof key !== 'string') {
            key = JSON.stringify(key);
        }

        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + provider + ' (key TEXT, data TEXT)');

            //Implementation to check if exist registration in db and update instead of insert
            //Does a SELECT on Provider
            tx.executeSql('SELECT data FROM ' + provider + ' WHERE key = ?', [key], function (tx, results) {
                if (results.rows.length) {
                    tx.executeSql('UPDATE ' + provider + ' SET data = ? WHERE key = ?', [data, key]);
                } else {
                    tx.executeSql('INSERT INTO ' + provider + ' VALUES (?, ?)', [key, data]);
                }
            });
        });
    }
};
