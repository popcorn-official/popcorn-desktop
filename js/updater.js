
// Check if there's a newer version and shows a prompt if that's the case
var checkForUpdates = function() {
    var http = require('http');

    var currentOs = getOperatingSystem();
    // We may want to change this in case the detection fails
    if( ! currentOs ){ return; }

    http.get(Settings.get('updateNotificationUrl'), function(res){
        var data = '';
        res.on('data', function(chunk){ data += chunk; });

        res.on('end', function(){
            try {
                var updateInfo = JSON.parse(data);
            } catch(e){ return; }

            if( ! updateInfo ){ return; }

            if( updateInfo[currentOs].version > Settings.get('version') ) {
                // Check if there's a newer version and show the update notification
                $('#notification').html(
                    i18n.__('UpgradeVersionDescription', updateInfo[currentOs].versionName) +
                    '<a class="btn" href="#" onclick="gui.Shell.openExternal(\'' + updateInfo[currentOs].downloadUrl + '\');"> '+ i18n.__('UpgradeVersion') + '</a>'
                );
                $('body').addClass('has-notification');
            }
        });

    })
};

checkForUpdates();
