<ul class="nav nav-hor left">
    <% _.each (App.Config.getTabTypes(), function (tab) { %>
    <li class="source <%= tab.type %>TabShow"><%= i18n.__(tab.name) %></li>
    <% }); %>
    <li id="filterbar-favorites" class="source"><%= i18n.__("Favorites") %></li>
</ul>
<ul id="nav-filters" class="nav nav-hor filters">
    <% if(typeof type !== 'undefined' && types.length !== 0){ %>
        <li class="dropdown filter types">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%= i18n.__("Type") %>
                    <span class="value" data-value="<%= type %>"><%= i18n.__(type) %></span>
                    <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(types, function(c) { %>
                    <li><a href="#" data-value="<%= c %>"><%= i18n.__(c) %></a></li>
                <% }); %>
            </ul>
        </li>

    <% }if(typeof rating !== 'undefined' && ratings.length !== 0){ %>
        <li class="dropdown filter ratings">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%= i18n.__("Rating") %>
                    <span data-value="<%= rating %>" class="value"><%= i18n.__(rating.capitalizeEach()) %><% if (rating !== 'All') { %>+<% } %></span>
                    <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(ratings, function(rating) { %>
                    <li><a href="#" data-value="<%= rating %>"><%= i18n.__(rating.capitalizeEach()) %><% if (rating !== 'All') { %>+<% } %></a></li>
                <% }); %>
            </ul>
        </li>
    <% }if(typeof genre !== 'undefined' && genres.length !== 0){ %>
        <li class="dropdown filter genres">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%= i18n.__("Genre") %>
                    <span data-value="<%= genre %>" class="value"><%= i18n.__(genre.capitalizeEach()) %></span>
                    <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(genres, function(c) { %>
                    <li><a href="#" data-value="<%= c %>"><%= i18n.__(c.capitalizeEach()) %></a></li>
                <% }); %>
            </ul>
        </li>
    <%} if(typeof sorter !== 'undefined' && sorters.length !== 0){ %>
        <li class="dropdown filter sorters">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%= i18n.__("Sort by") %>
                    <span data-value="<%= sorter %>" class="value"><%= i18n.__(sorter.capitalizeEach()) %></span>
                    <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(sorters, function(c) { %>
                    <li><a href="#" data-value="<%= c %>"><%= i18n.__(c.capitalizeEach()) %></a></li>
                <% }); %>
            </ul>
        </li>
    <%}%>
</ul>
<ul class="nav nav-hor right">
    <% if (Settings.vpnEnabled) { %>
    <!-- VPN -->
    <li>
        <i id="filterbar-vpn" class="fa fa-unlock vpn-disconnected tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Connection Not Secured") %>"></i>
    </li>
    <%}%>

    <li>
        <div class="right search">
            <form>
                <input id="searchbox" type="text" placeholder="<%= i18n.__("Search") %>" autocomplete="off">
                <div class="clear fa fa-times"></div>
            </form>
        </div>
    </li>
    <!-- Watchlist -->
    <% if (Settings.activateWatchlist) { %>
    <li style="display:block">
    <% } else { %>
    <li style="display:none">
    <% } %>
        <i id="filterbar-watchlist" class="fa fa-inbox watchlist tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Watchlist") %>"></i>
    </li>

    <!-- Torrent Collection -->
    <% if (Settings.activateTorrentCollection) { %>
    <li id="torrent_col" style="display:block">
    <% } else { %>
    <li id="torrent_col" style="display:none">
    <% } %>
        <i id="filterbar-torrent-collection" class="fa fa-list-ul torrent-collection tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Torrent Collection") %>"></i>
    </li>

    <!-- Seedbox -->
    <% if (Settings.activateSeedbox) { %>
    <li style="display:block">
    <% } else { %>
    <li style="display:none">
    <% } %>
        <i id="filterbar-seedbox" class="fa fa-download about tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Seedbox") %>"></i>
    </li>

    <!-- Cache Folder -->
    <% if (Settings.activateTempf) { %>
    <li style="display:block">
    <% } else { %>
    <li style="display:none">
    <% } %>
        <i id="filterbar-tempf" class="fa fa-folder-open about tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Cache Folder") %>"></i>
    </li>

    <!-- About -->
    <li>
        <i id="filterbar-about" class="fa fa-info-circle about tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("About") %>"></i>
    </li>

    <!-- Settings -->
    <li>
        <i id="filterbar-settings" class="fa fa-cog settings tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Settings") %>"></i>
    </li>
</ul>
