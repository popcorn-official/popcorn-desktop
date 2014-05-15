<div class="player-header-background vjs-control-bar">
	<div class="player-title"><%= title %></div>
	<div class="details-player">
		<span class="close-info-player"></span>
		<div class="download-info-player">
			<div class="eye-info-player"></div>
			<div class="details-info-player">
				<div class="arrow-up"></div>
				<span class="speed-info-player"><%= i18n.__("Download") %>:&nbsp;</span><span class="download_speed_player">0 B/s</span><br>
				<span class="speed-info-player"><%= i18n.__("Upload") %>:&nbsp;</span><span class="upload_speed_player">0 B/s</span><br>
				<span class="speed-info-player"><%= i18n.__("Active Peers") %>:&nbsp;</span><span class="active_peers_player">0</span>
			</div>
		</div>
	</div>
</div>
<%
	var subArray = [];
	for (var lang in subtitle) {
		subArray.push({
			"language": lang,
			"languageName": (App.Localization.langcodes[lang] !== undefined ? App.Localization.langcodes[lang].nativeName : lang),
			"sub": subtitle[lang]
		});
	}
	subArray.sort(function (sub1, sub2) {
		return sub1.language > sub2.language;
	});
	var subtracks = "";

	var defaultSub = "none";
	if (typeof defaultSubtitle != "undefined") {
		defaultSub = defaultSubtitle;
	}
	for(var index in subArray ) {
		var imDefault = "";

		if(defaultSub == subArray[index].language)
			imDefault = "default";

		subtracks += '<track kind="subtitles" src="' + subArray[index].sub + '" srclang="'+ subArray[index].language +'" label="' + subArray[index].languageName + '" charset="utf-8" '+ imDefault +' />';
	}
%>
<video id="video_player" width="100%" height="100%" class="video-js vjs-default-skin vjs-big-play-centered" controls preload autoplay >
	<source src="<%= src %>" type="<%= type %>" />
	<%=subtracks%>
</video>