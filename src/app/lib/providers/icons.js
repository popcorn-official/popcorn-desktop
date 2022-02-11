(function(App) {
    'use strict';


    class Icons {

        constructor() {
            if (!fs.existsSync(data_path + '/icons')) {
                fs.mkdirSync(data_path + '/icons');
            }
            this.files = fs.readdirSync(data_path + '/icons');

            console.log(this.files);
        }

        async getLink(provider, name) {
            if (this.files.indexOf(name + '.png') === -1) {
                const res = await provider.getBin(0, '/icons/' + name + '.png');
                const data = await res.arrayBuffer();
                fs.writeFileSync(data_path + '/icons/' + name + '.png', Buffer.from(data));
            }
            return 'file://' + data_path + '/icons/' + name + '.png';
        }
    }

    Icons.prototype.config = {
        name: 'Icons'
    };


    App.Providers.Icons = new Icons();
    App.Providers.install(Icons);

})(window.App);
