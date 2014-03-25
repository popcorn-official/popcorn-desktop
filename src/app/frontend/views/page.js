App.View.Page = Backbone.View.extend({
    className: 'page',

    initialize: function () {
        this.render();
    },

    render: function () {
        $('.'+this.className).remove();
        this.$el.appendTo('section.container');
        $('<ul class="movie-list"></ul>').appendTo(this.$el);
    },

    show: function () {
        // Fuck you UI.
        var $el = this.$el.hide(),
            $pages = $el.find('.page').addClass('notransition'),
            $movies = $el.find('.movie').removeClass('loaded');

        // ontransitionend could be buggy here.
        setTimeout(function () {
            $pages.removeClass('notransition').hide();

            $el.show();
        }, 350);

        // having a onDOMRendered could solve this shit.
        if ($el.is(App.Page.Home.$el)) {
            setTimeout(function () {
                $el.find('.movie').addClass('loaded');
            }, 400);
        }
    }
});