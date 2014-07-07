<% var p_rating = Math.round(rating) / 2; %>

<div id ="tt<%= imdb %>">
	<img class="cover-image" src="<%= image %>" style="display: none">
	<div class="cover">
		<div class="cover-overlay">
			<div class="actions-favorites"></div>
			<div class="actions-watched"><img src = "./images/icons/ViewMoreInfo.png"/></div>

			<% if(Settings.coversShowRating){ %>
				<div class="rating">
					<div class="rating-stars">
						<% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
							<i class="fa fa-star star"></i>
						<% }; %>
						<% if (p_rating % 1 > 0) { %>
							<i class="fa fa-star-half-o star"></i>
						<% }; %>
						<% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
							<i class="fa fa-star-o star"></i>
						<% }; %>
					</div>
					<div class="rating-value"><%= rating %>/10</div>
				</div>
			<% } %>
		</div>
	</div>

	<p class="title" title="<%= title %>"><%= title %></p>
	<p class="year"><%= year %></p>
	<% if(Settings.moviesShowQuality){ %>
		<p class="seasons">
		<% q720 = torrents["720p"] !== undefined; q1080 = torrents["1080p"] !== undefined;
		if (q720 && q1080) { %>720p/1080p<% } else if (q1080) { %>1080p<% } else if (q720) { %>720p<% } else { %>HDRip<% } %>
		</p>
	<% } %>
</div>
