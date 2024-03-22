<div class="loading">
  <div class="loading-backdrop" <% try { %> style="background-image:url( <%= backdrop %> )" <% }catch(err) {} %>></div>
  <div class="loading-backdrop-overlay"<% if($('.backdrop')[0] && Settings.moviesUITransparency !== '0.65') {%> style="opacity:<%=Settings.moviesUITransparency%>"<%} else if ($('.sh-backdrop')[0] && Settings.seriesUITransparency !== 'medium') {switch(Settings.seriesUITransparency) { case 'high': %> style="opacity:0.6"<%; break; case 'vhigh': %> style="opacity:0.5"<%; break; default: %><%}}%>></div>
  <div class="fa fa-angle-down minimize-icon tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Minimize") %>"></div>
  <div class="maximize-icon">
      <span class="buffer_percent"></span>
      <span class="fa fa-play" id="max_play_ctrl"></span>
      <span class="title copytoclip" data-copy="title"></span>
      <span id="maxdllb">@ </span>
      <span class="download_speed value" id="maxdl"></span>
      <span class="fa fa-angle-up tooltipped" id="maxic" data-toggle="tooltip" data-placement="top" title="<%= i18n.__("Restore") %>"></span>
  </div>

    <div class="state-flex">
        <div class="state">
            <div class="title tooltipped copytoclip" data-copy="title" data-toggle="tooltip" data-placement="bottom"></div>
            <div class="external-play"><%= i18n.__("Streaming to") %> <span class="player-name"></span></div>

            <!-- loading bar -->
            <div class="loading-progressbar">
                <div id="loadingbar-contents"></div>
            </div>

            <!-- download -->
            <div class="text_download"><%= i18n.__(state) %></div>

            <div class="seed_status">
                <!-- downloading info -->
                <div class="loading-info">
                    <span class="buffer_percent"></span>&nbsp;&nbsp;&nbsp;<span class="text">(</span><span class="text_downloadedformatted"></span><span class="text_size"></span><span class="text">)</span>
                    <span class="magnet-icon tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Magnet link") %>"><i class="fa fa-magnet"></i></span><br>
                    <span class="text_remaining"></span><span id="rbreak1"><br></span><br>
                    <span class="loading-info-text" id="rdownl"><%= i18n.__("Download") %>:&nbsp;</span>
                    <span class="download_speed value"><%= Common.fileSize(0) %>/s</span><span id="rbreak2"><br></span>
                    <span class="loading-info-text"><%= i18n.__("Upload") %>:&nbsp;</span>
                    <span class="upload_speed value"><%= Common.fileSize(0) %>/s</span><br>
                    <span class="loading-info-text" id="ractpr"><%= i18n.__("Active Peers") %>:&nbsp;</span>
                    <span class="value_peers value">0</span><span id="rbreak3"><br></span>
                    <span class="loading-info-text"><%= i18n.__("Filename") %>:&nbsp;</span>
                    <span class="text_filename value tooltipped copytoclip" data-copy="filename" data-toggle="tooltip" data-placement="bottom"></span><br>
                    <span class="loading-info-text"><%= i18n.__("Stream Url") %>:&nbsp;</span>
                    <span class="text_streamurl value tooltipped copytoclip" data-copy="stream url" data-toggle="tooltip" data-placement="bottom"></span><br>
                    <div class="fa fa-caret-down show-pcontrols tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Show playback controls") %>"></div>
                    <div class="player-controls">
                        <i class="fa fa-backward backward"></i>
                        <i class="fa fa-pause pause"></i>
                        <i class="fa fa-stop stop"></i>
                        <i class="fa fa-forward forward"></i>
                    </div>
                    <div class="playing-progressbar">
                        <div id="playingbar-contents"></div>
                    </div>
                </div>
            </div>

            <div id="cancel-button" class="cancel-button button">
                <div class="cancel-button-text"><%= i18n.__("Cancel") %></div>
            </div>
        </div>
    </div>
    <div class="warning-nospace">
        <span class="warn"><%= i18n.__('Your disk is almost full.') %></span><br>
        <span class="detail"><%= i18n.__('You need to make more space available on your disk by deleting files.') %></span>
    </div>
</div>
