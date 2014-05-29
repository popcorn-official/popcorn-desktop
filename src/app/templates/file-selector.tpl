<div class="file-selector-container">
	<div class="close"></div>
	<div class="overlay-content"></div>

	<div class="title"><%=i18n.__('Please select a file to play')%></div>
	<div class="content">
		<ul class = "file-list">
			<% _.each(files, function(file, index) { %>
				<li class="file-item" data-file="<%=index%>">
					<a><%=file.name %></a>
				</li>
			<% }); %>
		</ul>
	</div>
</div>