<div class="torrent-collection-container">
	<div class="margintop"></div>
	<div class="content">
        <div class="notorrents-info">
            <i class="fa fa-download notorrents-icon"></i>
            <p class="notorrents-message"><%= i18n.__("Drop Magnet or .torrent")%></p>
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
						</a>
					</li>
				<% }); %>
			</ul>
        </div>
	</div>
</div>