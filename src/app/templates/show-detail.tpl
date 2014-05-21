<div class="tv-container-close"></div>
<div class="tv-poster">
	<div data-bgr="<%= images.fanart %>" class="tv-poster-background"><div class="tv-poster-overlay"></div></div>
	<div style="background-image:url(<%= images.poster %>);" class="tv-cover"></div>

	<div class="tv-meta-data">
		<div class="tv-title"><%= title %></div>
		<div class="tv-duration"><%= year %></div>
		<div class="tv-dot"></div>
		<div class="tv-genre"><%= runtime %> min</div>
		<div class="tv-dot"></div>
		<div class="tv-status"><%= status !== undefined ? i18n.__(status) : "N/A" %></div>
		<div class="tv-dot"></div>
		<div class="tv-num-episodes"><%= i18n.__(genres[0]) %></div>
		<div class="tv-dot"></div>
		<% p_rating = Math.round(rating.percentage) / 20; // Roundoff number to nearest 0.5 %>
		<div data-toggle="tooltip" data-placement="right" title="<%= Math.round(rating.percentage) / 10 %> /10" class="star-container-tv">

		<% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
			<img src="images/icons/star.png" alt="full" class="tv-rating-star">
		<% }; %>
		<% if (p_rating % 1 > 0) { %>
			<img src="images/icons/StarHalf.png" alt="half" class="tv-rating-star">
		<% }; %>
		<% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
			<img src="images/icons/StarGray.png" alt="null" class="tv-rating-star">
		<% }; %>
		</div>
		<% if (synopsis.length > 776) { var synopsis = synopsis.substring(0, 776) + "..."; } %>
		<div class="tv-overview"><%= synopsis %></div>
	</div>
</div>

<div class="episode-base">
	<div class="episode-info">
		<div class="episode-info-title"></div>
		<div class="episode-info-number"></div>
		<div class="episode-info-date"></div>
		<div class="episode-info-description"></div>
		<div class="movie-btn-watch-episode startStreaming" data-torrent="" data-episodeid="">
			<div class="movie-watch-now"><%= i18n.__("Watch Now") %></div>
		</div>
	</div>

	<div class="display-base-title">
		<div class="episode-list-seasons"><%= i18n.__("Seasons") %></div>
		<div class="episode-list-episodes"><%= i18n.__("Episodes") %></div>
	</div>

	<div class="season-episode-container">
		<div id="tabs_base">
			<ul id="tabs_season">
				<!-- "TODO: to be updated i dont find it really elegant
					i'll build a compatible torrent array with our episodes content" -->
				<% var torrents = {};
				_.each(episodes, function(value, currentEpisode) {
					if (!torrents[value.season]) torrents[value.season] = {};
					torrents[value.season][value.episode] = value;
				}); %>

				<% _.each(torrents, function(value, season) { %>
					<li data-tab="season-<%=season %>">
						<a><%= i18n.__("Season") %>&nbsp;<%=season %></a>
					</li>
				<% }); %>
			</ul>
			<div id="tabs_episode_base">
				<% _.each(torrents, function(value, season) { %>
					<div id="season-<%=season %>" class="tabs-episode">
						<ul>
							<% _.each(value, function(episodeData, episode) {
								var first_aired = '';
								if (episodeData.first_aired !== undefined) {
									first_aired = moment.unix(episodeData.first_aired).lang(Settings.language).format("LLLL");
								} %>
								<li class="episodeSummary" data-id="<%=episodeData.tvdb_id %>" data-torrent="<%=episodeData.torrents[0].url %>">
									<a href="#" class="episodeData">
										<span><%=episodeData.episode %></span>
										<div><%=episodeData.title %></div>
									</a>
									<span id="watched-<%=episodeData.season%>-<%=episodeData.episode%>" class="watched watched-false"><img src="images/icons/Player/ViewMoreInfo.png" /></span>


									<!-- hidden template so we can save a DB query -->
									<div class="template-<%=episodeData.tvdb_id %>" style="display:none">
										<span class="title"><%=episodeData.title %></span>
										<span class="date"><%=first_aired %></span>
										<span class="season"><%=episodeData.season %></span>
										<span class="episode"><%=episodeData.episode %></span>
										<div class="overview"><%=episodeData.overview %></div>
									</div>
								</li>
							<% }); %>
						</ul>
					</div><!--End tabs-episode-->
				<% }); %>
			</div><!--End tabs-episode-base-->
		</div><!--End tabs_base-->
	</div><!--End season-episode-container-->
</div>