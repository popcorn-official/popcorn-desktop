(function (App) {
	'use strict';

	var About = Backbone.Marionette.ItemView.extend({
		template: '#about-tpl',
		className: 'about',

		ui: {
			success_alert: '.success_alert'
		},

		events: {
			'click .close-icon': 'closeAbout',
			'click .links': 'links'
		},

		onShow: function () {
			$('.filter-bar').hide();
			Mousetrap.bind(['esc', 'backspace'], function (e) {
				App.vent.trigger('about:close');
			});
			$('.links').tooltip();
			console.log('Show about', this.model);
			$('#movie-detail').hide();
		},

		onClose: function () {
			Mousetrap.unbind(['esc', 'backspace']);
			$('.filter-bar').show();
			$('#movie-detail').show();
		},

		closeAbout: function () {
			App.vent.trigger('about:close');
		},

		links: function (e) {
			e.preventDefault();
			gui.Shell.openExternal($(e.currentTarget).attr('href'));
		}

	});

	App.View.About = About;
})(window.App);
