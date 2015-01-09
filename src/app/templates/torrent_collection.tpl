<div class="torrent-collection-container">
	<div class="fa fa-times close-icon"></div>
	<div class="margintop"></div>
	<div class="content">
		<% if (!App.View.TorrentCollection.storedTorrents) { %>
			<div class="notorrents-info">
				<i class="fa fa-download notorrents-icon"></i>
				<p class="notorrents-message"><%= i18n.__("Drop Magnet or .torrent")%></p>
			</div>
		<% } else { %>
			
		<% } %>
	</div>
</div>