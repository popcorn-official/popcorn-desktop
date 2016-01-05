<div class="torrent-collection-container">
    <div class="margintop"></div>
    <div class="content">

        <!--div class="onlinesearch">
            <div class="engine-selector">
                <div id="strike-icon" data-id="Strike" class="engine-icon"></div>
                <div id="kat-icon" data-id="KAT" class="engine-icon"></div>
            </div>
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
                <input id="online-input" autocomplete="off" size="30" type="text" name="keyword" placeholder="<%= i18n.__('Search on %s', Settings.onlineSearchEngine) %>">
                <i class="fa fa-search online-search"></i>
            </form>
        </div-->

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
