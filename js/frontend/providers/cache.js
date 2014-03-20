var db = openDatabase('cachedb', '1.0', 'Cache database', 50 * 1024 * 1024);
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
    getItems: function (provider, keys) {
        var deferred = Q.defer();
        db.transaction(function (tx) {
            var query = 'SELECT key, data FROM ' + provider + ' WHERE key IN ('+ _.map(keys, function(){return'?';}).join(',') +')';
            tx.executeSql(query, keys, function (tx, results) {
                var mappedData = {};
                for(var i=0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    mappedData[row.key] = JSON.parse(row.data);
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

                        if (result.hasOwnProperty('_TTL') && result._TTL * 1000 < +new Date() - result.saved) {
                            result = false;
                            db.transaction(function (tx) {
                                tx.executeSql('DELETE FROM ' + provider + ' WHERE key = ?', [key]);
                                console.log('One expired!');
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
    setItem: function (provider, key, data) {
        if (typeof key !== 'string') {
            key = JSON.stringify(key);
        }

        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        if (data.hasOwnProperty('_TTL')) {
            data.saved = +new Date();
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
