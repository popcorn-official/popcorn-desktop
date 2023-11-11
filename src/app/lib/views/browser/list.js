(function (App) {
    'use strict';

    var NUM_MOVIES_IN_ROW = 7;
    var filterBarElem;
    var _this;

    function elementInViewport(container, element) {
        if (element.length === 0) {
            return;
        }
        var $container = $(container),
            $el = $(element);

        var docViewTop = $container.offset().top;
        var docViewBottom = docViewTop + $container.height();

        var elemTop = $el.offset().top;
        var elemBottom = elemTop + $el.height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && (elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    var ErrorView = Marionette.View.extend({
        template: '#movie-error-tpl',
        ui: {
            retryButton: '.retry-button',
            changeApi: '.change-api',
            onlineSearch: '.online-search'
        },
        onBeforeRender: function () {
            this.model.set('error', this.error);
        },
        onRender: function () {
            if (this.retry) {
                switch (App.currentview) {
                case 'movies':
                case 'shows':
                case 'anime':
                    this.ui.onlineSearch.css('visibility', 'visible');
                    this.ui.retryButton.css('visibility', 'visible');
                    this.ui.changeApi.css('visibility', 'visible');
                    this.ui.onlineSearch.parent().parent().css({'text-align': 'center', 'width': '100%'});
                    break;
                case 'Watchlist':
                    this.ui.onlineSearch.css('display', 'none');
                    this.ui.retryButton.css('visibility', 'visible');
                    this.ui.changeApi.css('display', 'none');
                    this.ui.onlineSearch.parent().parent().css({'text-align': 'center', 'width': '100%'});
                    break;
                default:
                }
            } else if (this.show_online_search) {
                switch (App.currentview) {
                case 'movies':
                case 'shows':
                case 'anime':
                    this.ui.onlineSearch.css('visibility', 'visible');
                    this.ui.retryButton.css('display', 'none');
                    this.ui.changeApi.css('display', 'none');
                    this.ui.onlineSearch.parent().parent().css({'text-align': 'center', 'width': '100%'});
                    break;
                default:
                }
            }

        }
    });

    var List = Backbone.Marionette.CompositeView.extend({
        template: '#list-tpl',

        tagName: 'ul',
        className: 'list',

        childView: App.View.Item,
        childViewContainer: '.items',

        events: {
            'scroll': 'onScroll',
            'mousewheel': 'onScroll',
            'keydown': 'onScroll'
        },

        ui: {
            spinner: '.spinner'
        },


        isEmpty: function () {
            return !this.collection.length && this.collection.state !== 'loading';
        },

        emptyView: function () {
            switch (App.currentview) {
            case 'movies':
            case 'shows':
            case 'anime':
                if (this.collection.state === 'error') {
                    var errorURL;
                    switch (App.currentview) {
                    case 'movies':
                        errorURL = App.Config.getProviderForType('movie')[0].apiURL ? App.Config.getProviderForType('movie')[0].apiURL.slice(0) : '';
                        break;
                    case 'shows':
                        errorURL = App.Config.getProviderForType('tvshow')[0].apiURL ? App.Config.getProviderForType('tvshow')[0].apiURL.slice(0) : '';
                        break;
                    case 'anime':
                        errorURL = App.Config.getProviderForType('anime')[0].apiURL ? App.Config.getProviderForType('anime')[0].apiURL.slice(0) : '';
                        break;
                    default:
                        errorURL = '';
                    }
                    if (errorURL) {
                        errorURL.forEach(function(e, index) {
                            errorURL[index] = '<a class="links" href="' + encodeURI(e) + '">' + encodeURI(e.replace(/http:\/\/|https:\/\/|\/$/g, '')) + '</a>';
                        });
                        errorURL = errorURL.join(', ').replace(/,(?=[^,]*$)/, ' &');
                    } else {
                        errorURL = i18n.__('the URL(s)');
                    }
                    return ErrorView.extend({
                        retry: true,
                        error: i18n.__('The remote ' + App.currentview + ' API failed to respond, please check %s and try again later', errorURL)
                    });
                } else if (this.collection.state !== 'loading') {
                    return ErrorView.extend({
                        show_online_search: true,
                        error: i18n.__('No ' + App.currentview.toLowerCase() + ' found...'),
                    });
                }
                break;

            case 'Favorites':
                if (this.collection.state === 'error') {
                    return ErrorView.extend({
                        retry: true,
                        error: i18n.__('Error, database is probably corrupted. Try flushing the bookmarks in settings.')
                    });
                } else if (this.collection.state !== 'loading') {
                    return ErrorView.extend({
                        error: i18n.__('No ' + App.currentview.toLowerCase() + ' found...')
                    });
                }
                break;
            case 'Watched':
                if (this.collection.state === 'error') {
                    return ErrorView.extend({
                        retry: true,
                        error: i18n.__('Error, database is probably corrupted. Try flushing the watched items in settings.')
                    });
                } else if (this.collection.state !== 'loading') {
                    return ErrorView.extend({
                        error: i18n.__('No ' + App.currentview.toLowerCase() + ' items found...')
                    });
                }
                break;
            case 'Watchlist':
                if (this.collection.state === 'error') {
                    return ErrorView.extend({
                        retry: true,
                        error: i18n.__('This feature only works if you have your TraktTv account synced. Please go to Settings and enter your credentials.')
                    });
                } else if (this.collection.state !== 'loading') {
                    return ErrorView.extend({
                        error: i18n.__('No ' + App.currentview.toLowerCase() + ' found...')
                    });
                }
                break;
            }
        },

        initialize: function () {
            _this = this;
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);

            filterBarElem = _.pluck(App.Config.getTabTypes(), 'name');
            filterBarElem = filterBarElem.map(v => v.toLowerCase());
            for (var i = 0; i < filterBarElem.length; i++) {
                if (filterBarElem[i] === 'series') {
                    filterBarElem[i] = 'shows';
                }
            }
            if (Settings.favoritesTabEnable) {
                filterBarElem.push('Favorites');
            }
            if (Settings.watchedTabEnable) {
                filterBarElem.push('Watched');
            }

            _this.initKeyboardShortcuts();

            _this.initPosterResizeKeys();

            App.vent.on('viewstack:pop', function() {
                if (_.last(App.ViewStack) === 'init-container' || _.last(App.ViewStack) === 'main-browser') {
                    _this.initKeyboardShortcuts();
                }
            });
        },

        initKeyboardShortcuts: function () {
            var searchInput = $('.search input');

            Mousetrap.bind('up', _this.moveUp);

            Mousetrap.bind('down', _this.moveDown);

            Mousetrap.bind('left', _this.moveLeft);

            Mousetrap.bind('right', _this.moveRight);

            Mousetrap.bind('f', _this.toggleSelectedFavourite, 'keydown');

            Mousetrap.bind('w', _this.toggleSelectedWatched, 'keydown');

            Mousetrap.bind(['enter', 'space'], _this.selectItem);

            Mousetrap.bind(['ctrl+f', 'command+f'], _this.focusSearch, 'keydown');

            Mousetrap(document.querySelector('input')).bind(['ctrl+f', 'command+f', 'esc'], function (e, combo) {
                searchInput.blur();
            }, 'keydown');

            Mousetrap.bind(['tab', 'shift+tab'], function (e, combo) {
                if ((App.PlayerView === undefined || App.PlayerView.isDestroyed) && $('#about-container').children().length <= 0 && $('#player').children().length <= 0) {
                    var filterBarPos = filterBarElem.indexOf(App.currentview);
                    App.vent.trigger('torrentCollection:close');
                    App.vent.trigger('seedbox:close');
                    $('.filter-bar').find('.active').removeClass('active');
                    if (combo === 'tab') {
                        if (filterBarPos >= ($(filterBarElem).toArray().length - 1)) {
                            filterBarPos = 0;
                        } else {
                            ++filterBarPos;
                        }
                    } else if (combo === 'shift+tab') {
                        if (filterBarPos <= 0) {
                            filterBarPos = ($(filterBarElem).toArray().length - 1);
                        } else {
                            --filterBarPos;
                        }
                    }
                    App.currentview = filterBarElem[filterBarPos];
                    if (App.currentview === 'Watched') {
                        App.vent.trigger('favorites:list', []);
                    } else {
                        App.vent.trigger(App.currentview.toLowerCase() + ':list', []);
                    }
                    if (App.currentview === 'movies') {
                        $('.source.movieTabShow').addClass('active');
                    } else if (App.currentview === 'shows') {
                            $('.source.tvshowTabShow').addClass('active');
                    } else if (App.currentview === 'Favorites') {
                            $('#filterbar-favorites').addClass('active');
                    } else if (App.currentview === 'Watched') {
                            $('#filterbar-watched').addClass('active');
                    } else {
                            $('.source.' + App.currentview + 'TabShow').addClass('active');
                    }
                }
            });

            Mousetrap.bind(['ctrl+1', 'ctrl+2', 'ctrl+3', 'ctrl+4', 'ctrl+5'], function (e, combo) {
                if ((App.PlayerView === undefined || App.PlayerView.isDestroyed) && $('#about-container').children().length <= 0 && $('#player').children().length <= 0 && combo.charAt(5) <= $(filterBarElem).toArray().length && App.currentview !== filterBarElem[combo.charAt(5) - 1]) {
                    App.vent.trigger('torrentCollection:close');
                    App.vent.trigger('seedbox:close');
                    $('.filter-bar').find('.active').removeClass('active');
                    App.currentview = filterBarElem[combo.charAt(5) - 1];
                    if (App.currentview === 'Watched') {
                        App.vent.trigger('favorites:list', []);
                    } else {
                        App.vent.trigger(App.currentview.toLowerCase() + ':list', []);
                    }
                    if (App.currentview === 'movies') {
                        $('.source.movieTabShow').addClass('active');
                    } else if (App.currentview === 'shows') {
                        $('.source.tvshowTabShow').addClass('active');
                    } else if (App.currentview === 'Favorites') {
                        $('#filterbar-favorites').addClass('active');
                    } else if (App.currentview === 'Watched') {
                        $('#filterbar-watched').addClass('active');
                    } else {
                        $('.source.' + App.currentview + 'TabShow').addClass('active');
                    }
                }
            });

            Mousetrap.bind(['`', 'b'], function () {
                if ((App.PlayerView === undefined || App.PlayerView.isDestroyed) && $('#about-container').children().length <= 0 && $('#player').children().length <= 0) {
                    $('#filterbar-favorites').click();
                }
            }, 'keydown');

            Mousetrap.bind('i', function () {
                if (!App.ViewStack.includes('about')) {
                    App.vent.trigger('about:show');
                } else {
                    App.vent.trigger('about:close');
                }
            }, 'keydown');
        },

        initPosterResizeKeys: function () {
            $(window)
                .on('mousewheel', function (event) { // Ctrl + wheel doesnt seems to be working on node-webkit (works just fine on chrome)
                    if (event.altKey === true) {
                        event.preventDefault();
                        if (event.originalEvent.wheelDelta > 0) {
                            _this.increasePoster();
                        } else {
                            _this.decreasePoster();
                        }
                    }
                })
                .on('keydown', function (event) {
                    if (event.ctrlKey === true || event.metaKey === true) {

                        if ($.inArray(event.keyCode, [107, 187]) !== -1) {
                            _this.increasePoster();
                            return false;

                        } else if ($.inArray(event.keyCode, [109, 189]) !== -1) {
                            _this.decreasePoster();
                            return false;
                        }
                    }
                });
        },

        onAttach: function () {
            if (this.collection.state === 'loading') {
                this.onLoading();
            }
        },

        onLoading: function () {
            $('.status-loadmore').hide();
            $('#loading-more-animi').show();
        },

        onLoaded: function () {
            App.vent.trigger('list:loaded');

            // Added for v2-style checkEmpty
            if (this.isEmpty()) {
                this._showEmptyView();
            }

            var self = this;
            this.addloadmore();

            this.AddGhostsToBottomRow();
            $(window).resize(function () {
                var addghost;
                clearTimeout(addghost);
                addghost = setTimeout(function () {
                    self.AddGhostsToBottomRow();
                }, 100);
            });

            if (typeof (this.ui.spinner) === 'object') {
                this.ui.spinner.hide();
            }

            $('.filter-bar').on('mousedown', function (e) {
                if (e.target.localName !== 'div') {
                    return;
                }
                _.defer(function () {
                    self.$('.items:first').focus();
                });
            });
            $('.items').attr('tabindex', '1');
            _.defer(function () {
                self.checkFetchMore();
                self.$('.items:first').focus();
            });

            $('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });

            $('.providerinfo').tooltip({
                delay: {
                    'show': 2400,
                    'hide': 100
                },
                html: true
            });
        },

        checkFetchMore: function () {
            // if load more is visible onLoaded, fetch more results
            if (elementInViewport(this.$el, $('#load-more-item'))) {
                this.collection.fetchMore();
            }
        },

        addloadmore: function () {
            var self = this;

            // maxResults to hide load-more on providers that return hasMore=true no matter what.
            var currentPage = Math.ceil(this.collection.length / 50);
            var maxResults = currentPage * 50;

            switch (App.currentview) {
            case 'movies':
            case 'shows':
            case 'anime':
                $('#load-more-item').remove();
                $('#search-more-item').remove();
                // we add a load more
                if (this.collection.hasMore && this.collection.state !== 'error' && this.collection.length !== 0 && this.collection.length >= maxResults) {
                    $('.items').append('<div id="load-more-item" class="load-more"><span class="status-loadmore">' + i18n.__('Load More') + '</span><div id="loading-more-animi" class="loading-container"><div class="ball"></div><div class="ball1"></div></div><span id="overlay"></span></div>');

                    $('#load-more-item').click(function () {
                        $('#load-more-item').off('click');
                        self.collection.fetchMore();
                    });

                    $('#loading-more-animi').hide();
                    $('.status-loadmore').show();
                }
                break;

            case 'Favorites':

                break;
            case 'Watchlist':

                break;
            }
        },

        AddGhostsToBottomRow: function () {
            var items = $('.items');
            var item = $('.items .item:not(.ghost)');

            $('.ghost').remove();
            var listWidth = items.width();
            var itemWidth = item.width() + (2 * parseInt(item.css('margin')));
            var itemsPerRow = parseInt(listWidth / itemWidth);
            /* in case we .hide() items at some point:
            var visibleItems = 0;
            var hiddenItems = 0;
            $('.item').each(function () {
                $(this).is(':visible') ? visibleItems++ : hiddenItems++;
            });
            var itemsInLastRow = visibleItems % itemsPerRow;*/
            NUM_MOVIES_IN_ROW = itemsPerRow;
            var itemsInLastRow = item.length % itemsPerRow;
            var ghostsToAdd = itemsPerRow - itemsInLastRow;
            while (ghostsToAdd > 0) {
                $('.items').append($('<li/>').addClass('item ghost'));
                ghostsToAdd--;
            }
        },

        onScroll: function () {
            if (!this.collection.hasMore) {
                return;
            }

            var viewsToBottom = (this.$el.prop('scrollHeight') - this.$el.scrollTop()) / this.$el.height();

            if (this.collection.state === 'loaded' && viewsToBottom < 3) {
                this.collection.fetchMore();
            }
        },

        focusSearch: function (e) {
            $('.search input').focus();
        },

        increasePoster: function (e) {
            var postersWidthIndex = Settings.postersJump.indexOf(parseInt(Settings.postersWidth));

            if (postersWidthIndex !== -1 && postersWidthIndex + 1 in Settings.postersJump) {
                App.db.writeSetting({
                        key: 'postersWidth',
                        value: Settings.postersJump[postersWidthIndex + 1]
                    })
                    .then(function () {
                        App.vent.trigger('updatePostersSizeStylesheet');
                    });
            } else {
                // do nothing for now
            }
        },

        decreasePoster: function (e) {
            var postersWidth;
            var postersWidthIndex = Settings.postersJump.indexOf(parseInt(Settings.postersWidth));

            if (postersWidthIndex !== -1 && postersWidthIndex - 1 in Settings.postersJump) {
                postersWidth = Settings.postersJump[postersWidthIndex - 1];
            } else {
                postersWidth = Settings.postersJump[0];
            }

            App.db.writeSetting({
                    key: 'postersWidth',
                    value: postersWidth
                })
                .then(function () {
                    App.vent.trigger('updatePostersSizeStylesheet');
                });
        },


        selectItem: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            $('.item.selected .cover').trigger('click');
        },

        selectIndex: function (index) {
            var item = $('.items .item');
            var itemSelected = $('.item.selected');

            if (item.eq(index).length === 0 || item.eq(index).children().length === 0) {
                return;
            }
            itemSelected.removeClass('selected');
            item.eq(index).addClass('selected');

            var $movieEl = item[index];
            if (!elementInViewport(this.$el, $movieEl)) {
                if (itemSelected.index() > index) {
                    $movieEl.scrollIntoView(true);
                    document.getElementsByClassName('list')[0].scrollTop -= 75;
                } else if (itemSelected.index() < index) {
                    $movieEl.scrollIntoView(false);
                }
                this.onScroll();
            }
        },

        moveUp: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var index = $('.item.selected').index();
            if (index === -1) {
                index = 0;
            } else {
                index = index - NUM_MOVIES_IN_ROW;
            }
            if (index < 0) {
                return;
            }
            _this.selectIndex(index);
        },

        moveDown: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var index = $('.item.selected').index();
            if (index === -1) {
                index = 0;
            } else {
                index = index + NUM_MOVIES_IN_ROW;
            }
            _this.selectIndex(index);
        },

        moveLeft: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var index = $('.item.selected').index();
            if (index === -1) {
                index = 0;
            } else if (index === 0) {
                index = 0;
            } else {
                index = index - 1;
            }
            _this.selectIndex(index);
        },

        moveRight: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var index = $('.item.selected').index();
            if (index === -1) {
                index = 0;
            } else {
                index = index + 1;
            }
            _this.selectIndex(index);
        },

        toggleSelectedFavourite: function (e) {
            $('.item.selected .actions-favorites').click();
        },

        toggleSelectedWatched: function (e) {
            $('.item.selected .actions-watched').click();
        },
    });

    function onMoviesWatched(movie, channel) {
        if  (channel === 'database') {
            try {
                var el = $('li[data-imdb-id="' + App.MovieDetailView.model.get('imdb_id') + '"]');

                switch (Settings.watchedCovers) {
                    case 'fade':
                        $('li[data-imdb-id="' + App.MovieDetailView.model.get('imdb_id') + '"] .actions-watched').addClass('selected');
                        el.addClass('watched');
                        break;
                    case 'hide':
                        el.remove();
                        break;
                }
                $('.watched-toggle').addClass('selected').text(i18n.__('Seen'));
                App.MovieDetailView.model.set('watched', true);
            } catch (e) {}
        }
    }

    App.vent.on('movie:watched', onMoviesWatched);

    App.View.List = List;
})(window.App);
