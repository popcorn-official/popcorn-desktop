(function (App) {
	'use strict';

	var _this;

	var Subtitles = Backbone.Marionette.ItemView.extend({
		template: '#player-subtitles',
		className: 'sub',

		initialize: function () {
			console.log('Init subs', this.model);
			//this.render();
		},

		onShow: function () {
			console.log('On show');
		},

		render: function () {
			var subtitle = this.model.subtitle;
			var traksa = [];
			var subArray = [];
			// Find subtitlesButton
			//var subtitlesButton;
			//			App.PlayerView.player.player().controlBar.children().forEach(
			//				function(el) { 
			//					if (el.name() === 'subtitlesButton') subtitlesButton = el; 
			//				});

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
			var subtracks = '';

			var defaultSub = 'none';

			for (var index in subArray) {
				var imDefault = '';

				if (defaultSub === subArray[index].language) {
					imDefault = 'default';
				}

				subtracks += '<track kind="subtitles" src="' + subArray[index].sub + '" srclang="' + subArray[index].language + '" label="' + subArray[index].languageName + '" charset="utf-8" ' + imDefault + ' />';
				var t = {
					kind: 'subtitles',
					src: subArray[index].sub,
					srclang: subArray[index].language,
					label: subArray[index].languageName,
					charset: 'utf-8',
					default: imDefault === 'default'
				};
				traksa.push(t);
				//this.addMenuItem(trakobj, subtitlesButton);
				App.PlayerView.player.player().addTextTrack('subtitles', t.label, t.srclang, t);

			}
			console.log(this.template);
			var compiled = _.template($(this.template).html());
			var traks = $(compiled(this.model));
			console.log($(subtracks));
			$(subtracks).appendTo('video');
			console.log($('video'));
			//App.PlayerView.player.addTextTracks(traksa);
			//console.log(traksa);
			return traks;
		},

		onRender: function () {
			// manipulate the `el` here. it's already
			// been rendered, and is full of the view's
			// HTML, ready to go.
			console.log('Render', this.model);
			//$('#video_player').append(this.el);
		}

	});

	App.View.Subtitles = Subtitles;
})(window.App);
