<div class="torrent-collection-container">
    <div class="spinner">
        <div class="loading-container">
            <div class="ball"></div>
            <div class="ball1"></div>
        </div>
    </div>
    <div class="margintop"></div>
    <div class="content">

        <div class="onlinesearch">
            <div class="dropdown online-categories">
                    <%
                        var arr_categories = ["Movies","Series","Anime"];

                        var select_category = "";
                        for(var key in arr_categories) {
                            select_category += "<option "+(Settings.OnlineSearchCategory == arr_categories[key]? "selected='selected'":"")+" value='"+arr_categories[key]+"'>"+i18n.__(arr_categories[key])+"</option>";
                        }
                    %>
                <select name="online-category"><%=select_category%></select>
                <div class="dropdown-arrow"></div>
            </div>
            <form id="online-form">
                <input id="online-input" autocomplete="off" size="48" type="text" name="keyword" placeholder="<%= i18n.__('Search') %>">
                <i class="fa fa-search online-search tooltipped" data-placement="bottom" data-toggle="tooltip"></i>
                <i class="fa fa-caret-down togglesengines tooltipped" data-placement="bottom" data-toggle="tooltip" title="<%= i18n.__('Click providers to enable / disable') + '<br>' + i18n.__('Right-click to filter results by') + '<br>(&#x1F50D; ' + i18n.__('to filter by <i>All</i>') + ')' %>"></i>
                <div class="search_in">
                    <span>
                        <input class="sengine-checkbox" name="enableThepiratebaySearch" id="enableThepiratebaySearch" type="checkbox" <%=(Settings.enableThepiratebaySearch? "checked='checked'":"")%>>
                        <label id="enableThepiratebaySearchL" for="enableThepiratebaySearch" class="tooltipped" data-placement="bottom" data-toggle="tooltip"><img class="providerIcon" src="/src/app/images/icons/tpb.png"><%= i18n.__("thepiratebay.org") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enable1337xSearch" id="enable1337xSearch" type="checkbox" <%=(Settings.enable1337xSearch? "checked='checked'":"")%>>
                        <label id="enable1337xSearchL" for="enable1337xSearch" class="tooltipped" data-placement="bottom" data-toggle="tooltip"><img class="providerIcon" src="/src/app/images/icons/T1337x.png"><%= i18n.__("1337x.to") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enableSolidTorrentsSearch" id="enableSolidTorrentsSearch" type="checkbox" <%=(Settings.enableSolidTorrentsSearch? "checked='checked'":"")%>>
                        <label id="enableSolidTorrentsSearchL" for="enableSolidTorrentsSearch" class="tooltipped" data-placement="bottom" data-toggle="tooltip"><img class="providerIcon" src="/src/app/images/icons/solidtorrents.png"><%= i18n.__("solidtorrents.to") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enableTgxtorrentSearch" id="enableTgxtorrentSearch" type="checkbox" <%=(Settings.enableTgxtorrentSearch? "checked='checked'":"")%>>
                        <label id="enableTgxtorrentSearchL" for="enableTgxtorrentSearch" class="tooltipped" data-placement="bottom" data-toggle="tooltip"><img class="providerIcon" src="/src/app/images/icons/TorrentGalaxy.png"><%= i18n.__("torrentgalaxy.to") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enableNyaaSearch" id="enableNyaaSearch" type="checkbox" <%=(Settings.enableNyaaSearch? "checked='checked'":"")%>>
                        <label id="enableNyaaSearchL" for="enableNyaaSearch" class="tooltipped" data-placement="bottom" data-toggle="tooltip"><img class="providerIcon" src="/src/app/images/icons/nyaa.png"><%= i18n.__("nyaa.si") %></label>
                    </span>
                </div>
            </form>
            <div class="collection-actions">
                <div class="collection-paste fa fa-paste tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Paste a Magnet link") %>"></div>
                <div class="collection-import fa fa-file tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Import a Torrent file") %>"></div>
                <input class="collection-import-hidden" type="file" accept=".torrent"/>
            </div>
        </div>

        <div class="notorrents-info">
            <div class="notorrents-frame">
                <p class="notorrents-message"><%= i18n.__("Search for something or drop a .torrent / magnet link...")%></p>
            </div>
        </div>

        <div class="torrents-info">
            <i class="collection-open fa fa-bookmark tooltipped" id="savedtorrentslabel" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Open Collection Directory") %>"></i>
            <i id="savedtorrentslabeltext"><%=i18n.__("Saved Torrents") %></i>
            <ul class="file-list">
                <% _.each(fs.readdirSync(App.settings['databaseLocation'] + '/TorrentCollection/'), function(file, index) { %>
                    <li class="file-item" data-index="<%=file.index%>" data-file="<%=index%>" data-source="<%=index%>">
                        <a><%=file%></a>

                   <% if (file.indexOf('.torrent') !== -1) { %>
                        <div class="item-icon torrent-icon"></div>
                   <% } else { %>
                        <div class="item-icon magnet-icon tooltipped" data-toggle="tooltip" data-placement="left" title="<%=i18n.__("Magnet link") %>"></div>
                    <% } %>
                        <i class="fa fa-trash item-delete tooltipped" data-toggle="tooltip" data-placement="top" title="<%= i18n.__("Remove") %>"></i>
                        <i class="fa fa-pencil-alt item-rename tooltipped" data-toggle="tooltip" data-placement="top" title="<%= i18n.__("Rename") %>"></i>
                        </a>
                    </li>
                <% }); %>
            </ul>
        </div>

        <div class="onlinesearch-info">
            <i class="fa fa-search" id="searchresultslabel"></i>
            <i id="searchresultslabeltext"><%=i18n.__("Search Results") %></i>
            <i class="fa fa-times online-back"></i>
            <ul class="file-list">
            </ul>
        </div>
    </div>
</div>
