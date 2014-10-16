<div class="player-header-background vjs-control-bar">
	<div class="player-title"><%= title %></div>
	<div class="details-player">
		<% if(quality) { %>
		<span class="quality-info-player"><%= quality %></span>
		<% } %>
		<span class="fa fa-times close-info-player"></span>
		<div class="download-info-player">
			<i class="fa fa-eye eye-info-player"></i>
			<div class="details-info-player">
				<div class="arrow-up"></div>
				<span class="speed-info-player"><%= i18n.__("Download") %>:&nbsp;</span><span class="download_speed_player">0 B/s</span><br>
				<span class="speed-info-player"><%= i18n.__("Upload") %>:&nbsp;</span><span class="upload_speed_player">0 B/s</span><br>
				<span class="speed-info-player"><%= i18n.__("Active Peers") %>:&nbsp;</span><span class="active_peers_player">0</span>
			</div>
		</div>
	</div>
</div>

<div class="playing_next vjs-control-window">
	<p><%= i18n.__("Playing Next Episode in") %>: <span id="nextCountdown">60</span>
	</p>
	<div class="auto-next-btn playnownext"><%= i18n.__("Play Now") %></div>
</div>
	
<video id="video_player" width="100%" height="100%" class="video-js vjs-popcorn-skin" controls preload="auto" autoplay >
	<source src="<%= src %>" type="<%= type %>" />
</video>
