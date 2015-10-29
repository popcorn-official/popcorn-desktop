<div class="player-header-background vjs-control-bar">
    <div class="wcp-pause-anim wcp-center" style="display: block;"><i class="wcp-anim-basic wcp-anim-icon-pause" style="font-size: 80px; padding: 7px 30px; border-radius: 12px;"></i></div>
    <i class="state-info-player fa fa-play"></i>
    <i class="state-info-player fa fa-pause"></i>
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
                <span class="speed-info-player"><%= i18n.__("Download") %>:&nbsp;</span><span class="download_speed_player value"><%= Common.fileSize(0) %>/s</span><br>
                <span class="speed-info-player"><%= i18n.__("Upload") %>:&nbsp;</span><span class="upload_speed_player value"><%= Common.fileSize(0) %>/s</span><br>
                <span class="speed-info-player"><%= i18n.__("Active Peers") %>:&nbsp;</span><span class="active_peers_player value">0</span><br>
                <span class="speed-info-player"><%= i18n.__("Downloaded") %>:&nbsp;</span><span class="downloaded_player value">0</span>
            </div>
        </div>
    </div>
</div>
<div class="trailer_mouse_catch"></div>
<div class="verify-metadata vjs-control-window">
    <div class="vm_poster">
        <img class="verifmeta_poster" src="images/posterholder.png">
    </div>
    <div class="vm_epinfo">
        <p class="verifmeta_show"></p>
        <p class="verifmeta_episode"></p>
        <p class="verifmeta_number"></p>
    </div>
    <div class="vm_box">
        <p class="verifmeta_boxtext"><%= i18n.__("Currently watching") %></p>
    </div>
    <div class="vm_btns">
        <div class="vm-btn verifmetaFALSE"><%= i18n.__("No, it's not that") %></div>
        <div class="vm-btn verifmetaTRUE"><%= i18n.__("Correct") %></div>
    </div>
</div>
<div class="playing_next vjs-control-window">
    <div class="pn_poster">
        <img class="playing_next_poster" src="images/posterholder.png">
    </div>
    <div class="pn_epinfo">
        <p class="playing_next_show"></p>
        <p class="playing_next_episode"></p>
        <p class="playing_next_number"></p>
    </div>
    <div class="pn_counter">
        <p class="playing_next_countertext"><%= i18n.__("Playing Next") %></p>
        <p id="nextCountdown">60</p>
    </div>
    <div class="pn_btns">
        <div class="auto-next-btn playnownextNOT"><%= i18n.__("No thank you") %></div>
        <div class="auto-next-btn playnownext"><%= i18n.__("Play Now") %></div>
    </div>
</div>
<%
    var subArray = [];
    for (var langcode in subtitle) {
        subArray.push({
            "language": langcode,
            "languageName": (App.Localization.langcodes[langcode] !== undefined ? App.Localization.langcodes[langcode].nativeName : langcode),
            "sub": subtitle[langcode]
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

<div id="video_player" width="100%" height="100%" class="video-js vjs-popcorn-skin webchimeras">
    <div id="webchimera" class="wcp-wrapper" style="height: 100%; cursor: none;">
        <div class="wcp-center" style="overflow: hidden; height: 76.7397690437601%; width: 100%;">
            <canvas class="wcp-canvas wcp-center" width="1280" height="546" style="height: 100%; width: 100%;"></canvas>
        </div>
        <div class="wcp-surface"></div>
        <div class="wcp-menu wcp-playlist wcp-center">
            <div class="wcp-menu-close"></div>
            <div class="wcp-menu-title">Playlist Menu</div>
            <ul class="wcp-menu-items wcp-playlist-items"></ul>
        </div>
        <div class="wcp-menu wcp-subtitles wcp-center">
            <div class="wcp-menu-close"></div>
            <div class="wcp-menu-title">Subtitle Menu</div>
            <ul class="wcp-menu-items wcp-subtitles-items"></ul>
        </div>
        <div class="wcp-titlebar"><span class="wcp-title">The.Tunnel.2011.720p.x264-VODO</span></div>
        <div class="wcp-toolbar" style="display: block; opacity: 1;">
            <div></div>
            <div class="wcp-progress-bar">
                <div class="wcp-progress-seen" style="width: 2.68380902707577%;"></div>
                <div class="wcp-progress-pointer"></div>
            </div>
            <div class="wcp-button wcp-prev" style="display: none"></div>
            <div class="wcp-button wcp-play"></div>
            <div class="wcp-button wcp-next" style="display: none"></div>
            <div class="wcp-time"><span class="wcp-time-current">00:02:26</span><span class="wcp-time-total"> / 01:31:14</span></div>
            <div class="wcp-button wcp-right wcp-maximize"></div>
            <div class="wcp-button wcp-right wcp-vol-button wcp-mute"></div>
            <div class="wcp-vol-control wcp-right">
                <div class="wcp-vol-bar">
                    <div class="wcp-vol-bar-full" style="width: 0px;"></div>
                    <div class="wcp-vol-bar-pointer"></div>
                </div>
            </div>
            <div class="wcp-button wcp-right wcp-playlist-but"></div>
            <div class="wcp-button wcp-right wcp-subtitle-but" style="display: block;"></div>
        </div>
        <div class="wcp-status" style="opacity: 1; display: block;">Buffering 100%</div>
        <div class="wcp-notif" style="font-size: 31px;">asdasd</div>
        <div class="wcp-subtitle-text" style="font-size: 31px;"> asdasd</div>
        <div class="wcp-tooltip">
            <div class="wcp-tooltip-arrow"></div>
            <div class="wcp-tooltip-inner">00:00</div>
        </div>
    </div>
    <div class="player-header-background vjs-control-bar">
        <div class="player-title">The Tunnel</div>
        <div class="details-player">
            <span class="quality-info-player">720p</span>
            <span class="fa fa-times close-info-player"></span>
            <div class="download-info-player">
                <i class="fa fa-eye eye-info-player"></i>
                <div class="details-info-player">
                    <div class="arrow-up"></div>
                    <span class="speed-info-player">Download:&nbsp;</span><span class="download_speed_player value">857.6 KiB/s</span>
                    <br>
                    <span class="speed-info-player">Upload:&nbsp;</span><span class="upload_speed_player value">0 B/s</span>
                    <br>
                    <span class="speed-info-player">Active Peers:&nbsp;</span><span class="active_peers_player value">0</span>
                    <br>
                    <span class="speed-info-player">Downloaded:&nbsp;</span><span class="downloaded_player value">160.68 MiB (7%)</span>
                    <br><span class="remaining">44 minute(s) remaining</span></div>
            </div>
        </div>
    </div><i class="state-info-player fa fa-play" style="display: none;"></i><i class="state-info-player fa fa-pause" style="display: none;"></i></div>
