// Detect the language and update the global Language file
var detectLanguage = function (preferredLanguage) {

	var fs = require('fs');
	// The full OS language (with localization, like 'en-uk')
	var pureLanguage = navigator.language.toLowerCase();
	// The global language name (without localization, like 'en')
	var baseLanguage = navigator.language.toLowerCase().slice(0, 2);

	if(!preferredLanguage) {
		// we are stillon default
		if($.inArray(pureLanguage, App.Localization.allTranslations) !== -1) {
			i18n.setLocale(pureLanguage);
			AdvSettings.set('language', pureLanguage);
		} else if($.inArray(baseLanguage, App.Localization.allTranslations) !== -1) {
			i18n.setLocale(baseLanguage);
			AdvSettings.set('language', baseLanguage);
		} else {
			i18n.setLocale('en');
			AdvSettings.set('language', 'en');
		}
	} else {
		i18n.setLocale(preferredLanguage);
	}

	// This is a hack to translate non-templated UI elements.
	$('[data-translate]').each(function () {
		var $el = $(this);
		var key = $el.data('translate');

		if($el.is('input')) {
			$el.attr('placeholder', i18n.__(key));
		} else {
			$el.text(i18n.__(key));
		}
	});
};

// Remove unsupported subtitle language from object
App.Localization.filterSubtitle = function (langs) {
	var filteredLang = {};
	_.each(langs, function (data, lang) {
		var langInfo = App.Localization.langcodes[lang];
		if(langInfo && langInfo.subtitle) {
			filteredLang[lang] = data;
		}
	});

	return filteredLang;
};

App.Localization.allTranslations = ['en', 'ar', 'bg', 'ca', 'cs', 'da', 'de', 'el', 'es', 'eu', 'fi', 'fr', 'he', 'hr', 'hu', 'is', 'it', 'nl', 'no', 'pl', 'pt', 'pt-br', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk', 'zh-cn', 'zh-tw', 'sl', 'gl', 'si', 'az', 'th', 'vi'];

App.Localization.langcodes = {
	'ab': {
		name: 'Abkhaz',
		nativeName: 'аҧсуа'
	},
	'aa': {
		name: 'Afar',
		nativeName: 'Afaraf'
	},
	'af': {
		name: 'Afrikaans',
		nativeName: 'Afrikaans'
	},
	'ak': {
		name: 'Akan',
		nativeName: 'Akan'
	},
	'sq': {
		name: 'Albanian',
		nativeName: 'Shqip'
	},
	'am': {
		name: 'Amharic',
		nativeName: 'አማርኛ'
	},
	'ar': {
		name: 'Arabic',
		nativeName: 'العربية',
		subtitle: true,
		encoding: ['windows-1256'] // Tested
	},
	'an': {
		name: 'Aragonese',
		nativeName: 'Aragonés'
	},
	'hy': {
		name: 'Armenian',
		nativeName: 'Հայերեն'
	},
	'as': {
		name: 'Assamese',
		nativeName: 'অসমীয়া'
	},
	'av': {
		name: 'Avaric',
		nativeName: 'авар мацӀ'
	},
	'ae': {
		name: 'Avestan',
		nativeName: 'avesta'
	},
	'ay': {
		name: 'Aymara',
		nativeName: 'aymar aru'
	},
	'az': {
		name: 'Azerbaijani',
		nativeName: 'azərbaycan dili'
	},
	'bm': {
		name: 'Bambara',
		nativeName: 'bamanankan'
	},
	'ba': {
		name: 'Bashkir',
		nativeName: 'башҡорт теле'
	},
	'eu': {
		name: 'Basque',
		nativeName: 'Euskara',
		subtitle: true,
		encoding: ['iso-8859-1'] /** NEED TEST **/
	},
	'be': {
		name: 'Belarusian',
		nativeName: 'Беларуская'
	},
	'bn': {
		name: 'Bengali',
		nativeName: 'বাংলা'
	},
	'bh': {
		name: 'Bihari',
		nativeName: 'भोजपुरी'
	},
	'bi': {
		name: 'Bislama',
		nativeName: 'Bislama'
	},
	'bs': {
		name: 'Bosnian',
		nativeName: 'Bosanski jezik',
		subtitle: true,
		encoding: ['Windows-1250'] // Tested
	},
	'br': {
		name: 'Breton',
		nativeName: 'Brezhoneg'
	},
	'bg': {
		name: 'Bulgarian',
		nativeName: 'Български',
		subtitle: true,
		encoding: ['Windows-1251'] // Tested
	},
	'my': {
		name: 'Burmese',
		nativeName: 'ဗမာစာ'
	},
	'ca': {
		name: 'Catalan',
		nativeName: 'Català'
	},
	'ch': {
		name: 'Chamorro',
		nativeName: 'Chamoru'
	},
	'ce': {
		name: 'Chechen',
		nativeName: 'нохчийн мотт'
	},
	'ny': {
		name: 'Chichewa',
		nativeName: 'chiCheŵa'
	},
	'zh-cn': {
		name: 'Chinese (simplified)',
		nativeName: '简体中文'
	},
	'zh-tw': {
		name: 'Chinese (traditional)',
		nativeName: '正體中文'
	},
	'cv': {
		name: 'Chuvash',
		nativeName: 'чӑваш чӗлхи'
	},
	'kw': {
		name: 'Cornish',
		nativeName: 'Kernewek'
	},
	'co': {
		name: 'Corsican',
		nativeName: 'Corsu'
	},
	'cr': {
		name: 'Cree',
		nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ'
	},
	'hr': {
		name: 'Croatian',
		nativeName: 'hrvatski',
		subtitle: true,
		encoding: ['Windows-1250'] // Tested
	},
	'cs': {
		name: 'Czech',
		nativeName: 'Český',
		subtitle: true,
		encoding: ['iso-8859-2'] // Tested
	},
	'da': {
		name: 'Danish',
		nativeName: 'Dansk',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'dv': {
		name: 'Divehi',
		nativeName: 'ދިވެހި'
	},
	'nl': {
		name: 'Dutch',
		nativeName: 'Nederlands',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'en': {
		name: 'English',
		nativeName: 'English',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'eo': {
		name: 'Esperanto',
		nativeName: 'Esperanto'
	},
	'et': {
		name: 'Estonian',
		nativeName: 'Eesti',
		subtitle: true,
		encoding: ['iso-8859-4'] /** NEED TEST **/
	},
	'ee': {
		name: 'Ewe',
		nativeName: 'Eʋegbe'
	},
	'fo': {
		name: 'Faroese',
		nativeName: 'føroyskt'
	},
	'fj': {
		name: 'Fijian',
		nativeName: 'Vosa Vakaviti'
	},
	'fi': {
		name: 'Finnish',
		nativeName: 'Suomi',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'fr': {
		name: 'French',
		nativeName: 'Français',
		subtitle: true,
		encoding: ['Windows-1252'] // Tested
	},
	'ff': {
		name: 'Fula',
		nativeName: 'Fulfulde'
	},
	'gl': {
		name: 'Galician',
		nativeName: 'Galego'
	},
	'ka': {
		name: 'Georgian',
		nativeName: 'ქართული'
	},
	'de': {
		name: 'German',
		nativeName: 'Deutsch',
		subtitle: true,
		encoding: ['iso-8859-1'] /** NEED TEST **/
	},
	'el': {
		name: 'Modern Greek',
		nativeName: 'Ελληνικά',
		subtitle: true,
		encoding: ['Windows-1253'] // Tested
	},
	'gn': {
		name: 'Guaraní',
		nativeName: 'Avañeẽ'
	},
	'gu': {
		name: 'Gujarati',
		nativeName: 'ગુજરાતી'
	},
	'ht': {
		name: 'Haitian',
		nativeName: 'Kreyòl ayisyen'
	},
	'ha': {
		name: 'Hausa',
		nativeName: 'Hausa'
	},
	'he': {
		name: 'Hebrew (modern)',
		nativeName: 'עברית',
		subtitle: true,
		encoding: ['iso-8859-8'] // Tested
	},
	'hz': {
		name: 'Herero',
		nativeName: 'Otjiherero'
	},
	'hi': {
		name: 'Hindi',
		nativeName: 'हिन्दी'
	},
	'ho': {
		name: 'Hiri Motu',
		nativeName: 'Hiri Motu'
	},
	'hu': {
		name: 'Hungarian',
		nativeName: 'Magyar',
		subtitle: true,
		encoding: ['iso-8859-2'] // Tested
	},
	'ia': {
		name: 'Interlingua',
		nativeName: 'Interlingua'
	},
	'id': {
		name: 'Indonesian',
		nativeName: 'Bahasa Indonesia'
	},
	'ie': {
		name: 'Interlingue',
		nativeName: 'Interlingue'
	},
	'ga': {
		name: 'Irish',
		nativeName: 'Gaeilge'
	},
	'ig': {
		name: 'Igbo',
		nativeName: 'Asụsụ Igbo'
	},
	'ik': {
		name: 'Inupiaq',
		nativeName: 'Iñupiaq'
	},
	'io': {
		name: 'Ido',
		nativeName: 'Ido'
	},
	'is': {
		name: 'Icelandic',
		nativeName: 'Íslenska'
	},
	'it': {
		name: 'Italian',
		nativeName: 'Italiano',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'iu': {
		name: 'Inuktitut',
		nativeName: 'ᐃᓄᒃᑎᑐᑦ'
	},
	'ja': {
		name: 'Japanese',
		nativeName: '日本語'
	},
	'jv': {
		name: 'Javanese',
		nativeName: 'Basa Jawa'
	},
	'kl': {
		name: 'Kalaallisut',
		nativeName: 'Kalaallisut'
	},
	'kn': {
		name: 'Kannada',
		nativeName: 'ಕನ್ನಡ'
	},
	'kr': {
		name: 'Kanuri',
		nativeName: 'Kanuri'
	},
	'ks': {
		name: 'Kashmiri',
		nativeName: 'कश्मीरी'
	},
	'kk': {
		name: 'Kazakh',
		nativeName: 'Қазақ тілі'
	},
	'km': {
		name: 'Khmer',
		nativeName: 'ភាសាខ្មែរ'
	},
	'ki': {
		name: 'Kikuyu',
		nativeName: 'Gĩkũyũ'
	},
	'rw': {
		name: 'Kinyarwanda',
		nativeName: 'Ikinyarwanda'
	},
	'ky': {
		name: 'Kirghiz',
		nativeName: 'кыргыз тили'
	},
	'kv': {
		name: 'Komi',
		nativeName: 'коми кыв'
	},
	'kg': {
		name: 'Kongo',
		nativeName: 'KiKongo'
	},
	'ko': {
		name: 'Korean',
		nativeName: '한국어'
	},
	'ku': {
		name: 'Kurdish',
		nativeName: 'كوردی'
	},
	'kj': {
		name: 'Kwanyama',
		nativeName: 'Kuanyama'
	},
	'la': {
		name: 'Latin',
		nativeName: 'Latine'
	},
	'lb': {
		name: 'Luxembourgish',
		nativeName: 'Lëtzebuergesch'
	},
	'lg': {
		name: 'Luganda',
		nativeName: 'Luganda'
	},
	'li': {
		name: 'Limburgish',
		nativeName: 'Limburgs'
	},
	'ln': {
		name: 'Lingala',
		nativeName: 'Lingála'
	},
	'lo': {
		name: 'Lao',
		nativeName: 'ພາສາລາວ'
	},
	'lt': {
		name: 'Lithuanian',
		nativeName: 'lietuvių kalba',
		subtitle: true,
		encoding: ['iso-8859-4'] /** NEED TEST **/
	},
	'lu': {
		name: 'Luba-Katanga',
		nativeName: 'Kiluba'
	},
	'lv': {
		name: 'Latvian',
		nativeName: 'Latviešu valoda'
	},
	'gv': {
		name: 'Manx',
		nativeName: 'Gaelg'
	},
	'mk': {
		name: 'Macedonian',
		nativeName: 'македонски јазик'
	},
	'mg': {
		name: 'Malagasy',
		nativeName: 'Malagasy fiteny'
	},
	'ms': {
		name: 'Malay',
		nativeName: 'بهاس ملايو'
	},
	'ml': {
		name: 'Malayalam',
		nativeName: 'മലയാളം'
	},
	'mt': {
		name: 'Maltese',
		nativeName: 'Malti'
	},
	'mi': {
		name: 'Māori',
		nativeName: 'te reo Māori'
	},
	'mr': {
		name: 'Marathi (Marāṭhī)',
		nativeName: 'मराठी'
	},
	'mh': {
		name: 'Marshallese',
		nativeName: 'Kajin M̧ajeļ'
	},
	'mn': {
		name: 'Mongolian',
		nativeName: 'монгол'
	},
	'na': {
		name: 'Nauru',
		nativeName: 'Ekakairũ Naoero'
	},
	'nv': {
		name: 'Navajo',
		nativeName: 'Diné bizaad'
	},
	'nb': {
		name: 'Norwegian Bokmål',
		nativeName: 'Norsk bokmål'
	},
	'nd': {
		name: 'North Ndebele',
		nativeName: 'isiNdebele'
	},
	'ne': {
		name: 'Nepali',
		nativeName: 'नेपाली'
	},
	'ng': {
		name: 'Ndonga',
		nativeName: 'Owambo'
	},
	'nn': {
		name: 'Norwegian Nynorsk',
		nativeName: 'Norsk nynorsk'
	},
	'no': {
		name: 'Norwegian',
		nativeName: 'Norsk'
	},
	'ii': {
		name: 'Nuosu',
		nativeName: 'ꆈꌠ꒿ Nuosuhxop'
	},
	'nr': {
		name: 'South Ndebele',
		nativeName: 'isiNdebele'
	},
	'oc': {
		name: 'Occitan',
		nativeName: 'Occitan'
	},
	'oj': {
		name: 'Ojibwe',
		nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ'
	},
	'cu': {
		name: 'Church Slavonic',
		nativeName: 'ѩзыкъ словѣньскъ'
	},
	'om': {
		name: 'Oromo',
		nativeName: 'Afaan Oromoo'
	},
	'or': {
		name: 'Oriya',
		nativeName: 'ଓଡ଼ିଆ'
	},
	'os': {
		name: 'Ossetian',
		nativeName: 'ирон æвзаг'
	},
	'pa': {
		name: 'Panjabi',
		nativeName: 'ਪੰਜਾਬੀ'
	},
	'pi': {
		name: 'Pāli',
		nativeName: 'पाऴि'
	},
	'fa': {
		name: 'Persian',
		nativeName: 'فارسی',
		subtitle: true,
		encoding: ['Windows-1256'] // Tested
	},
	'pl': {
		name: 'Polish',
		nativeName: 'Polski',
		subtitle: true,
		encoding: ['Windows-1250'] // Tested
	},
	'ps': {
		name: 'Pashto',
		nativeName: 'پښتو'
	},
	'pt': {
		name: 'Portuguese',
		nativeName: 'Português',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'pt-br': {
		name: 'Portuguese (Brazil)',
		nativeName: 'Português (Brasil)',
		subtitle: true,
		encoding: ['iso-8859-1'] // Tested
	},
	'qu': {
		name: 'Quechua',
		nativeName: 'Runa Simi'
	},
	'rm': {
		name: 'Romansh',
		nativeName: 'rumantsch grischun'
	},
	'rn': {
		name: 'Kirundi',
		nativeName: 'kiRundi'
	},
	'ro': {
		name: 'Romanian',
		nativeName: 'română',
		subtitle: true,
		encoding: ['iso-8859-2'] // Tested
	},
	'ru': {
		name: 'Russian',
		nativeName: 'русский язык',
		subtitle: true,
		encoding: ['Windows-1251'] // Tested
	},
	'sa': {
		name: 'Sanskrit (Saṁskṛta)',
		nativeName: 'संस्कृतम्'
	},
	'sc': {
		name: 'Sardinian',
		nativeName: 'sardu'
	},
	'sd': {
		name: 'Sindhi',
		nativeName: 'سنڌي، سندھی'
	},
	'se': {
		name: 'Northern Sami',
		nativeName: 'Davvisámegiella'
	},
	'sm': {
		name: 'Samoan',
		nativeName: 'gagana faa Samoa'
	},
	'sg': {
		name: 'Sango',
		nativeName: 'yângâ tî sängö'
	},
	'sr': {
		name: 'Serbian',
		nativeName: 'српски језик',
		subtitle: true,
		encoding: ['Windows-1250'] // Tested
	},
	'gd': {
		name: 'Scottish Gaelic',
		nativeName: 'Gàidhlig'
	},
	'sn': {
		name: 'Shona',
		nativeName: 'chiShona'
	},
	'si': {
		name: 'Sinhala',
		nativeName: 'සිංහල'
	},
	'sk': {
		name: 'Slovak',
		nativeName: 'slovenčina'
	},
	'sl': {
		name: 'Slovene',
		nativeName: 'slovenščina',
		subtitle: true,
		encoding: ['windows-1250'] // Tested
	},
	'so': {
		name: 'Somali',
		nativeName: 'Soomaaliga'
	},
	'st': {
		name: 'Southern Sotho',
		nativeName: 'Sesotho'
	},
	'es': {
		name: 'Spanish',
		nativeName: 'Español',
		subtitle: true,
		encoding: ['iso-8859-1'], // Tested
		keywords: ['@TSF', 'aRGENTeaM']
	},
	'su': {
		name: 'Sundanese',
		nativeName: 'Basa Sunda'
	},
	'sw': {
		name: 'Swahili',
		nativeName: 'Kiswahili'
	},
	'ss': {
		name: 'Swati',
		nativeName: 'SiSwati'
	},
	'sv': {
		name: 'Swedish',
		nativeName: 'svenska'
	},
	'ta': {
		name: 'Tamil',
		nativeName: 'தமிழ்'
	},
	'te': {
		name: 'Telugu',
		nativeName: 'తెలుగు'
	},
	'tg': {
		name: 'Tajik',
		nativeName: 'тоҷикӣ'
	},
	'th': {
		name: 'Thai',
		nativeName: 'ไทย',
		subtitle: true,
		encoding: ['windows-874', 'iso-8859-11']
	},
	'ti': {
		name: 'Tigrinya',
		nativeName: 'ትግርኛ'
	},
	'bo': {
		name: 'Tibetan',
		nativeName: 'བོད་ཡིག'
	},
	'tk': {
		name: 'Turkmen',
		nativeName: 'Türkmen'
	},
	'tl': {
		name: 'Tagalog',
		nativeName: 'Wikang Tagalog'
	},
	'tn': {
		name: 'Tswana',
		nativeName: 'Setswana'
	},
	'to': {
		name: 'Tonga',
		nativeName: 'faka Tonga'
	},
	'tr': {
		name: 'Turkish',
		nativeName: 'Türkçe',
		subtitle: true,
		encoding: ['iso-8859-9'] // Tested
	},
	'ts': {
		name: 'Tsonga',
		nativeName: 'Xitsonga'
	},
	'tt': {
		name: 'Tatar',
		nativeName: 'татарча'
	},
	'tw': {
		name: 'Twi',
		nativeName: 'Twi'
	},
	'ty': {
		name: 'Tahitian',
		nativeName: 'Reo Tahiti'
	},
	'ug': {
		name: 'Uighur',
		nativeName: 'ئۇيغۇرچە'
	},
	'uk': {
		name: 'Ukrainian',
		nativeName: 'українська',
		subtitle: true,
		encoding: ['iso-8859-5'] /** NEED TEST **/
	},
	'ur': {
		name: 'Urdu',
		nativeName: 'اردو'
	},
	'uz': {
		name: 'Uzbek',
		nativeName: 'Oʻzbek'
	},
	've': {
		name: 'Venda',
		nativeName: 'Tshivenḓa'
	},
	'vi': {
		name: 'Vietnamese',
		nativeName: 'Tiếng Việt'
	},
	'vo': {
		name: 'Volapük',
		nativeName: 'Volapük'
	},
	'wa': {
		name: 'Walloon',
		nativeName: 'Walon'
	},
	'cy': {
		name: 'Welsh',
		nativeName: 'Cymraeg'
	},
	'wo': {
		name: 'Wolof',
		nativeName: 'Wollof'
	},
	'fy': {
		name: 'Western Frisian',
		nativeName: 'Frysk'
	},
	'xh': {
		name: 'Xhosa',
		nativeName: 'isiXhosa'
	},
	'yi': {
		name: 'Yiddish',
		nativeName: 'ייִדיש'
	},
	'yo': {
		name: 'Yoruba',
		nativeName: 'Yorùbá'
	},
	'za': {
		name: 'Zhuang',
		nativeName: 'Saɯ cueŋƅ'
	},
	'zh': {
		name: 'Chinese',
		nativeName: '中文',
		subtitle: false,
		encoding: ['GB18030'] /** CANT FIND A PROPER ENCODING. Tested: UTF8/UTF16/CP936/GB2312/GB2313/GB18030/Windows936/Big5 **/
	}
};

// Handles language detection and internationalization
i18n.configure({
	defaultLocale: 'en',
	locales: App.Localization.allTranslations,
	directory: './src/app/language'
});
