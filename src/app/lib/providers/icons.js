(function(App) {
    'use strict';

    class Icons {

        constructor() {
            const dir = data_path + '/icons';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            this.files = fs.readdirSync(dir);
        }

        async getLink(provider, name) {
            const file = '/icons/' + name + '.png';
            if (this.files.indexOf(name + '.png') === -1) {
                const res = await provider.getBin(0, 'icons/' + name + '.png');
                const data = await res.arrayBuffer();
                fs.writeFileSync(data_path + file, Buffer.from(data));
            }
            return 'file://' + data_path + file;
        }
    }

    Icons.prototype.config = {
        name: 'Icons'
    };

    App.Providers.Icons = new Icons();
    App.Providers.install(Icons);

})(window.App);
