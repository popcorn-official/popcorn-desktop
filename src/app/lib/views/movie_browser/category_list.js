(function(App) {
    "use strict";

    var CategoryList = Backbone.View.extend({
        template: _.template($('#category-list-tpl').text()),

        render: function() {
            this.$el.html(this.template({
                categories: this.model
            }));
        }
    });

    App.View.CategoryList = CategoryList;
})(window.App);