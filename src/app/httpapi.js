(function(App) {
    'use strict';
    var jayson = require('jayson');
    var auth = require('http-auth');
    var http = require('http');
    var httpServer;

    var HttpApi = function() {
        var server = jayson.server({
            setvolume: function(volume, callback, req){
                win.log(req);
                var volume = parseFloat(volume) || App.Player.volume();
                App.Player.volume(volume);
                callback();
            },
            toggleplaying: function(callback){
                if(App.Player.paused()){
                    App.Player.play();
                }
                else{
                    App.Player.pause();
                }
                callback();
            },
            togglemute: function(callback){
                this.player.muted(!this.player.muted());
                callback();
            },
            seek: function(value, callback){
                App.Player.currentTime(App.Player.currentTime() + parseFloat(value));
                callback();
            },
            up: function(callback){
                Mousetrap.trigger('up');
                callback();
            },
            down: function(callback){
                Mousetrap.trigger('down');
                callback();
            },
            left: function(callback){
                Mousetrap.trigger('left');
                callback();
            },
            right: function(callback){
                Mousetrap.trigger('right');
                callback();
            },
            enter: function(callback){
                Mousetrap.trigger('enter');
                callback();
            }
        });

        var basic = auth.basic({
                realm: 'JSONRPC'
            }, function (username, password, callback) { // Custom authentication method.
                callback(username === 'FREEZXX' && password === 'FREEZX');
            }
        );

        var httpServer = http.createServer(basic);
        var jaysonHttpServer = server.http(httpServer);

        jaysonHttpServer.listen(Settings.httpApiPort, function(){
            win.log('Listening for commands on '+Settings.httpApiPort);
        });

        // server
        //     .use(restify.fullResponse())
        //     .use(restify.bodyParser());

        // server.post('/', function (req, res, next) {
        //     var action = req.params.action;

        //     if(req.params.password !== Settings.httpApiPassword){
        //         res.send(401, "PASSWORD INCORRECT");
        //         return;
        //     }

        //     //Player commands
        //     if(typeof App.Player !== 'undefined'){
        //         switch(action) {
        //             case 'setvolume':
        //                 App.Player.volume(parseFloat(req.params.data));
        //                 break;
        //             case 'toggleplaying':
        //                 if(App.Player.paused()){
        //                     App.Player.play();
        //                 }
        //                 else{
        //                     App.Player.pause();
        //                 }
        //                 break;
        //             case 'togglemute':
        //                 this.player.muted(!this.player.muted());
        //                 break;
        //             case 'seek':
        //                 App.Player.currentTime(App.Player.currentTime() + parseFloat(req.params.data));
        //                 break;
        //             default:
        //                 res.send(400, "INCORRECT ACTION"); 
        //                 return;
        //                 break;
        //         }
        //     }
        //     res.send(200, "OK"); 
        // });

        // server.listen(Settings.httpApiPort);
    };  
    HttpApi.prototype.constructor = HttpApi;

    App.HttpApi = new HttpApi();
    
})(window.App);