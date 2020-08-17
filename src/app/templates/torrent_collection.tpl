<div class="torrent-collection-container">
    <div class="margintop"></div>
    <div class="content">

        <div class="onlinesearch">
            <div class="dropdown online-categories">
                    <%
                        var arr_categories = ["Movies","TV Series","Anime"];

                        var select_category = "";
                        for(var key in arr_categories) {
                            select_category += "<option "+(Settings.OnlineSearchCategory == arr_categories[key]? "selected='selected'":"")+" value='"+arr_categories[key]+"'>"+i18n.__(arr_categories[key])+"</option>";
                        }
                    %>
                <select name="online-category"><%=select_category%></select>
                <div class="dropdown-arrow"></div>
            </div>
            <form id="online-form">
                <input id="online-input" autocomplete="off" size="34" type="text" name="keyword" placeholder="<%= i18n.__('Search for torrent') %>">
                <i class="fa fa-search online-search tooltipped" data-placement="bottom" data-toogle="tooltip"></i>
                <i class="fa fa-caret-down togglesengines"></i>
                <div class="search_in">
                    <span>
                        <input class="sengine-checkbox" name="enableThepiratebaySearch" id="enableThepiratebaySearch" type="checkbox" <%=(Settings.enableThepiratebaySearch? "checked='checked'":"")%>>
                        <label id="enableThepiratebaySearchL" for="enableThepiratebaySearch" class="tooltipped" data-placement="bottom" data-toogle="tooltip"><%= i18n.__("ThePirateBay") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enable1337xSearch" id="enable1337xSearch" type="checkbox" <%=(Settings.enable1337xSearch? "checked='checked'":"")%>>
                        <label id="enable1337xSearchL" for="enable1337xSearch" class="tooltipped" data-placement="bottom" data-toogle="tooltip"><%= i18n.__("1337x") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enableRarbgSearch" id="enableRarbgSearch" type="checkbox" <%=(Settings.enableRarbgSearch? "checked='checked'":"")%>>
                        <label id="enableRarbgSearchL" for="enableRarbgSearch" class="tooltipped" data-placement="bottom" data-toogle="tooltip"><%= i18n.__("RARBG") %></label>
                    </span>
                    <span>
                        <input class="sengine-checkbox" name="enableOmgtorrentSearch" id="enableOmgtorrentSearch" type="checkbox" <%=(Settings.enableOmgtorrentSearch? "checked='checked'":"")%>>
                        <label id="enableOmgtorrentSearchL" for="enableOmgtorrentSearch" class="tooltipped" data-placement="bottom" data-toogle="tooltip"><%= i18n.__("OMGTorrent") %></label>
                    </span>
                </div>
            </form>
        </div>

        <div class="notorrents-info">
            <div class="notorrents-frame">
                <i class="fas fa-paste notorrents-icon"></i>
                <p class="notorrents-message"><%= i18n.__("Drop Magnet or .torrent")%></p>
            </div>
        </div>

        <div class="torrents-info">
            <i class="fa fa-database" id="savedtorrentslabel"></i>
            <i id="savedtorrentslabeltext"><%=i18n.__("Saved Torrents") %></i>
            <ul class="file-list">
                <% _.each(fs.readdirSync(data_path + '/TorrentCollection/'), function(file, index) { %>
                    <li class="file-item" data-index="<%=file.index%>" data-file="<%=index%>">
                        <a><%=file%></a>

                   <% if (file.indexOf('.torrent') !== -1) { %>
                        <div class="item-icon torrent-icon"></div>
                   <% } else { %>
                        <div class="item-icon magnet-icon tooltipped" data-toogle="tooltip" data-placement="right" title="<%=i18n.__("Magnet link") %>"></div>
                    <% } %>
                        <i class="fa fa-trash item-delete tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Remove this torrent") %>"></i>
                        <i class="fa fa-pencil-alt item-rename tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Rename this torrent") %>"></i>
                        </a>
                    </li>
                <% }); %>
            </ul>
        </div>

        <div class="onlinesearch-info">
            <i class="fa fa-search" id="searchresultslabel"></i>
            <i id="searchresultslabeltext"><%=i18n.__("Search Results") %></i>
            <i class="fa fa-arrow-circle-left online-back"></i>
            <ul class="file-list">
            </ul>
        </div>

        <div class="collection-actions">
            <div class="collection-paste fa fa-paste tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Paste a Magnet link") %>"></div>
            <div class="collection-import fa fa-level-down-alt tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Import a Torrent file") %>"></div>
            <input class="collection-import-hidden" style="display:none" type="file" accept=".torrent"/>
            <div class="collection-open fa fa-folder-open tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Open Collection Directory") %>"></div>
        </div>
    </div>
</div>
