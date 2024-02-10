(function (App) {
    'use strict';

    function Updater(options) {
        if (!(this instanceof Updater)) {
            return new Updater(options);
        }
    }

    Updater.onlyNotification = async function (e) {
        const initBtn = e === 'about' ? $('.update-app i') : $('.update-app');
        if (e) {
            initBtn.removeClass('fa-rotate valid-tick invalid-cross').addClass('fa-spin fa-spinner');
        }
        const currentVer = parseInt(nw.global.manifest.version ? nw.global.manifest.version.replace(/[^0-9]+/g, '') : App.settings.version.replace(/[^0-9]+/g, '')),
            response = await fetch(Settings.sourceUrl.replace('github.com', 'api.github.com/repos') + 'releases/latest').catch((error) => {}),
            data = response ? await response.json().catch((error) => {}) : null,
            latestVer = data && data.tag_name ? parseInt(data.tag_name.replace(/[^0-9]+/g, '')) : null;
        if (!latestVer) {
            if (e) {
                App.vent.trigger('notification:show', new App.Model.Notification({
                    title: i18n.__('Error'),
                    body: i18n.__('Failed to check for new version'),
                    autoclose: true,
                    showClose: false,
                    type: 'error'
                }));
                initBtn.removeClass('fa-spin fa-spinner').addClass('invalid-cross');
                setTimeout(function() { initBtn.removeClass('invalid-cross').addClass('fa-rotate');}, 6000);
            }
            return;
        }
        if (e) {
            initBtn.removeClass('fa-spin fa-spinner').addClass('valid-tick');
            setTimeout(function() { initBtn.removeClass('valid-tick').addClass('fa-rotate');}, 6000);
        }
        if (latestVer > currentVer) {
            let downloadUpdate = function () {
                App.vent.trigger('notification:close');
                nw.Shell.openExternal(Settings.projectUrl);
                win.close();
            };
            let dontUpdate = function () {
                App.vent.trigger('notification:close');
            };
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('New version available !'),
                body: '<p style="margin:4px 0">' + i18n.__('Exit %s and download now ?', Settings.projectName) + '</p>',
                showClose: false,
                type: 'success',
                buttons: [{ title: '<label class="export-database" for="exportdatabase">&nbsp;' + i18n.__('Yes') + '&nbsp;</label>', action: downloadUpdate }, { title: '<label class="export-database" for="exportdatabase">&nbsp;' + i18n.__('No') + '&nbsp;</label>', action: dontUpdate }]
            }));
        } else if (e) {
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('Success'),
                body: i18n.__('Already using the latest version'),
                autoclose: true,
                showClose: false,
                type: 'success'
            }));
        }
    };

    App.Updater = Updater;

})(window.App);
