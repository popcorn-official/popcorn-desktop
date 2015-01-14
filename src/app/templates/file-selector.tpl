<div class="file-selector-container">
	<div class="fa fa-times close-icon"></div>

	<div class="title"><%=i18n.__('Please select a file to play')%></div>
	<div class="content">
		<ul class="file-list">
			<% _.each(files, function(file, index) { %>
				<li class="file-item" data-index="<%=file.index%>" data-file="<%=index%>">
					<a><%=file.name %></a>
				</li>
			<% }); %>
		</ul>
	</div>

	<% if (Settings.allowTorrentStorage) { %>
	   <div class="button store-torrent"></div>
	<% } %>

    <div class="button dropup" id="player-chooser2"></div>
</div>