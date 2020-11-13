<div class="about-container">
    <div class="fa fa-times close-icon"></div>
    <div class="overlay-content"></div>
    <div class="margintop"></div>
    <img class="icon-title" src="/src/app/images/popcorn-time-logo.svg">
    <div class="content">

        <div class="title-version">
            <a data-toggle="tooltip" data-placement="top" title=<%= i18n.__("Changelog") %> id='changelog'><%= App.settings.version %> "<%= App.settings.releaseName %>" Beta </a>
            <% if(App.git) { %>
                - <small><i><%= App.git.branch %> (<a class="links" href="<%= Settings.commitUrl %>/<%= App.git.commit %>"><%= App.git.commit.slice(0,8) %></a>)</i></small>
            <% } %>
        </div>

        <div class="text-about">
            <div class="full-text">
                <%= i18n.__("%s is the result of many developers and designers putting a bunch of APIs together to make the experience of watching torrent movies as simple as possible.", Settings.projectName) %><br/>
                <%= i18n.__("We are an open source project. We are from all over the world. We love our movies. And boy, do we love popcorn.") %>
            </div>
        </div>

        <div class="title-issue">
            <a href="<%= Settings.issuesUrl %>" class="links">[ <%= i18n.__("Report an issue") %> ]</a>
        </div>

        <div class="icons_social">
            <a href="<%= Settings.projectUrl %>" data-toggle="tooltip" data-placement="top" title="<%= Settings.projectUrl %>" class='links site_icon'></a>
            <a href='<%= Settings.sourceUrl %>' data-toggle="tooltip" data-placement="top" title="<%= Settings.sourceUrl %>" class='links github_icon'></a>
            <a href='https://twitter.com/<%= Settings.projectTwitter %>' data-toggle="tooltip" data-placement="top" title="https://twitter.com/<%= Settings.projectTwitter %>" class='links twitter_icon'></a>
            <a href='<%= Settings.projectBlog %>' data-toggle="tooltip" data-placement="top" title="<%= Settings.projectBlog %>" class='links blog_icon'></a>
            <a href='<%= Settings.projectSubreddit %>' data-toggle="tooltip" data-placement="top" title="<%= Settings.projectSubreddit %>" class='links reddit_icon'></a>
            <a href='<%= Settings.projectForum2 %>' data-toggle="tooltip" data-placement="top" title="<%= Settings.projectForum2 %>" class='links forum_icon'></a>
        </div>

        <div class="last-line">
            <%= i18n.__("Made with") %> <span style="color:#e74c3c;">&#10084;</span> <%= i18n.__("by a bunch of geeks from All Around The World") %>
        </div>

    </div>
    <div class="changelog-overlay">
        <div class="title"><%=i18n.__("Changelog")%></div>
        <div class="changelog-text"></div>    
    </div>
</div>
