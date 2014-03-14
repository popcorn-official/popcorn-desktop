var Foo = Backbone.Collection.extend({
    model: App.Model.Movie,
    url: 'http://foo'
});

App.Scrapers.Foo = Foo;