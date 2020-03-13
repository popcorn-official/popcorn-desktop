<div class="vpn-container">
    <div class="fa fa-times close-icon"></div>
    <div class="overlay-content"></div>
    <div class="margintop"></div>
    <div class="content">
        <div class="text-vpn">

            <h3 class="title-big">You’re discrete. We get that.</h3>

            <div class="full-text full-text-intro">
                Just because you live online doesn’t mean you want to leave it all online.
            </div>

            <div class="full-text full-text-outro hidden">
                A Virtual Private Network (VPN) encrypts all your vital information to create<br/>
                a secure tunnel between your devices and the Internet.
            </div>

            <div class="account_alert hidden">
                <span class="account_alert_message"></span>
            </div>

            <div class="create-account">

                <div>
					<input placeholder="Email" autofocus type="text" size="50" id="vpnEmail" name="vpnEmail">
				</div>
				<div>
					<input placeholder="Password" type="password" size="50" id="vpnPassword" name="vpnPassword">
				</div>
                <div>
                    <span class="button signup-button" id="signupVPN">
                        <i id="createAccountIcon" class="fa fa-user-plus">&nbsp;&nbsp;</i>
                        <i id="createAccountSpinner" class="fa fa-spinner fa-spin spinner hidden">&nbsp;&nbsp;</i>
                        <%= i18n.__("Create Account") %>
                    </span>
                </div>
                <div>
                    <span class="already-customer">Already have a VPN.ht account?</span>
                </div>
            </div>

            <div class="select-plan hidden">
                <div class="select-plan-container">
                    <div class="select-plan-container-top">
                        <span class="monthly">Monthly</span>
                        <div class="switch-container">
                            <input checked id="switch-flat" class="switch-input switch-flat" type="checkbox">
                            <label for="switch-flat"></label>
                        </div>
                        <span class="yearly green">Yearly</span>
                    </div>
                    <p class="price">3.33$</p>
                    <span class="period">per month, billed annually</span>
                    <div class="payment-buttons">
                        <span class="select-plan-button-paypal button">
                            <i id="paypalIcon" class="fab fa-paypal fa-2x" />
                        </span>
                        <span class="select-plan-button-btc button">
                            <i id="btcIcon" class="fab fa-bitcoin fa-2x" />
                        </span>
                        <span class="select-plan-button-cc button">
                            <i id="ccIcon" class="fa fa-credit-card fa-2x" />
                        </span>
                        <span class="select-plan-button-ideal button">
                            <i id="ccIdeal" class="fab fa-ideal fa-2x" />
                        </span>
                    </div>
                </div>
            </div>

            <div class="install-vpn hidden">
                <span class="install-vpn-button button">Install VPN</span>
                <div class="progress-vpn-container hidden">
                    <div>Downloading VPN Installer...</div>
                    <progress id="progress-vpn" value="0"></progress>
                </div>
            </div>
        </div>
    </div>
</div>
