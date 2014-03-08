App.Controller.FilterGenre = function (genre, page) {
    var movieList = new App.View.MovieList({
        searchTerm: null,
        genre: genre,
        page: page
    });

    if (App.Page.FilterGenre) {
        App.Page.FilterGenre.$el.empty();
    } else {
        App.Page.FilterGenre = new App.View.Page({
            id: 'category-list'
        });
    }

    App.Page.FilterGenre.$el.append(movieList.$el);

    App.Page.FilterGenre.show();

    userTracking.pageview('/movies/'+genre + (page ? '?page='+page : ''), genre.capitalize() + ' Movies').send();
};