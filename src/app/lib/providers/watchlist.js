/* globals moment*/
(function (App) {
    'use strict';
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
        var movies = [],
            arranged_movies,
            shows = [],
            arranged_shows;

        return Promise.all(items.map(function (item) {
            if (item) {
                if (item.first_aired) {
                    shows.push(item);
                } else {
                    movies.push(item);
                }
            }
        })).then(function () {
            arranged_shows = shows.sort(function(a, b){
                if(a.episode_aired > b.episode_aired) {
                    return -1;
                }
                if(a.episode_aired < b.episode_aired) {
                    return 1;
                }
                return 0;
            });

            arranged_movies = movies.sort(function(a, b){
                if(a.listed_at < b.listed_at) {
                    return -1;
                }
                if(a.listed_at > b.listed_at) {
                    return 1;
                }
                return 0;
            });
            
            return arranged_shows.concat(movies);
        });
    };

    var format = function (items) {
        var itemList = [];

        return Promise.all(items.map(function (item) {
            if (item.next_episode) {
                if(moment(item.next_episode.first_aired).fromNow().indexOf('in') !== -1) {
                    console.log('"%s" is not released yet, not showing', item.show.title + ' ' + item.next_episode.season + 'x' + item.next_episode.number);
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
                    show.rating = item.show.rating;
                    show.title = item.show.title;
                    show.trailer = item.show.trailer;
                    show.unseen = item.unseen;

                    itemList.push(show);
                }
            } else {
                if (item.movie) {
                    if(moment(item.movie.released).fromNow().indexOf('in') !== -1) {
                        console.log('"%s" is not released yet, not showing', item.movie.title);
                    } else {
                        var movie = item.movie;
                        movie.type = 'movie';
                        movie.listed_at = item.listed_at;
                        movie.imdb_id = item.movie.ids.imdb;
                        movie.rating = item.movie.rating;
                        movie.title = item.movie.title;
                        movie.trailer = item.movie.trailer;
                        movie.year = item.movie.year;

                        itemList.push(movie);
                    }
                }
            }
        })).then(function () {
            return Promise.all(itemList.map(function (item, idx) {
                return App.Trakt.client.images.get(item).then(function (imgs) {
                    itemList[idx].poster = imgs.poster;
                    itemList[idx].backdrop = imgs.background;
                });
            }));
        }).then(function () {
            return itemList;
        });
    };

    var load = function () {
        delete localStorage.watchlist_fetched_time;
        delete localStorage.watchlist_cached;
        delete localStorage.watchlist_update_shows;
        delete localStorage.watchlist_update_movies;

        var watchlist = [];

        return App.Trakt.client.ondeck.getAll().then(function (tv) {
            // store update data
            localStorage.watchlist_update_shows = JSON.stringify(tv);

            // add tv show to watchlist
            watchlist = watchlist.concat(tv.shows);

            return App.Trakt.client.sync.watchlist.get({
                extended: 'full',
                type: 'movies'
            });
        }).then(function (movies) {
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
        
        return App.Trakt.client.ondeck.updateOne(update_data, id).then(function (tv) {
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

    Watchlist.prototype.detail = function (id, data) {
        var formatted = {
            genre: data.genres,
            synopsis: data.overview,
        };

        if (data.type === 'movie') {
            formatted.torrents = {};
        } else {
            formatted.episodes = [{
                episode: data.episode,
                season: data.season,
                title: data.episode_title,
                tvdb_id: data.episode_id,
                first_aired: new Date(data.episode_aired) / 1000,
                date_based: false,
                torrents: {},
            }];
        }

        return Promise.resolve(formatted);
    };

    Watchlist.prototype._fetch = function (filters) {
        return new Promise(function (resolve, reject) {
            if (filters && typeof filters !== 'function' && (filters.force || filters.update)) {
                if (filters.update && localStorage.watchlist_update_shows) {
                    console.log('Watchlist - update one item');
                    return update(filters.update).then(resolve).catch(reject);
                } else {
                    if (filters.force) {
                        console.log('Watchlist - force reload');
                        return load().then(resolve).catch(reject);
                    } else {
                        console.log('Watchlist - this should not be called', filters);
                        reject('SHOULDNT BE CALLED');
                    }
                }
            } else {
                // cache is 4 hours
                if (!localStorage.watchlist_cached || parseInt(localStorage.watchlist_fetched_time) + 14400000 < Date.now()) {
                    console.log('Watchlist - no watchlist cached or cache expired');
                    if (App.Trakt.authenticated) {
                        return App.Providers.get('Watchlist').fetch({force:true}).then(resolve).catch(reject);
                    } else {
                        reject('Trakt not authenticated');
                    }
                } else {
                    console.log('Watchlist - return cached');
                    resolve({
                        results: JSON.parse(localStorage.watchlist_cached),
                        hasMore: false
                    });
                }
            }  
        });
    };

    function onShowWatched(show, channel) {
        if (channel === 'database') {
            setTimeout(function() {
                App.Providers.get('Watchlist').fetch({
                    update: show.imdb_id
                }).then(function() {
                    if (App.currentview === 'Watchlist') {
                        App.vent.trigger('watchlist:list');
                    }
                });
            }, 3000);
        }
    }

    App.vent.on('show:watched', onShowWatched);

    App.Providers.install(Watchlist);

})(window.App);
