App.Controller.Home = function (page) {
    var movieList = new App.View.MovieList({
        searchTerm: null,
        genre: null,
        page: page
    });


    if (App.Page.Home) {
        if (!page || page == '1'){
            App.Page.Home.$el.empty();
        }
    } else {
        App.Page.Home = new App.View.Page({
            id: 'movie-list'
        });
    }

        App.Page.Home.$el.append(movieList.$el);

    if (!page || page == '1'){
        App.sidebar = new App.View.Sidebar({
            el: 'sidebar'
        });

        App.Page.Home.show();
    }


    userTracking.pageview('/movies/popular'+((page && page > 1) ? '?page='+page : ''), 'Popular Movies').send();
    
    setTimeout(function(){
        movieList.constructor.busy = false;
    }, 1000);
};