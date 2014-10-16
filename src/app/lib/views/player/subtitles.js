(function (App) {
	'use strict';

	var Subtitles = Backbone.Marionette.ItemView.extend({
		template: '#player-subtitles',
		className: 'sub',

		onBeforeRender: function () {
			if ($('.vjs-has-started').length === 0) {
				App.vent.off('player:ready');
				App.vent.on('player:ready', _.bind(this.render, this, {
					event: 'player:ready'
				}));
				return false;
			}
			return true;
		},

		render: function (e) {
			if (!this.onBeforeRender() && typeof e === 'undefined') {
				return false;
			}

			var subtitle = this.model.subtitle;
			var subArray = [];

			for (var lang in subtitle) {
				var langcode = lang === 'pb' ? 'pt-br' : lang;
				subArray.push({
					'language': langcode,
					'languageName': (App.Localization.langcodes[langcode] !== undefined ? App.Localization.langcodes[langcode].nativeName : langcode),
					'sub': subtitle[lang]
				});
			}

			subArray.sort(function (sub1, sub2) {
				return sub1.language > sub2.language;
			});

			var defaultSub = 'none';

			for (var index in subArray) {
				var imDefault = '';

				if (defaultSub === subArray[index].language) {
					imDefault = 'default';
				}

				var t = {
					kind: 'subtitles',
					src: subArray[index].sub,
					srclang: subArray[index].language,
					label: subArray[index].languageName,
					charset: 'utf-8',
					default: imDefault === 'default'
				};

				App.PlayerView.player.player().addTextTrack('subtitles', t.label, t.srclang, t);

			}

			var subsclass = App.PlayerView.player.controlBar.subtitlesButton.className;
			var subshtml = App.PlayerView.player.controlBar.subtitlesButton.createMenu().el();
			$('.' + subsclass).html(subshtml);

		}
	});

	App.View.Subtitles = Subtitles;
})(window.App);
