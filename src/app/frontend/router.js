var Router = Backbone.Router.extend({
    routes: {
    }
});

App.Router = new Router();

Backbone.history.start({
    hashChange: false,
    pushState: true
});