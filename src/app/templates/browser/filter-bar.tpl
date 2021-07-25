<ul class="nav nav-hor left">
    <% _.each (App.Config.getTabTypes(), function (tab) { %>
    <li class="source <%= tab.type %>TabShow"><%= i18n.__(tab.name) %></li>
    <% }); %>
    <li id="filterbar-favorites" class="source"><%= i18n.__("Favorites") %></li>
</ul>
<ul id="nav-filters" class="nav nav-hor filters">
    <% filters = [
        {class: 'types', title: "Type", current: type, list: types},
        {class: 'ratings', title:  "Rating", current: rating, list: ratings},
        {class: 'genres', title:  "Genre", current: genre, list: genres},
        {class: 'sorters', title:  "Sort by", current: sorter, list: sorters},
    ] %>
    <% _.each (filters, function (filter) { if(typeof filter.current !== 'undefined' && filter.list.length !== 0){ %>
        <li class="dropdown filter <%= filter.class %>">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%= i18n.__(filter.title) %>
                <span class="value" data-value="<%= filter.current %>"></span>
                <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(filter.list, function(val, key) { %>
                <li><a href="#" data-value="<%= key %>"><%= val %></a></li>
                <% }); %>
            </ul>
        </li>
    <% }}); %>
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
