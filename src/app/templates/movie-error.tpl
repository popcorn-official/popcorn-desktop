<div id="movie-error">
    <h2 class="error"><%= error %></h2>
    <div class="button retry-button">
        <div class="button-text"><i class="fa fa-sync">&nbsp;&nbsp;</i><%= i18n.__("Retry") %></div>
    </div>
    <div class="button change-api">
        <div class="button-text"><i class="fa fa-server">&nbsp;&nbsp;</i><%= i18n.__("Change API Server") %></div>
    </div>
    <div class="button online-search">
        <div class="button-text"><i class="fa fa-search">&nbsp;&nbsp;</i><%= i18n.__("Search on %s", "Torrent Collection") %></div>
    </div>
    <div class="button update-dht-btn">
        <div class="button-text"><i class="update-dht fa fa-rotate">&nbsp;&nbsp;</i><%= i18n.__("Update servers") %></div>
    </div>
    <div class="server-fail">
        <p><%= i18n.__("First try to update servers, if this does not help, then look for a solution on site and forum") %></p>
        <p>&nbsp;</p>
        <p><%= i18n.__("Addresses may change, please press update servers and restart after update, before click links") %></p>
        <div class="icons_social">
            <% if (Settings.projectUrl) { %><a href="<%= encodeURI(Settings.projectUrl) %>" data-toggle="tooltip" data-placement="top" title="<%= encodeURI(Settings.projectUrl.split('://')[1].replace(/\/+$/, '')) %>" class="links site_icon"></a><% } %>
            <% if (Settings.projectForum) { %><a href="<%= encodeURI(Settings.projectForum) %>" data-toggle="tooltip" data-placement="top" title="<%= encodeURI(Settings.projectForum.split('://')[1].replace(/\/+$/, '')) %>" class="links reddit_icon"></a><% } %>
        </div>
    </div>
</div>
