/* globals moment*/
(function (App) {
    'use strict';
    var TVApi = App.Providers.get('TVApi');
    var memoize = require('memoizee');
    var Watchlist = function () {
        this.fetch = memoize(this._fetch.bind(this), {
            maxAge: 30 * 1000, // 30sec
            preFetch: 0.5, // recache every 15sec
            primitive: true
        });
    };
    Watchlist.prototype.constructor = Watchlist;
    Watchlist.prototype.config = {
        name: 'Watchlist'
    };

    var rearrange = function (items) {
        var no_arrange = [],
            arrange = [],
            arranged;

        return Promise.all(items.map(function (item) {
            if (item) {
                if (item.first_aired) {
                    arrange.push(item);
                } else {
                    no_arrange.push(item);
                }
            }
        })).then(function () {
            arranged = arrange.sort(function(a, b){
                if(a.episode_aired > b.episode_aired) {
                    return -1;
                }
                if(a.episode_aired < b.episode_aired) {
                    return 1;
                }
                return 0;
            });
            console.log('rearranged shows by air date');//debug
            return arranged.concat(no_arrange);
        });
    };

    var format = function (items) {
        var itemList = [];
        console.log('format'); //debug

        return Promise.all(items.map(function (item) {
            if (item.next_episode) {
                if(moment(item.next_episode.first_aired).fromNow().indexOf('in') !== -1) {
                    console.warn('"%s" is not released yet, not showing', item.show.title + ' ' + item.next_episode.season + 'x' + item.next_episode.number);
                } else {
                    var show = item.show;
                    show.type = 'show';
                    show.episode = item.next_episode.number;
                    show.season = item.next_episode.season;
                    show.episode_title = item.next_episode.title;
                    show.episode_id = item.next_episode.ids.tvdb;
                    show.episode_aired = item.next_episode.first_aired;
                    show.imdb_id = item.show.ids.imdb;
                    show.tvdb_id = item.show.ids.tvdb;
                    show.image = item.show.images.poster.thumb;
                    show.rating = item.show.rating;
                    show.title = item.show.title;
                    show.trailer = item.show.trailer;

                    itemList.push(show);
                }
            } else {
                if (!item.movie) {
                    console.log('item is not a movie', item); //debug
                } else {
                    if(moment(item.movie.released).fromNow().indexOf('in') !== -1) {
                        console.warn('"%s" is not released yet, not showing', item.movie.title);
                    } else {
                        var movie = item.movie;
                        movie.type = 'movie';
                        movie.imdb_id = item.movie.ids.imdb;
                        movie.rating = item.movie.rating;
                        movie.title = item.movie.title;
                        movie.trailer = item.movie.trailer;
                        movie.year = item.movie.year;
                        movie.image = item.movie.images.poster.thumb;

                        itemList.push(movie);
                    }
                }
            }
        })).then(function () {
            return itemList;
        });
    };

    var load = function () {
        delete localStorage.watchlist_fetched_time;
        delete localStorage.watchlist_cached;
        delete localStorage.watchlist_update_shows;
        delete localStorage.watchlist_update_movies;

        var watchlist = [];

        return trakt.ondeck.getAll().then(function (tv) {
            console.log('shows fetched'); //debug
            // store update data
            localStorage.watchlist_update_shows = JSON.stringify(tv);

            // add tv show to watchlist
            watchlist = watchlist.concat(tv.shows);

            return trakt.sync.watchlist.get({
                extended: 'full,images',
                type: 'movies'
            });
        }).then(function (movies) {
            console.log('movies fetched'); //debug

            // store update data
            localStorage.watchlist_update_movies = JSON.stringify(movies);

            // add movies to watchlist
            watchlist = watchlist.concat(movies);

            return format(watchlist);
        }).then(rearrange).then(function (items) {
            // store fetched timestamp
            localStorage.watchlist_fetched_time = Date.now();

            // cache watchlist
            localStorage.watchlist_cached = JSON.stringify(items);

            return {
                results: items,
                hasMore: false
            };
        });
    };

    var update = function (id) {
        var update_data = JSON.parse(localStorage.watchlist_update_shows);
        delete localStorage.watchlist_fetched_time;
        delete localStorage.watchlist_cached;
        delete localStorage.watchlist_update_shows;

        var watchlist = [];
        
        return trakt.ondeck.updateOne(update_data, id).then(function (tv) {
            console.log('shows updated'); //debug
            // store update data
            localStorage.watchlist_update_shows = JSON.stringify(tv);

            // add tv show & movies to watchlist
            watchlist = JSON.parse(localStorage.watchlist_update_movies).concat(tv.shows);

            return format(watchlist);
        }).then(rearrange).then(function (items) {
            // store fetched timestamp
            localStorage.watchlist_fetched_time = Date.now();

            // cache watchlist
            localStorage.watchlist_cached = JSON.stringify(items);

            return {
                results: items,
                hasMore: false
            };
        });
    };

    Watchlist.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Watchlist.prototype.detail = function (torrent_id, old_data, callback) {
        return {};
    };

    Watchlist.prototype._fetch = function (filters) {
        return new Promise(function (resolve, reject) {
            if (filters && typeof filters !== 'function' && (filters.force || filters.update)) {
                if (filters.update && localStorage.watchlist_update_shows) {
                    console.debug('Watchlist - update one item');
                    return update(filters.update).then(resolve).catch(reject);
                } else {
                    if (filters.force) {
                        console.debug('Watchlist - force reload');
                        return load().then(resolve).catch(reject);
                    } else {
                        console.debug('Watchlist - this should not be called', filters);
                        reject('SHOULDNT BE CALLED');
                    }
                }
            } else {
                // cache is 4 hours
                if (!localStorage.watchlist_cached || parseInt(localStorage.watchlist_fetched_time) + 14400000 < Date.now()) {
                    console.debug('Watchlist - no watchlist cached or cache expired');
                    if (App.Trakt.authenticated) {
                        return App.Providers.get('Watchlist').fetch({force:true}).then(resolve).catch(reject);
                    } else {
                        reject('Trakt not authenticated');
                    }
                } else {
                    console.debug('Watchlist - return cached');
                    resolve({
                        results: JSON.parse(localStorage.watchlist_cached),
                        hasMore: false
                    });
                }
            }  
        });
    };

    App.Providers.install(Watchlist);

})(window.App);
