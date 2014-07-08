<% var p_rating = Math.round(rating) / 2; %>

<div id ="tt<%= imdb %>">
	<img class="cover-image" src="<%= image %>" style="display: none">
	<div class="cover">
		<div class="cover-overlay">
			<i class="fa fa-heart actions-favorites"></i>
			<i class="fa fa-eye actions-watched"></i>

			
				<div class="rating" <% if(Settings.coversShowRating){ %> style="display: block;"<% } %> >
					<div class="rating-stars">
						<% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
							<i class="fa fa-star star"></i>
						<% }; %>
						<% if (p_rating % 1 > 0) { %>
							<i class="fa fa-star-half star"></i>
						<% }; %>
						<% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
							<i class="fa fa-star star-empty"></i>
						<% }; %>
					</div>
					<div class="rating-value"><%= rating %>/10</div>
				</div>
		
		</div>
	</div>

	<p class="title" title="<%= title %>"><%= title %></p>
	<p class="year"><%= year %></p>
	
		<p id="movie_quality" class="seasons quality" <% if(Settings.moviesShowQuality){ %> style="display: block;" <% } %> >
		<% q720 = torrents["720p"] !== undefined; q1080 = torrents["1080p"] !== undefined;
		if (q720 && q1080) { %>720p/1080p<% } else if (q1080) { %>1080p<% } else if (q720) { %>720p<% } else { %>HDRip<% } %>
		</p>

</div>
