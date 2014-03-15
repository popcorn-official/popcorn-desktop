App.Controller.Search = function (searchTerm, page) {
    // Check if page exists
    if (!App.Page.Search) {
        // Create page
        App.Page.Search = new App.View.Page({
            id: 'movie-list'
        });
    }

    var Scrapper = App.currentScrapper;

    var movieCollection = new Scrapper([], {
        keywords: searchTerm,
        genre: null,
        page: page
    });

    movieCollection.fetch();

    // Create movie list
    var movieList = new App.View.MovieList({
        model: movieCollection
    });

    // Clean up if first page
    if (!page || page == '1'){
        console.log('Searching for ' + searchTerm);
        $('.movie-list').first().empty();
        App.loader(true, i18n.__('searchLoading'));
        window.initialLoading = true;
        App.Page.Search.show();
    }

    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 5000);
};
