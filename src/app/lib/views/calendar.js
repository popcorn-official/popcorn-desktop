(function (App) {
    'use strict';

    var Calendar = Backbone.Marionette.ItemView.extend({
        template: '#calendar-tpl',
        className: 'calendar',
        events: {
            'click .close-icon': 'closeCalendar'
        },

        onShow: function() {
            Mousetrap.bind(['esc', 'backspace'], function(e) {
                App.vent.trigger('calendar:close');
            });
            $('#movie-detail').hide();
			$(window).resize( function () {
				if (win.width < 992) {
					$('iframe').css('width', '460px');
				} else {
					$('iframe').css('width', '100%');
				}
			});
			
			$(window).resize();
        },

        onDestroy: function() {
			$('#filterbar-calendar').removeClass('active');
            Mousetrap.unbind(['esc', 'backspace']);
            $('#movie-detail').show();
        },

        closeCalendar: function() {
            App.vent.trigger('calendar:close');
        }
    });

    App.View.Calendar = Calendar;

})(window.App);