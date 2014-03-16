App.Controller.FilterGenre = function (genre, page) {
    // Check if page exists
    if (!App.Page.FilterGenre) {
        // Create page
        App.Page.FilterGenre = new App.View.Page({
            id: 'movie-list'
        });
    }

    var Scrapper = App.currentScrapper;

    var movieCollection = new Scrapper([], {
        keywords: null,
        genre: genre,
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
        App.Page.FilterGenre.show();
    }

    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 5000);
};
