App.Controller.Home = function (page) {
    // Check if page exists
    if (!App.Page.Home) {
        // Create page
        App.Page.Home = new App.View.Page({
            id: 'movie-list'
        });
    }
    // Create movie list
    var movieList = new App.View.MovieList({
        searchTerm: null,
        genre: null,
        page: page
    });
    // Clean up if first page
    if (!page || page == '1'){
        $('.movie-list').first().empty();
        App.sidebar = new App.View.Sidebar({
            el: 'sidebar'
        });

        App.Page.Home.show();
    }

    userTracking.pageview('/movies/popular'+((page && page > 1) ? '?page='+page : ''), 'Popular Movies').send();
    
    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 5000);
};