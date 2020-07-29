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
                <i class="fa fa-search online-search"></i>
            </form>
            <div class="search_in">
                <span>
                    <input class="sengine-checkbox" name="enablethepiratebay" id="enablethepiratebay" type="checkbox" <%=(Settings.enablethepiratebay? "checked='checked'":"")%>>
                    <label for="enablethepiratebay"><%= i18n.__("ThePirateBay") %></label>
                </span>
                <span>
                    <input class="sengine-checkbox" name="enable1337x" id="enable1337x" type="checkbox" <%=(Settings.enable1337x? "checked='checked'":"")%>>
                    <label for="enable1337x"><%= i18n.__("1337x") %></label>
                </span>
                <span>
                    <input class="sengine-checkbox" name="enablerarbg" id="enablerarbg" type="checkbox" <%=(Settings.enablerarbg? "checked='checked'":"")%>>
                    <label for="enablerarbg"><%= i18n.__("RARBG") %></label>
                </span>
                <span>
                    <input class="sengine-checkbox" name="enableomgtorrents" id="enableomgtorrents" type="checkbox" <%=(Settings.enableomgtorrents? "checked='checked'":"")%>>
                    <label for="enableomgtorrents"><%= i18n.__("OMGTorrents") %></label>
                </span>
            </div>
        </div>

        <div class="notorrents-info">
            <div class="notorrents-frame">
                <i class="fa fa-download notorrents-icon"></i>
                <p class="notorrents-message"><%= i18n.__("Drop Magnet or .torrent")%></p>
            </div>
        </div>

        <div class="torrents-info">
            <ul class="file-list">
                <% _.each(fs.readdirSync(data_path + '/TorrentCollection/'), function(file, index) { %>
                    <li class="file-item" data-index="<%=file.index%>" data-file="<%=index%>">
                        <a><%=file%></a>

                   <% if (file.indexOf('.torrent') !== -1) { %>
                        <div class="item-icon torrent-icon"></div>
                   <% } else { %>
                        <div class="item-icon magnet-icon tooltipped" data-toogle="tooltip" data-placement="right" title="<%=i18n.__("Magnet link") %>"></div>
                    <% } %>
                        <i class="fa fa-trash-o item-delete tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Remove this torrent") %>"></i>
                        <i class="fa fa-pencil item-rename tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Rename this torrent") %>"></i>
                        </a>
                    </li>
                <% }); %>
            </ul>
        </div>

        <div class="onlinesearch-info">
            <i class="fa fa-arrow-circle-left online-back"></i>
            <ul class="file-list">
            </ul>
        </div>

        <div class="collection-actions">
            <div class="collection-delete fa fa-ban tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Flush entire collection") %>"></div>
            <div class="collection-open fa fa-folder-open-o tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Open Collection Directory") %>"></div>
            <div class="collection-import fa fa-level-down tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Import a Torrent") %>"></div>
            <input class="collection-import-hidden" style="display:none" type="file" accept=".torrent"/>
        </div>
    </div>
</div>
