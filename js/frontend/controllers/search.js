App.Controller.Search = function (searchTerm, page) {
    var movieList = new App.View.MovieList({
        keywords: searchTerm,
        genre: null,
        page: page
    });

    if (App.Page.Search) {
        if (!page || page == '1'){
            console.log('Searching for ' + searchTerm);

            App.loader(true, i18n.__('searchLoading'));
            window.initialLoading = true;
            App.Page.Search.$el.empty();
        }
    } else {
        App.Page.Search = new App.View.Page({
            id: 'search-list'
        });
    }

    App.Page.Search.$el.append(movieList.$el);

    if (!page || page == '1'){
        App.Page.Search.show();
    }
    
    userTracking.pageview('/movies/search?q='+encodeURIComponent(searchTerm)).send();

    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 1000);
};
