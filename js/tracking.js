// Tracking
var getTrackingId = function(){
    // Disable tracking TODO: Remove all tracking code
    return null;
    var clientId = Settings.get('trackingId');

    if( typeof clientId == 'undefined' || clientId == null || clientId == '' ) {

        // A UUID v4 (random) is the recommended format for Google Analytics
        var uuid = require('node-uuid');

        Settings.set('trackingId', uuid.v4() );
        clientId = Settings.get('trackingId');

        // Try a time-based UUID (v1) if the proper one fails
        if( typeof clientId == 'undefined' || clientId == null || clientId == '' ) {
            Settings.set('trackingId', uuid.v1() );
            clientId = Settings.get('trackingId');

            if( typeof clientId == 'undefined' || clientId == null || clientId == '' ) {
                clientId = null;
            }
        }
    }

    return clientId;
};

if( getTrackingId() == null ) {
    // Don't report anything if we don't have a trackingId
    var dummyMethod = function(){ return {send:function(){}}; };
    var userTracking = window.userTracking = {event:dummyMethod, pageview:dummyMethod, timing:dummyMethod, exception:dummyMethod, transaction:dummyMethod};
}
else {
    var userTracking = window.userTracking = ua('UA-48789649-1', getTrackingId());
}


// Check if the user has a working internet connection (uses Google as reference)
var checkInternetConnection = function(callback) {
  var http = require('http');
  var hasInternetConnection = false;

  var opts = url.parse(Settings.get('connectionCheckUrl'));
  opts.method = 'HEAD';
  http.get(opts, function(res){
    if( res.statusCode == 200 || res.statusCode == 302 || res.statusCode == 301 ) {
      hasInternetConnection = true;
    }
    typeof callback == 'function' ? callback(hasInternetConnection) : null;
  });
};


// Detect the operating system of the user
var getOperatingSystem = function() {
  var os = require('os');
  var platform = os.platform();

  if( platform == 'win32' || platform == 'win64' ) {
    return 'windows';
  }
  if( platform == 'darwin' ) {
    return 'mac';
  }
  if( platform == 'linux' ) {
    return 'linux';
  }
  return null;
};


// Report Installs and Upgrades
if( typeof __isNewInstall != 'undefined' && __isNewInstall == true )  {
  userTracking.event('App Install', getOperatingSystem().capitalize(), Settings.get('version')).send();
}
else if( typeof __isUpgradeInstall != 'undefined' && __isUpgradeInstall == true )  {
  userTracking.event('App Upgrade', getOperatingSystem().capitalize(), Settings.get('version')).send();
}


// Todo: Remove Upgrade in the next version to prevent double counting of device stats (we'd send stats once per version)
if( (typeof __isNewInstall != 'undefined' && __isNewInstall == true) ||
    (typeof __isUpgradeInstall != 'undefined' && __isUpgradeInstall == true) )  {

  // General Device Stats
  userTracking.event('Device Stats', 'Version', Settings.get('version') + (isDebug ? '-debug' : '') ).send();
  userTracking.event('Device Stats', 'Type', getOperatingSystem().capitalize()).send();
  userTracking.event('Device Stats', 'Operating System', os.type() +' '+ os.release()).send();
  userTracking.event('Device Stats', 'CPU', os.cpus()[0].model +' @ '+ (os.cpus()[0].speed/1000).toFixed(1) +'GHz' +' x '+ os.cpus().length ).send();
  userTracking.event('Device Stats', 'RAM', Math.round(os.totalmem() / 1024 / 1024 / 1024)+'GB' ).send();
  userTracking.event('Device Stats', 'Uptime', Math.round(os.uptime() / 60 / 60)+'hs' ).send();

  // Screen resolution, depth and pixel ratio (retina displays)
  if( typeof screen.width == 'number' && typeof screen.height == 'number' ) {
    var resolution = (screen.width).toString() +'x'+ (screen.height.toString());
    if( typeof screen.pixelDepth == 'number' ) {
      resolution += '@'+ (screen.pixelDepth).toString();
    }
    if( typeof window.devicePixelRatio == 'number' ) {
      resolution += '#'+ (window.devicePixelRatio).toString();
    }
    userTracking.event('Device Stats', 'Resolution', resolution).send();
  }

  // User Language
  userTracking.event('Device Stats', 'Language', navigator.language.toLowerCase() ).send();
}
