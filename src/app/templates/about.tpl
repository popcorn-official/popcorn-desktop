<div class="about-container">
    <div class="fa fa-times close-icon"></div>
    <div class="overlay-content"></div>
    <div class="margintop"></div>
    <img class="icon-title" src="/src/app/images/popcorn-time-logo.svg">
    <div class="content">

        <div class="title-version">
            <a data-toggle="tooltip" data-placement="top" title=<%= i18n.__("Changelog") %> id='changelog'><%= App.settings.version %> "<%= App.settings.releaseName %>" Beta </a>
            <% if(App.git) { %>
                - <small><i><%= App.git.branch %> (<a class="links" href="https://git.popcorntime.io/popcorntime/desktop/commit/<%= App.git.commit %>"><%= App.git.commit.slice(0,8) %></a>)</i></small>
            <% } %>
        </div>

        <div class="title-issue">
            <a><%= i18n.__("Report an issue") %></a>
        </div>

        <div class="text-about">
            <div class="full-text">
                <%= i18n.__("Popcorn Time! is the result of many developers and designers putting a bunch of APIs together to make the experience of watching torrent movies as simple as possible.") %><br/>
                <%= i18n.__("We are an open source project. We are from all over the world. We love our movies. And boy, do we love popcorn.") %>
            </div>
        </div>

        <div class="icons_social">
            <a href='http://popcorntime.io' data-toggle="tooltip" data-placement="top" title="popcorntime.io" class='links site_icon'></span></a>
            <a href='http://twitter.com/PopcornTimeTV' data-toggle="tooltip" data-placement="top" title="twitter.com/PopcornTimeTV" class='links twitter_icon'></span></a>
            <a href='http://www.fb.com/PopcornTimeTV' data-toggle="tooltip" data-placement="top" title="fb.com/PopcornTimeTV" class='links facebook_icon'></span></a>
            <a href='http://plus.google.com/+PopcorntimeIo/posts' data-toggle="tooltip" data-placement="top" title="plus.google.com/+PopcorntimeIo" class='links google_icon'></span></a>
            <a href='http://git.popcorntime.io'data-toggle="tooltip" data-placement="top" title="git.popcorntime.io" class='links gitlab_icon'></span></a>
            <a href='http://blog.popcorntime.io' data-toggle="tooltip" data-placement="top" title="blog.popcorntime.io" class='links blog_icon'></span></a>
            <a href='http://discuss.popcorntime.io' data-toggle="tooltip" data-placement="top" title="discuss.popcorntime.io" class='links forum_icon'></span></a>
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