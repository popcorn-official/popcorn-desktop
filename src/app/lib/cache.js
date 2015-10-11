(function (App) {
    'use strict';

    var cache = App.Config.cache;
    var db = openDatabase(cache.name, '', cache.desc, cache.size);

    var tableStruct = 'id TEXT, data TEXT, ttl INTEGER, date_saved INTEGER';

    // Update db
    if (db.version !== cache.version) {
        db.changeVersion(db.version, cache.version, function (tx) {
            win.debug('New database version');

            _.each(cache.tables, function (table) {
                tx.executeSql('DROP TABLE IF EXISTS ' + table, [], function () {
                    win.debug('Create table ' + table);
                    tx.executeSql('CREATE TABLE ' + table + ' (' + tableStruct + ')');
                }, function (tx, err) {
                    win.error('Ceating db table', err);
                });
            });
        });
    }

    var buildWhereIn = function (ids) {
        return 'id IN (' + _.map(ids, function () {
            return '?';
        }).join(',') + ')';
    };

    var Cache = function (table) {
        this.table = table;
        this.db = db;
    };

    _.extend(Cache.prototype, {
        getItems: function (ids) {
            var self = this;

            // getItems can be use with scalar id
            ids = $.makeArray(ids);

            var deferred = Q.defer();
            db.transaction(function (tx) {
                // Select item in db
                var query = 'SELECT * FROM ' + self.table + ' WHERE ' + buildWhereIn(ids);
                tx.executeSql(query, ids, function (tx, results) {
                    var cachedData = {};
                    var expiredData = [];
                    var now = +new Date();

                    // Filter expired item
                    for (var i = 0; i < results.rows.length; i++) {
                        var row = results.rows.item(i);
                        var data = JSON.parse(row.data);

                        if (row.ttl !== 0 && row.ttl < now - row.date_saved) {
                            expiredData.push(row.id);
                        } else {
                            cachedData[row.id] = data;
                        }
                    }

                    // Delete expired data
                    if (!_.isEmpty(expiredData)) {
                        self.deleteItems(expiredData);
                    }

                    deferred.resolve(cachedData);
                }, function (tx, err) {
                    win.error('Expired data cleaning', err);
                    deferred.resolve([]);
                });
            });
            return deferred.promise;
        },

        setItem: function (id, item, ttl) {
            var items = {};
            items[id] = item;
            this.setItems(items, ttl);
        },

        setItems: function (items, ttl) {
            var self = this;
            ttl = +ttl || 0;
            var now = +new Date();

            self.getItems(_.keys(items))
                .then(function (cachedData) {
                    db.transaction(function (tx) {
                        _.each(cachedData, function (item, id) {
                            var data = JSON.stringify(item);
                            tx.executeSql('UPDATE ' + self.table + ' SET data = ?, ttl = ?, date_saved = ? WHERE id = ?', [data, ttl, now, id]);
                        });

                        var missedData = _.difference(_.keys(items), _.keys(cachedData));
                        _.each(missedData, function (id) {
                            var data = JSON.stringify(items[id]);
                            var query = 'INSERT INTO ' + self.table + ' VALUES (?, ?, ?, ?)';
                            tx.executeSql(query, [id, data, ttl, now]);
                        });
                    }, function (err) {
                        win.error('db.transaction()', err);
                    });
                });
        },

        deleteItems: function (ids) {
            var self = this;
            db.transaction(function (tx) {
                var query = 'DELETE FROM ' + self.table + ' WHERE ' + buildWhereIn(ids);
                tx.executeSql(query, ids, function () {});
            });
        },

        flushTable: function () {
            var self = this;

            return Q.Promise(function (resolve, reject) {
                db.transaction(function (tx) {
                    var query = 'DELETE FROM ' + self.table;
                    tx.executeSql(query, function () {});
                    resolve();
                });
            });
        }
    });

    App.Cache = Cache;

})(window.App);
