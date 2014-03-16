App.Controller.Home = function (page) {
    // Check if page exists
    if (!App.Page.Home) {
        // Create page
        App.Page.Home = new App.View.Page({
            id: 'movie-list'
        });
    }

    var Scrapper = App.currentScrapper;

    var movieCollection = new Scrapper([], {
        keywords: null,
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
        $('.movie-list').first().empty();
        App.sidebar = new App.View.Sidebar({
            el: 'sidebar'
        });

        App.Page.Home.show();
    }

    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 5000);
};