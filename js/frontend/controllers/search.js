App.Controller.Search = function (searchTerm) {
    console.log('Searching for ' + searchTerm);

    App.loader(true, Language.searchLoading);

    var movieList = new App.View.MovieList({
        keywords: searchTerm,
        genre: null
    });

    if (App.Page.Search) {
        App.Page.Search.$el.empty();
    } else {
        App.Page.Search = new App.View.Page({
            id: 'search-list'
        });
    }

    App.Page.Search.$el.append(movieList.$el);

    App.Page.Search.show();
};