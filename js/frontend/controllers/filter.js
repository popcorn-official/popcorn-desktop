App.Controller.FilterGenre = function (genre, page) {
    // Check if page exists
    if (!App.Page.FilterGenre) {
        // Create page
        App.Page.FilterGenre = new App.View.Page({
            id: 'category-list'
        });
    }
	// Create movie list
    var movieList = new App.View.MovieList({
        searchTerm: null,
        genre: genre,
        page: page
    });
	// Clean up if first page
    if (!page || page == '1'){
        $('.movie-list').first().empty();
        App.Page.FilterGenre.show();
    }
    
    userTracking.pageview('/movies/'+genre + ((page && page > 1) ? '?page='+page : ''), genre.capitalize() + ' Movies').send();
    
    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 5000);
};
