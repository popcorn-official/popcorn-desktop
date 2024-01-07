<div class="loading-backdrop"></div>
<div class="disclaimer-loading"></div>
<img class="icon-disclaimer" src="/src/app/images/icon.png">
<div class="disclaimer-state">
    <div class="disclaimer-content">
        <h1><%= i18n.__("Terms of Service") %></h1>
        <div class="disclaimer-text">
            <h2>Your Acceptance</h2>

            <p>By using the '<%= Settings.projectName %>' app you signify your agreement to (1) these terms and conditions (the 'Terms of Service').<br><br></p>

            <h2>Privacy Policy.</h2>

            <p>You understand that by using '<%= Settings.projectName %>' you may encounter material that you may deem to be offensive, indecent, or objectionable, and that such content may or may not be identified as having explicit material. '<%= Settings.projectName %>' will have no liability to you for such material – you agree that your use of '<%= Settings.projectName %>' is at your sole risk.<br><br></p>
            
            <h2>DISCLAIMERS</h2>
            
            <p>YOU EXPRESSLY AGREE THAT YOUR USE OF '<%= Settings.projectName %>' IS AT YOUR SOLE RISK. '<%= Settings.projectName %>' AND ALL PRODUCTS ARE PROVIDED TO YOU “AS IS” WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. '<%= Settings.projectName %>' MAKES ABSOLUTELY NO WARRANTIES WHATSOEVER, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT POSSIBLE UNDER APPLICABLE LAWS, YIFY DISCLAIMS ALL WARRANTIES, EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR OTHER VIOLATIONS OF RIGHTS.<br><br></p>
            
            <h2>LIMITATION OF LIABILITY</h2>

            <p>'<%= Settings.projectName %>' IS NOT RESPONSIBLE FOR ANY PROBLEMS OR TECHNICAL MALFUNCTION OF ANY WEBSITE, NETWORK, COMPUTER SYSTEMS, SERVERS, PROVIDERS, COMPUTER EQUIPMENT, OR SOFTWARE, OR FOR ANY FAILURE DUE TO TECHNICAL PROBLEMS OR TRAFFIC CONGESTION ON THE INTERNET OR '<%= Settings.projectName %>' OR COMBINATION THEREOF, INCLUDING ANY INJURY OR DAMAGE TO USERS OR TO ANY COMPUTER OR OTHER DEVICE ON OR THROUGH WHICH '<%= Settings.projectName %>' IS PROVIDED. UNDER NO CIRCUMSTANCES WILL '<%= Settings.projectName %>' BE LIABLE FOR ANY LOSS OR DAMAGE, INCLUDING PERSONAL INJURY OR DEATH, RESULTING FROM YOUR USE OF '<%= Settings.projectName %>'.<br><br></p>
            
            <h2>SOURCE MATERIAL</h2>

            <p>ALL MOVIES ARE NOT HOSTED ON ANY SERVER AND ARE STREAMED USING THE P2P BIT TORRENT PROTOCOL. ALL MOVIES ARE PULLED IN FROM OPEN PUBLIC APIS. BY WATCHING A MOVIE WITH THIS APPLICATION YOU MIGHT BE COMMITTING COPYRIGHT VIOLATIONS DEPENDING ON YOUR COUNTRY´S LAWS. WE DO NOT TAKE ANY RESPONSIBILITIES.<br><br></p>
            
            <h2>Ability to Accept Terms of Service</h2>

            <p>By using '<%= Settings.projectName %>' or accessing this site you affirm that you are either more than 18 years of age, or an emancipated minor, or possess legal parental or guardian consent, and are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms of Service, and to abide by and comply with these Terms of Service. In any case, you affirm that you are over the age of 13, as the Service is not intended for children under 13. If you are under 13 years of age, then please do not use the Service. There are lots of other great web sites for you. Talk to your parents about what sites are appropriate for you.</p>
        </div>
        <span class="dhtEnableSpn">
            <input class="settings-checkbox" name="dhtEnableFR" id="dhtEnableFR" type="checkbox" <%=(Settings.dhtEnable === false ? "":"checked='checked'")%>>
            <label class="settings-label" for="dhtEnableFR"><%= i18n.__("Enable automatically updating the API Server URLs") %></label>
        </span>
        <span class="updateNotificationSpn">
            <input class="settings-checkbox" name="updateNotificationFR" id="updateNotificationFR" type="checkbox" <%=(Settings.updateNotification === false ? "":"checked='checked'")%>>
            <label class="settings-label" for="updateNotificationFR"><%= i18n.__("Show a notification when a new version is available") %></label>
        </span><br>
        <a class="btn-accept"><%= i18n.__("I Accept") %></a> <a class="btn-close"><%= i18n.__("Leave") %></a>
    </div>
</div>
