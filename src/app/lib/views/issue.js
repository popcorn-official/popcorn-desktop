(function (App) {
    'use strict';

    var BT_id = 13, //ID of project (got with gitlab.projects.all). 13 is for 'butterproject/butter'
        BT_url = Settings.issuesUrl, //Url of 'issues' of the above project
        token;

    var Issue = Marionette.View.extend({
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
            //'click .anonymous-issue': 'anonIssue',
            'click .login-issue': 'login'
        },

        onAttach: function () {
            if (AdvSettings.get('gitlabPassword') && AdvSettings.get('gitlabMail')) {
                $('#issue-email').val(AdvSettings.get('gitlabMail')),
                    $('#issue-pw').val(AdvSettings.get('gitlabPassword'));
            }

            $('#issue-content').on('keyup', function (e) {
                var userInput = document.getElementById('issue-content').value.replace(/(\w|\W)\1{3}/igm, '').length;
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
                url: Settings.sourceUrl,
                token: token || 'sb1SeWoyoAWrGPTuQcNE' //public reporter token
            });
            var issue_desc,
                result,
                results = [];

            gitlab.projects.issues.list(BT_id, {
                state: 'opened'
            }, function (data) {
                data = Common.sanitize(data);
                //stores in 'results' all issues (id + title) containing the keyword
                data.forEach(function (item) {
                    issue_desc =
                        item.description.toLowerCase() + ' ' + item.title.toLowerCase();

                    result = issue_desc.search(keyword.toLowerCase());
                    if (result !== -1) {
                        results.push({
                            id: item.iid,
                            title: item.title,
                            description: item.description,
                            labels: item.labels
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
                    $('#issue-search .button.notfound-issue').show();
                } else {
                    $('.search-issue').removeClass('fa-spinner fa-spin').addClass('fa-search');
                    var newLine = function (id, title, description, labels) {
                        $('#issue-results').append(
                            '<li>' + '<a class="issue-title">' + title + '</a>' + '<small>&nbsp;#' + id + '&nbsp;-&nbsp;' + labels + '</small>' + '<div class="issue-details">' + '<p>' + description + '</p>' + '<a class="links" href="' + BT_url + id + '">' + i18n.__('Open in your browser') + '</a>' + '</div>' + '</li>'
                        );
                    };
                    for (var i = 0; i < results.length; i++) {
                        results[i].description = require('markdown').markdown.toHTML(results[i].description).replace(/<a href/g, '<a class="links" href').replace(/<em>|<\/em>/g, '_');
                        results[i].labels = results[i].labels.length !== 0 ? results[i].labels.join(', ') : 'Uncategorized';
                        newLine(results[i].id, results[i].title, results[i].description, results[i].labels);
                    }
                    $('#issue-search .button').show();
                }

            });

        },

        showIssueDetails: function (e) {
            var elm = e.currentTarget.parentElement.children[2];
            var visible = $(elm).css('display');

            if (visible === 'none') {
                $(elm).show();
            } else {
                $(elm).hide();
            }
        },

        getLogs: function () {
            if (fs.existsSync(path.join(data_path, 'logs.txt'))) {
                return '\n\n---' + '\n\n**Error log:**' + '\n\n```' + fs.readFileSync(path.join(data_path, 'logs.txt'), 'utf-8') + '\n\n```';
            } else {
                return false;
            }
        },

        getSpecs: function () {
            var release = require('os-name')(os.platform(), os.release());

            var cpu = os.cpus();
            cpu = cpu[0].model;

            var ram = Math.round(os.totalmem() / (1000 * 1000 * 1000)) + 'GB';

            return '\n\n---' + '\n\n**Environment:**' + '\n\n' + Settings.projectName + ' version: ' + Settings.version + ' ' + App.git.commit.slice(0, 8) + '\n\nOS: ' + release + '\n\nCPU Model: ' + cpu + '\n\nAvailable Memory: ' + ram;

        },

        reportBug: function (title, content, token) {
            var that = this;
            if (this.isReporting) {
                return;
            }
            this.isReporting = true;

            var gitlab = require('gitlab')({
                url: Settings.projectUrl,
                token: token //Private token
            });
            var issue_id = false;

            content += this.getSpecs(); //add OS, version, etc.

            if (this.getLogs()) {
                content += this.getLogs(); //add error logs
            }

            gitlab.issues.create(
                BT_id, {
                    title: title,
                    description: content,
                    labels: 'In-App Reporter'
                },
                function (callback) {
                    callback = Common.sanitize(callback);
                    issue_id = BT_url + callback.iid;

                    win.debug('Issue created:', issue_id);

                    document.getElementById('issue-url').href = issue_id;
                    $('#issue-url').text(issue_id);

                    $('#issue-form').hide();
                    $('#issue-success').show();
                    that.isReporting = false;

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
                url: Settings.projectUrl,
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
            if (content.replace(/(\w|\W)\1{3}/igm, '').length < 200) {
                $('.notification_alert').show().text(i18n.__('200 characters minimum')).delay(2500).fadeOut(400);
                return;
            }

            this.reportBug(title, content, (token || 'sb1SeWoyoAWrGPTuQcNE'));
        },

        searchIssue: function () {
            var searchIssue = $('.search-issue');
            searchIssue.removeClass('fa-search').addClass('fa-spinner fa-spin');
            document.getElementById('issue-results').innerHTML = ''; //clear

            var keyword = $('#issue-search-field').val().replace(/\W/g, ' ').replace(/\s\s+/g, ' ');

            if (!keyword) {
                $('.notification_alert').show().text(i18n.__('Fields cannot be empty')).delay(2500).fadeOut(400);
                searchIssue.removeClass('fa-spinner fa-spin').addClass('fa-search');
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

        onBeforeDestroy: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        closeIssue: function () {
            App.vent.trigger('issue:close');
        }

    });

    App.View.Issue = Issue;

})(window.App);
