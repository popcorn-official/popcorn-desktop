App.Controller.Search = function (searchTerm, page) {
    // Check if page exists
    if (App.Page.Search) {
        // Create page
        App.Page.Search = new App.View.Page({
            id: 'search-list'
        });    
    }
    // Create movie list
    var movieList = new App.View.MovieList({
        keywords: searchTerm,
        genre: null,
        page: page
    });
    
    // Clean up if first page
    if (!page || page == '1'){
        console.log('Searching for ' + searchTerm);
        $('.movie-list').first().empty();
        App.loader(true, i18n.__('searchLoading'));
        window.initialLoading = true;
        App.Page.Search.show();
    }
    
    userTracking.pageview('/movies/search?q='+encodeURIComponent(searchTerm)+((page && page > 1) ? '&page='+page : '')).send();

    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 1000);
};
