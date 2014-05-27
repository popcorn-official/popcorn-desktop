<div class="file-selector-container">
	<div class="close"></div>
	<div class="overlay-content"></div>

	<div class="content">
		<div class="title">Please select a file to play</div>
		<ul class = "file-list">
			<% _.each(files, function(file, index) { %>
				<li class="file-item" data-file="<%=index%>">
					<a><%=file.name %></a>
				</li>
			<% }); %>
		</ul>
	</div>
</div>