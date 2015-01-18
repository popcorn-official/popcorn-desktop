<div class="torrent-collection-container">
	<div class="margintop"></div>
	<div class="content">
        <div class="notorrents-info">
			<div class="notorrents-frame">
				<i class="fa fa-download notorrents-icon"></i>
				<p class="notorrents-message"><%= i18n.__("Drop Magnet or .torrent")%></p>
			</div>
        </div>

        <div class="torrents-info">
			<ul class="file-list">
				<% _.each(fs.readdirSync(require('nw.gui').App.dataPath + '/TorrentCollection/'), function(file, index) { %>
					<li class="file-item" data-index="<%=file.index%>" data-file="<%=index%>">
						<a><%=file%></a>

				   <% if (file.indexOf('.torrent') !== -1) {
				   		var icon = "torrent-icon";
				   } else {
				   		var icon = "magnet-icon";
				   } %>
						<div class="item-icon <%=icon%>"></div>
						<i class="fa fa-trash-o item-delete tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Remove this torrent") %>"></i>
						<i class="fa fa-pencil item-rename tooltipped" data-toggle="tooltip" data-placement="left" title="<%= i18n.__("Rename this torrent") %>"></i>
						</a>
					</li>
				<% }); %>
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
