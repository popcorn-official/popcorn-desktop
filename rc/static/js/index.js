;(function(){

var socket = io.connect();

var $main = $('#main');

/*
var hammer = Hammer(document.getElementById('main'), {
  prevent_default: true
});

hammer.on("swipeleft", function() {
    alert('you swiped left!');
});
*/

socket.on('movie', function(movie){ 
  var $img = $('<img />').attr('src', movie.coverImage)
    .data(movie);

  $main.append($img);

  $img.on('click', $main, function(){
    showOverlay($img.data());
  });

});
//■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
var $overlay = $('#overlay');
var $info = $overlay.find('.info');

function showOverlay(movie) {
    $overlay.css({ 'background': ' rgba(0,0,0,.1) url('+movie.backdrop+') no-repeat center center fixed'});

    var info = '<h1>'+movie.title+'</h1>' +
      '<h3>' + movie.year + ' ● ' + movie.runtime + 'min</h3>' +
      '<p>' + movie.synopsis + '</p>' + 
      '<a href="#">WATCH NOW</a>';

    $('#main').css('overflow', 'hidden');
    $info.html(info)
    $overlay.show();

    $info.find('a').click(function(){
      socket.emit('play', movie);
    });
}

})();
