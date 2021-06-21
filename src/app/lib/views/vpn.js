(function(App) {
  'use strict';

  let timeout = null;
  let token = null;
  let plan = 'ANNUALLY';
  let paymentProcessor = null;

  var VPN = Marionette.View.extend({
    template: '#vpn-tpl',
    className: 'vpn',

    events: {
      'click .close-icon': 'closeVPN',
      'click .install-vpn-button': 'installVPN',
      'click .already-customer': 'installVPN',
      'click .signup-button': 'signupVPN',
      'click .switch-flat': 'switchFlat',
      'click .select-plan-button-paypal': 'buyPaypal',
      'click .select-plan-button-btc': 'buyBTC',
      'click .select-plan-button-cc': 'buyCC',
      'click .select-plan-button-ideal': 'buyIdeal'
    },

    initialize: function() {
      App.vent.on('vpn:installProgress', function(percentage) {
        $('#progress-vpn').attr('value', percentage);
      });
      App.vent.on('vpn:downloaded', function() {
        App.vent.trigger('vpn:close');
      });
    },

    onAttach: function() {
      $('.filter-bar').hide();
      $('#header').addClass('header-shadow');

      Mousetrap.bind(['esc', 'backspace'], function(e) {
        App.vent.trigger('vpn:close');
      });
      win.info('Show VPN');
      $('#movie-detail').hide();
    },

    onBeforeDestroy: function() {
      Mousetrap.unbind(['esc', 'backspace']);
      $('.filter-bar').show();
      $('#header').removeClass('header-shadow');
      $('#movie-detail').show();
    },

    closeVPN: function() {
      App.vent.trigger('vpn:close');
    },

    installVPN: function() {
      $('.create-account').addClass('hidden');
      $('.select-plan').addClass('hidden');

      $('.install-vpn').removeClass('hidden');
      $('.install-vpn-button').addClass('hidden');
      $('.progress-vpn-container').removeClass('hidden');
      App.vent.trigger('vpn:install');
    },

    switchFlat: function() {
      $('.yearly').toggleClass('green');
      if ($('.switch-flat').is(':checked')) {
        plan = 'ANNUALLY';
        $('.price').html('3.33$');
        $('.period').html('per month, billed annually');
      } else {
        plan = 'MONTHLY';
        $('.price').html('1.00$');
        $('.period').html('first month, then $4.99/month');
      }
    },

    buyPaypal: function() {
      paymentProcessor = 'PAYPAL';
      $('#paypalIcon')
        .removeClass('fab fa-paypal')
        .addClass('fa fa-spinner fa-spin')
        .attr('disabled', true);

      this.selectPlanApi();
    },

    buyBTC: function() {
      paymentProcessor = 'CRYPTO';
      $('#btcIcon')
        .removeClass('fab fa-bitcoin')
        .addClass('fa fa-spinner fa-spin')
        .attr('disabled', true);

      this.selectPlanApi();
    },

    buyIdeal: function() {
      paymentProcessor = 'PAYMENTWALL';
      $('#ccIdeal')
        .removeClass('fab fa-bitcoin')
        .addClass('fa fa-spinner fa-spin')
        .attr('disabled', true);

      this.selectPlanApi();
    },

    buyCC: function() {
      paymentProcessor = 'PAYMENTWALL';
      $('#ccIcon')
        .removeClass('fa-credit-card')
        .addClass('fa-spinner fa-spin')
        .attr('disabled', true);

      this.selectPlanApi();
    },

    selectPlanApi: function() {
      var self = this;
      VPNht.pickPlan({
        plan,
        processor: paymentProcessor,
        authToken: token
      }).then(plan => {
        if (plan.error) {
          $('.account_alert_message').text(plan.error.message);
          $('.account_alert').removeClass('hidden');
          $('.full-text-intro').addClass('hidden');

          if (timeout) {
            clearTimeout(timeout);
          }

          timeout = setTimeout(() => {
            $('.full-text-intro').removeClass('hidden');
            $('.account_alert').addClass('hidden');
          }, 4000);
        } else {
          const { url } = plan.result.createSubscriptionCust;
          nw.Shell.openExternal(url);
          self.installVPN();
        }
      });
    },

    signupVPN: function() {
      var email = $('#vpnEmail').val(),
        password = $('#vpnPassword').val();

      var spinner = $('#createAccountSpinner');
      var icon = $('#createAccountIcon');

      spinner.removeClass('hidden');
      icon.addClass('hidden');

      if (email !== '' && password !== '') {
        VPNht.signup({ email, password }).then(signup => {
          spinner.addClass('hidden');
          icon.removeClass('hidden');

          if (signup.error) {
            $('.account_alert_message').text(signup.error.message);
            $('.account_alert').removeClass('hidden');
            $('.full-text-intro').addClass('hidden');

            if (timeout) {
              clearTimeout(timeout);
            }

            timeout = setTimeout(() => {
              $('.full-text-intro').removeClass('hidden');
              $('.account_alert').addClass('hidden');
            }, 4000);
          } else {
            token = signup.result.createCustomer.token;
            // show select plan
            $('.create-account').addClass('hidden');
            $('.select-plan').removeClass('hidden');
          }
        });
      } else {
        spinner.addClass('hidden');
        icon.removeClass('hidden');

        $('.account_alert_message').text('Invalid email or password');
        $('.account_alert').removeClass('hidden');
        $('.full-text-intro').addClass('hidden');

        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          $('.full-text-intro').removeClass('hidden');
          $('.account_alert').addClass('hidden');
        }, 4000);
      }
    }
  });

  App.View.VPN = VPN;
})(window.App);
