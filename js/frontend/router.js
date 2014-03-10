var Router = Backbone.Router.extend({
    routes: {
        'index(:page).html':   App.Controller.Home,
        'search/:term(/:page)': App.Controller.Search,
        'filter/:genre(/:page)': App.Controller.FilterGenre
    }
});

App.Router = new Router();

Backbone.history.start({
    hashChange: false,
    pushState: true
});