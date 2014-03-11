// jQuery plugin
// Drag the app window by a specific element

// Since the -drag CSS property fucks up the touch events, this is a hack so we can drag the window by the video anyway.
(function( $ ){

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
            window.moveBy(distance.x, distance.y);
          }
        });

    });
  };

})( jQuery );