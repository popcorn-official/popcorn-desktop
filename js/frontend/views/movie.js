App.View.MovieListItem = Marionette.ItemView.extend({
    tagName: 'li',
    className: 'movie',
    model: App.Model.Movie,
    id: function() {
        return 'movie-'+this.model.get('imdb')
    },

    events: {
        'click a': 'select'
    },

    initialize: function () {
        this.render();
    },

    template: _.template('<a href="javascript:;">'+
            '<i class="fa fa-eye fa-3"></i>'+
            '<span class="cover"></span>'+
            '<strong><%= title %></strong>'+
            '<small><%- year %></small>'+
        '</a>'),

    serializeData: function() {
        return _.extend({}, this.model.attributes, {
            title: this.model.getShortTitle()
        });
    },

    select: function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        if (this.$el.hasClass('active')) {
            this.$el.removeClass('active');
            App.sidebar.hide();
        } else {
            this.$el.parent().find('.active').removeClass('active');
            this.$el.addClass('active');
            App.sidebar.load(this.model);
        }
    }
});