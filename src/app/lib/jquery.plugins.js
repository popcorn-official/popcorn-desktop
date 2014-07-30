// jQuery plugi
(function( $ ){

	// Drag subtitles around player
    $.fn.drags = function() {
        var $el = this;
        return $el.css('cursor', 'move').on('mousedown', function(e) {
            var $drag = $(this).addClass('draggable'),
                z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX,
                max_y = win.height - 40;

            $drag.css('z-index', 1000).parents().on('mousemove', function(e) {
                if(e.pageX < 0 || e.pageX > win.width || e.pageY < 0 || e.pageY > win.height) {
                    $(this).off('mousemove');
                    $('.draggable').css('z-index', z_idx).removeClass('draggable');
                } else {
                    var fin_y = e.pageY + pos_y - drg_h;
                    if(fin_y > 60 && fin_y + $('.draggable').height() < max_y) {
                        $('.draggable').offset({top:fin_y});
                        //left:e.pageX + pos_x - drg_w
                    }
                }
            }).on('mouseup', function() {
                $(this).off('mousemove');
                $('.draggable').css('z-index', z_idx).removeClass('draggable');
            });
            e.preventDefault(); // disable selection
        });
    };
})( jQuery );