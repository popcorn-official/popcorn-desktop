App.View.MovieListItem = Backbone.View.extend({
    tagName: 'li',
    className: 'movie',
    model: App.Model.Movie,

    events: {
        'click a': 'select',
    },

    initialize: function () {
        this.render();
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
    },

    render: function () {
        if (this.model.get('title').length > 19) {
          var title = this.model.get('title').substring(0, 13) + "...";
        } else {
          var title = this.model.get('title');
        }
        this.$el.append('<a href="javascript:;"><i class="fa fa-eye fa-3"></i><span class="health ' + this.model.get('health') + '"></span><img src="' + this.model.get('image') + '" alt="' + this.model.get('title') + '" /><strong>' + title + '</strong><small>' + this.model.get('year') + '</small></a>');
    }
});