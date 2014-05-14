// jQuery plugin
// Drag the app window by a specific element

// Since the -drag CSS property screws up the touch events, this is a hack so we can drag the window by the video anyway.
(function( $ ){

  // Require native api to drag window accross mutliple monitors
  var nativeWindow = require('nw.gui').Window.get();

  $.fn.canDragWindow = function() {

    return this.each(function(ix, element){

      var mouseIsDown = false;
      var previousPos = {};

      // TODO: This breaks under multiple screens on Windows (it won't go outside the screen it's on)
      $(element).mousedown(function(event){
        // Only move with the left mouse button
        if( event.button != 0 ){ return; }
        mouseIsDown = true;
        previousPos = {x: event.screenX, y: event.screenY};
      }).mouseup(function(event){
          mouseIsDown = false;
        }).mousemove(function(event){

          var thisPos = {x: event.screenX, y: event.screenY};
          var distance = {x: thisPos.x - previousPos.x, y: thisPos.y - previousPos.y};
          previousPos = thisPos;

          if( mouseIsDown && ! win.isFullscreen ){
            nativeWindow.moveBy(distance.x, distance.y);
          }
        });

    });
  };
  
	$.fn.drags = function(opt) {

		opt = $.extend({handle:"",cursor:"move"}, opt);

		if(opt.handle === "") {
			var $el = this;
		} else {
			var $el = this.find(opt.handle);
		}

		return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
			if(opt.handle === "") {
				var $drag = $(this).addClass('draggable');
			} else {
				var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
			}
			var z_idx = $drag.css('z-index'),
			drg_h = $drag.outerHeight(),
			drg_w = $drag.outerWidth(),
			pos_y = $drag.offset().top + drg_h - e.pageY,
			pos_x = $drag.offset().left + drg_w - e.pageX;
			$drag.css('z-index', 1000).parents().on("mousemove", function(e) {
				$('.draggable').offset({
					top:e.pageY + pos_y - drg_h,
					left:e.pageX + pos_x - drg_w
				}).on("mouseup", function() {
					$(this).removeClass('draggable').css('z-index', z_idx);
				});
			});
			e.preventDefault(); // disable selection
		}).on("mouseup", function() {
			if(opt.handle === "") {
				$(this).removeClass('draggable');
			} else {
				$(this).removeClass('active-handle').parent().removeClass('draggable');
			}
		});

	};

})( jQuery );
