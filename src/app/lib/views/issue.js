(function (App) {
    'use strict';

    var PT_id = 13, //ID of project (got with gitlab.projects.all). 13 is for 'popcorntime/desktop'
        PT_url = 'https://git.popcorntime.io/popcorntime/desktop/issues/', //Url of 'issues' of the above project
        token;

    var Issue = Backbone.Marionette.ItemView.extend({
        template: '#issue-tpl',
        className: 'issue',

        ui: {
            success_alert: '.success_alert'
        },

        events: {
            'click .close-icon': 'closeIssue',
            'click .submit-issue': 'submitIssue',
            'click .search-issue': 'searchIssue',
            'click .issue-title': 'showIssueDetails',
            'click .found-issue': 'closeIssue',
            'click .notfound-issue': 'newIssue',
            'click .anonymous-issue': 'anonIssue',
            'click .login-issue': 'login'
        },

        onShow: function () {
            if (AdvSettings.get('gitlabPassword') && AdvSettings.get('gitlabMail')) {
                $('#issue-email').val(AdvSettings.get('gitlabMail')),
                    $('#issue-pw').val(AdvSettings.get('gitlabPassword'));
            }

            $('#issue-content').on('keyup', function (e) {
                var userInput = document.getElementById('issue-content').value.length;
                if (userInput > 200) {
                    $('#issue-length').hide();
                } else {
                    $('#issue-length').show().text('(' + userInput + '/200)');
                }
            });

            Mousetrap.bind(['esc', 'backspace'], function (e) {
                App.vent.trigger('issue:close');
            });
            Mousetrap(document.getElementById('issue-pw')).bind(['enter'], function (e, combo) {
                $('.login-issue').click();
            });
            Mousetrap(document.getElementById('issue-email')).bind(['enter'], function (e, combo) {
                $('.login-issue').click();
            });
            Mousetrap(document.getElementById('issue-search-field')).bind(['enter'], function (e, combo) {
                $('.search-issue').click();
            });
        },

        searchGitLab: function (keyword) {

            var gitlab = require('gitlab')({
                url: 'https://git.popcorntime.io/',
                token: 'sb1SeWoyoAWrGPTuQcNE' //public reporter token
            });
            var issue_desc,
                result,
                results = [];

            gitlab.projects.issues.list(PT_id, function (data) {

                //stores in 'results' all issues (id + title) containing the keyword
                data.forEach(function (item) {
                    if (item.state === 'closed') {
                        return;
                    }
                    issue_desc =
                        item.description.toLowerCase() + ' ' + item.title.toLowerCase();

                    result = issue_desc.search(keyword.toLowerCase());
                    if (result !== -1) {
                        results.push({
                            id: item.iid,
                            title: item.title,
                            description: item.description
                        });
                        return;
                    } else {
                        return;
                    }
                });

                //interpret results
                if (results.length === 0) {
                    $('.search-issue').removeClass('fa-spinner fa-spin').addClass('fa-search');
                    $('#issue-results').append('<p>' + i18n.__('No issues found...') + '</p>');
                } else {
                    $('.search-issue').removeClass('fa-spinner fa-spin').addClass('fa-search');
                    var newLine = function (id, title, description) {
                        $('#issue-results').append(
                            '<li>' + '<a class="issue-title">' + title + '</a>' + '<div class="issue-details">' + '<p>' + description + '</p>' + '<a class="links" href="' + PT_url + id + '">' + i18n.__('Open in your browser') + '</a>' + '</div>' + '</li>'
                        );
                    };
                    for (var i = 0; i < results.length; i++) {
                        results[i].description = results[i].description.replace('\n', '<br>');
                        newLine(results[i].id, results[i].title, results[i].description);
                    }
                }

            });

        },

        showIssueDetails: function (e) {
            var elm = e.currentTarget.parentElement.children[1];
            var visible = $(elm).css('display');

            if (visible === 'none') {
                $(elm).show();
            } else {
                $(elm).hide();
            }
        },

        getLogs: function () {
            if (fs.existsSync(path.join(require('nw.gui').App.dataPath, 'logs.txt'))) {
                return '\n\n---' + '\n\n**Error log:**' + '\n\n```' + fs.readFileSync(path.join(require('nw.gui').App.dataPath, 'logs.txt'), 'utf-8') + '\n\n```';
            } else {
                return false;
            }
        },

        getSpecs: function () {
            var release = require('os-name')(os.platform(), os.release());

            var cpu = os.cpus();
            cpu = cpu[0].model;

            var ram = Math.round(os.totalmem() / (1000 * 1000 * 1000)) + 'GB';

            return '\n\n---' + '\n\n**Environment:**' + '\n\nPopcorn Time version: ' + Settings.version + ' ' + App.git.commit.slice(0, 8) + '\n\nOS: ' + release + '\n\nCPU Model: ' + cpu + '\n\nAvailable Memory: ' + ram;

        },

        reportBug: function (title, content, token) {

            var gitlab = require('gitlab')({
                url: 'https://git.popcorntime.io/',
                token: token //Private token
            });
            var issue_id = false;

            content += this.getSpecs(); //add OS, version, etc.

            if (this.getLogs()) {
                content += this.getLogs(); //add error logs
            }

            gitlab.issues.create(
                PT_id, {
                    title: title,
                    description: content,
                    labels: 'In-App Reporter'
                },
                function (callback) {

                    issue_id = PT_url + callback.iid;

                    win.debug('Issue created:', issue_id);

                    document.getElementById('issue-url').href = issue_id;
                    $('#issue-url').text(issue_id);

                    $('#issue-form').hide();
                    $('#issue-success').show();

                }
            );
        },

        login: function () {
            var that = this;
            $('#issue-auth .issue-loading-icon').show();
            this.getToken(function (data) {
                if (data) {
                    token = data;
                    win.debug('GitLab API: auth success');
                    AdvSettings.set('gitlabMail', $('#issue-email').val());
                    AdvSettings.set('gitlabPassword', $('#issue-pw').val());
                    $('#issue-auth .issue-loading-icon').hide();
                    that.anonIssue();
                } else {
                    $('#issue-auth .issue-loading-icon').hide();
                    $('.notification_alert').show().text(i18n.__('Invalid credentials')).delay(2500).fadeOut(400);
                }
            });
        },

        getToken: function (callback) {
            var email = $('#issue-email').val(),
                password = $('#issue-pw').val();

            var gitlab = require('gitlab')({
                url: 'https://git.popcorntime.io/',
                token: 'sb1SeWoyoAWrGPTuQcNE' //public reporter token
            });

            gitlab.users.session(email, password, function (response) {
                callback(response.private_token);
            });
        },

        submitIssue: function () {
            var title = $('#issue-title').val();
            var content = $('#issue-content').val();

            if (!title || !content) {
                $('.notification_alert').show().text(i18n.__('Fields cannot be empty')).delay(2500).fadeOut(400);
                return;
            }
            if (content.length < 200) {
                $('.notification_alert').show().text(i18n.__('200 characters minimum')).delay(2500).fadeOut(400);
                return;
            }

            if (token) {
                this.reportBug(title, content, token);
            } else {
                this.reportBug(title, content, 'sb1SeWoyoAWrGPTuQcNE');
            }
        },

        searchIssue: function () {
            $('.search-issue').removeClass('fa-search').addClass('fa-spinner fa-spin');
            document.getElementById('issue-results').innerHTML = ''; //clear

            var keyword = $('#issue-search-field').val();

            if (!keyword) {
                $('.notification_alert').show().text(i18n.__('Fields cannot be empty')).delay(2500).fadeOut(400);
                $('.search-issue').removeClass('fa-spinner fa-spin').addClass('fa-search');
                return;
            }
            this.searchGitLab(keyword);
        },

        newIssue: function () {
            $('#issue-search').hide();
            $('#issue-form').show();
        },

        anonIssue: function () {
            $('#issue-auth').hide();
            $('#issue-search').show();
        },

        onDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        closeIssue: function () {
            App.vent.trigger('issue:close');
        }

    });

    App.View.Issue = Issue;

})(window.App);
