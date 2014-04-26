// Subtitle Resizer, first implementation
// Define min and max range of pixels for subtitles (fail-safe)
var min=2;
var max=164;
function increaseFont() {
    var t = document.getElementsByClassName('vjs-subtitles vjs-text-track');
    for(i=0;i<t.length;i++) { 
        // Check if fontSize is set
        if(t[i].style.fontSize) {
            var s = parseInt(t[i].style.fontSize.replace("px",""));
        }
        // If no default fontsize, make it 14 pixels (fail-safe)
        else {
            var s = 14;
        }
        // If subtitle size does not go over max, add 2 pixels
        if (s!=max) {
            s += 2;
        }
        // Change the fontSize to the new value
        t[i].style.fontSize = s+"px"
    }           
}
function decreaseFont() {
    var t = document.getElementsByClassName('vjs-subtitles vjs-text-track');
    for(i=0;i<t.length;i++) {   
        // Check if fontSize is set                
        if(t[i].style.fontSize) {
            var s = parseInt(t[i].style.fontSize.replace("px",""));
        }
        // If no default fontsize, make it 14 pixels (fail-safe)
        else {
            var s = 14;
        }
        // If subtitle size does not go over min, subtract 2 pixels
        if (s!=min) {
            s -= 2;
        }
        // Change the fontSize to the new value
        t[i].style.fontSize = s+"px"       
    }           
}