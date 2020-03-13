<div class="loading">
  <div class="loading-backdrop"></div>
  <div class="loading-backdrop-overlay"></div>

    <div class="state">
        <div class="title"></div>
        <div class="external-play" style="visibility:hidden"><%= i18n.__("Streaming to") %> <span class="player-name"></span></div>

        <!-- download -->
        <div class="text_download"><%= i18n.__(state) %></div>

        <!-- vpn -->
        <div id="vpn-contents" class="vpn" style="visibility:hidden">
            <div class="heading">Anyone can know where you’re from</div>
            <div class="subheading">
                <p>Hide your IP with a VPN to block unwanted exposure and data leaks.</p>
                <p>Without VPN, <span id="userISP"></span> will continue to track and record everything.</p>
            </div>
            <div class="flex-map">
                <div class="map">
                    <img id="map" src="#" / >
                </div>
                <div class="details">
                    <div class="group">
                        <div class="fixed-width">IP Address:</div>
                        <div id="userIp"></div>
                    </div>
                    <div class="group">
                        <div class="fixed-width">City:</div>
                        <div id="userCity"></div>
                    </div>
                    <div class="group">
                        <div class="fixed-width">Country:</div>
                        <div id="userCountry"></div>
                    </div>
                    <div class="group">
                        <div class="fixed-width">ZIP:</div>
                        <div id="userZIP"></div>
                    </div>
                </div>
            </div>

            <div id="cancel-button-vpn" class="cancel-button">
                <div class="cancel-button-text"><%= i18n.__("Cancel and use VPN") %></div>
            </div>

        </div>

        <div class="seed_status" style="visibility:hidden">
            <!-- loading bar -->
            <div class="loading-progressbar">
                <div id="loadingbar-contents"></div>
            </div>

            <!-- downloading info -->
            <div class="loading-info">
                <span class="buffer_percent"></span><br><br>
                <span class="loading-info-text"><%= i18n.__("Download") %>:&nbsp;</span>
                <span class="download_speed value"><%= Common.fileSize(0) %>/s</span><br>
                <span class="loading-info-text"><%= i18n.__("Upload") %>:&nbsp;</span>
                <span class="upload_speed value"><%= Common.fileSize(0) %>/s</span><br>
                <span class="loading-info-text"><%= i18n.__("Active Peers") %>:&nbsp;</span>
                <span class="value_peers value">0</span>
            </div>
        </div>

        <div class="player-controls" style="visibility:hidden">
            <i class="fa fa-backward backward"></i>
            <i class="fa fa-pause pause"></i>
            <i class="fa fa-stop stop"></i>
            <i class="fa fa-forward forward"></i>
        </div>

        <div class="playing-progressbar" style="visibility:hidden">
            <div id="playingbar-contents"></div>
        </div>

        <div id="cancel-button" class="cancel-button">
            <div class="cancel-button-text"><%= i18n.__("Cancel") %></div>
        </div>

    </div>
    <div class="warning-nospace">
        <span class="warn"><%= i18n.__('Your disk is almost full.') %></span><br>
        <span class="detail"><%= i18n.__('You need to make more space available on your disk by deleting files.') %></span>
    </div>
</div>
