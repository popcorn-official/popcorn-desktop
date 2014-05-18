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
  
	$.fn.drags = function() {
		var $el = this;
		return $el.css('cursor', 'move').on("mousedown", function(e) {
			var $drag = $(this).addClass('draggable'),
			z_idx = $drag.css('z-index'),
			drg_h = $drag.outerHeight(),
			drg_w = $drag.outerWidth(),
			pos_y = $drag.offset().top + drg_h - e.pageY,
			pos_x = $drag.offset().left + drg_w - e.pageX,
			max_y = win.height - 50;
			$drag.css('z-index', 1000).parents().on("mousemove", function(e) {
				if(e.pageX < 0 || e.pageX > win.width || e.pageY < 0 || e.pageY > win.height){
					$(this).off('mousemove');
					$('.draggable').css('z-index', z_idx).removeClass('draggable');
				}else{
					fin_y = e.pageY + pos_y - drg_h;
					if(fin_y > 60 && fin_y + $('.draggable').height() < max_y){
						$('.draggable').offset({top:fin_y});
						//left:e.pageX + pos_x - drg_w
					}
				}
			}).on("mouseup", function() {
				$(this).off('mousemove');
				$('.draggable').css('z-index', z_idx).removeClass('draggable');
			});
			e.preventDefault(); // disable selection
		});

	};

})( jQuery );
