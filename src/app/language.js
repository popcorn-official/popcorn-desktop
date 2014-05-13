// Detect the language and update the global Language file

var detectLanguage = function(preferredLanguage) {

    var fs = require('fs');
    // The full OS language (with localization, like "en-uk")
    var pureLanguage = navigator.language.toLowerCase();
    // The global language name (without localization, like "en")
    var baseLanguage = navigator.language.toLowerCase().slice(0,2);

    if (!preferredLanguage) {
        // we are stillon default
        if( $.inArray(pureLanguage, App.Localization.allTranslations) != -1 ) {
            i18n.setLocale(pureLanguage);
            AdvSettings.set('language', pureLanguage);
        }
        else if( $.inArray(baseLanguage, App.Localization.allTranslations) != -1 ) {
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
    $('[data-translate]').each(function(){
        var $el = $(this);
        var key = $el.data('translate');

        if( $el.is('input') ) {
            $el.attr('placeholder', i18n.__(key));
        } else {
            $el.text(i18n.__(key));
        }
    });
};


// Remove unsupported subtitle language from object
App.Localization.filterSubtitle = function(langs) {
    var filteredLang = {};
    _.each(langs, function(data, lang){
        var langInfo = App.Localization.languages[lang];
        if(langInfo && langInfo.subtitle) {
            filteredLang[lang] = data;
        }
    });

    return filteredLang;
};

App.Localization.allTranslations = ['en','ar','bg','ca','cs','da','de','el','es','eu','fi','fr','he','hu','is','it','nl','no','pl','pt','pt-br','ro','ru','sk','sv','tr','uk','zh-cn','zh-tw','sl','gl','si','az'];

// Simple mapping to translate some API language to ISO 639 code
App.Localization.languageMapping = {
    "albanian": "sq",
    "arabic": "ar",
    "bengali": "bn",
    "brazilian-portuguese": "pt-br",
    "bulgarian": "bg",
    "bosnian": "bs",
    "chinese": "zh",
    "croatian": "hr",
    "czech": "cs",
    "danish": "da",
    "dutch": "nl",
    "english": "en",
    "estonian": "et",
    "farsi-persian": "fa",
    "finnish": "fi",
    "french": "fr",
    "german": "de",
    "greek": "el",
    "hebrew": "he",
    "hungarian": "hu",
    "indonesian": "id",
    "italian": "it",
    "japanese": "ja",
    "korean": "ko",
    "lithuanian": "lt",
    "macedonian": "mk",
    "malay": "ms",
    "norwegian": "no",
    "polish": "pl",
    "portuguese": "pt",
    "romanian": "ro",
    "russian": "ru",
    "serbian": "sr",
    "slovenian": "sl",
    "spanish": "es",
    "swedish": "sv",
    "thai": "th",
    "turkish": "tr",
    "urdu": "ur",
    "ukrainian": "uk",
    "vietnamese": "vi"
};

// Language used in the system, edit to add subtitle support
App.Localization.languages = {
    "ar": {
        encoding: ['windows-1256']
    },
    "bg": {
        subtitle: true,
        encoding: ['windows-1251', 'iso-8859-5']
    },
    "bn": {},
    "bs": {
        subtitle: true,
        encoding: ['windows-1250'],
        translation: false
    },
    "ca": {},
    "cs": {
        subtitle: true
    },
    "da": {
        subtitle: true
    },
    "de": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "el": {
        subtitle: true,
        encoding: ['windows-1253', 'iso-8859-7']
    },
    "en": {
        subtitle: true
    },
    "es": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "et": {
        subtitle: true,
        translation: false
    },
    "eu": {
    	subtitle: true,
        encoding: ['iso-8859-1']
    },
    "fa": {},
    "fi": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "fr": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "he": {
        subtitle: true,
        encoding: ['windows-1255']
    },
    "hr": {
        subtitle: true,
        encoding: ['windows-1250']
    },
    "hu": {
        subtitle: true,
        encoding: ['iso-8859-2']
    },
    "is": {},
    "it": {
        subtitle: true
    },
    "ja": {},
    "kr": {},
    "lt": {
        subtitle: true
    },
    "lv": {},
    "mt": {},
    "nl": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "no": {},
    "pl": {
        subtitle: true
    },
    "pt": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "pt-br": {
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "ro": {
        subtitle: true,
        encoding: ['iso-8859-16']
    },
    "ru": {
        encoding: ['windows-1251', 'iso-8859-5']
    },
    "sk": {},
    "sl": {
        subtitle: true,
        encoding: ['windows-1250'],
        translation: false
    },
    "sr": {
        subtitle: true,
        encoding: ['windows-1250'],
        translation: false
    },
    "sv": {},
    "tr": {
        subtitle: true,
        encoding: ['iso-8859-9']
    },
    "uk": {
        encoding: ['windows-1251', 'iso-8859-5']
    },
    "zh": {
        display: "中文",
        subtitle: true
    },
    "zh-cn": {},
    "zh-tw": {}

};

App.Localization.langcodes = {
	"ab":{
		"name":"Abkhaz",
		"nativeName":"аҧсуа"
	},
	"aa":{
		"name":"Afar",
		"nativeName":"Afaraf"
	},
	"af":{
		"name":"Afrikaans",
		"nativeName":"Afrikaans"
	},
	"ak":{
		"name":"Akan",
		"nativeName":"Akan"
	},
	"sq":{
		"name":"Albanian",
		"nativeName":"Shqip"
	},
	"am":{
		"name":"Amharic",
		"nativeName":"አማርኛ"
	},
	"ar":{
		"name":"Arabic",
		"nativeName":"العربية"
	},
	"an":{
		"name":"Aragonese",
		"nativeName":"Aragonés"
	},
	"hy":{
		"name":"Armenian",
		"nativeName":"Հայերեն"
	},
	"as":{
		"name":"Assamese",
		"nativeName":"অসমীয়া"
	},
	"av":{
		"name":"Avaric",
		"nativeName":"авар мацӀ"
	},
	"ae":{
		"name":"Avestan",
		"nativeName":"avesta"
	},
	"ay":{
		"name":"Aymara",
		"nativeName":"aymar aru"
	},
	"az":{
		"name":"Azerbaijani",
		"nativeName":"azərbaycan dili"
	},
	"bm":{
		"name":"Bambara",
		"nativeName":"bamanankan"
	},
	"ba":{
		"name":"Bashkir",
		"nativeName":"башҡорт теле"
	},
	"eu":{
		"name":"Basque",
		"nativeName":"Euskara"
	},
	"be":{
		"name":"Belarusian",
		"nativeName":"Беларуская"
	},
	"bn":{
		"name":"Bengali",
		"nativeName":"বাংলা"
	},
	"bh":{
		"name":"Bihari",
		"nativeName":"भोजपुरी"
	},
	"bi":{
		"name":"Bislama",
		"nativeName":"Bislama"
	},
	"bs":{
		"name":"Bosnian",
		"nativeName":"Bosanski jezik"
	},
	"br":{
		"name":"Breton",
		"nativeName":"Brezhoneg"
	},
	"bg":{
		"name":"Bulgarian",
		"nativeName":"български език"
	},
	"my":{
		"name":"Burmese",
		"nativeName":"ဗမာစာ"
	},
	"ca":{
		"name":"Catalan",
		"nativeName":"Català"
	},
	"ch":{
		"name":"Chamorro",
		"nativeName":"Chamoru"
	},
	"ce":{
		"name":"Chechen",
		"nativeName":"нохчийн мотт"
	},
	"ny":{
		"name":"Chichewa",
		"nativeName":"chiCheŵa"
	},
	"zh":{
		"name":"Chinese",
		"nativeName":"中文"
	},
	"zh-cn":{
		"name":"Chinese (simplified)",
		"nativeName":"简体中文"
	},
	"zh-tw":{
		"name":"Chinese (traditional)",
		"nativeName":"正體中文"
	},
	"cv":{
		"name":"Chuvash",
		"nativeName":"чӑваш чӗлхи"
	},
	"kw":{
		"name":"Cornish",
		"nativeName":"Kernewek"
	},
	"co":{
		"name":"Corsican",
		"nativeName":"Corsu"
	},
	"cr":{
		"name":"Cree",
		"nativeName":"ᓀᐦᐃᔭᐍᐏᐣ"
	},
	"hr":{
		"name":"Croatian",
		"nativeName":"hrvatski"
	},
	"cs":{
		"name":"Czech",
		"nativeName":"Český"
	},
	"da":{
		"name":"Danish",
		"nativeName":"Dansk"
	},
	"dv":{
		"name":"Divehi",
		"nativeName":"ދިވެހި"
	},
	"nl":{
		"name":"Dutch",
		"nativeName":"Nederlands"
	},
	"en":{
		"name":"English",
		"nativeName":"English"
	},
	"eo":{
		"name":"Esperanto",
		"nativeName":"Esperanto"
	},
	"et":{
		"name":"Estonian",
		"nativeName":"Eesti"
	},
	"ee":{
		"name":"Ewe",
		"nativeName":"Eʋegbe"
	},
	"fo":{
		"name":"Faroese",
		"nativeName":"føroyskt"
	},
	"fj":{
		"name":"Fijian",
		"nativeName":"Vosa Vakaviti"
	},
	"fi":{
		"name":"Finnish",
		"nativeName":"Suomi"
	},
	"fr":{
		"name":"French",
		"nativeName":"Français"
	},
	"ff":{
		"name":"Fula",
		"nativeName":"Fulfulde"
	},
	"gl":{
		"name":"Galician",
		"nativeName":"Galego"
	},
	"ka":{
		"name":"Georgian",
		"nativeName":"ქართული"
	},
	"de":{
		"name":"German",
		"nativeName":"Deutsch"
	},
	"el":{
		"name":"Modern Greek",
		"nativeName":"Ελληνικά"
	},
	"gn":{
		"name":"Guaraní",
		"nativeName":"Avañeẽ"
	},
	"gu":{
		"name":"Gujarati",
		"nativeName":"ગુજરાતી"
	},
	"ht":{
		"name":"Haitian",
		"nativeName":"Kreyòl ayisyen"
	},
	"ha":{
		"name":"Hausa",
		"nativeName":"Hausa"
	},
	"he":{
		"name":"Hebrew (modern)",
		"nativeName":"עברית"
	},
	"hz":{
		"name":"Herero",
		"nativeName":"Otjiherero"
	},
	"hi":{
		"name":"Hindi",
		"nativeName":"हिन्दी"
	},
	"ho":{
		"name":"Hiri Motu",
		"nativeName":"Hiri Motu"
	},
	"hu":{
		"name":"Hungarian",
		"nativeName":"Magyar"
	},
	"ia":{
		"name":"Interlingua",
		"nativeName":"Interlingua"
	},
	"id":{
		"name":"Indonesian",
		"nativeName":"Bahasa Indonesia"
	},
	"ie":{
		"name":"Interlingue",
		"nativeName":"Interlingue"
	},
	"ga":{
		"name":"Irish",
		"nativeName":"Gaeilge"
	},
	"ig":{
		"name":"Igbo",
		"nativeName":"Asụsụ Igbo"
	},
	"ik":{
		"name":"Inupiaq",
		"nativeName":"Iñupiaq"
	},
	"io":{
		"name":"Ido",
		"nativeName":"Ido"
	},
	"is":{
		"name":"Icelandic",
		"nativeName":"Íslenska"
	},
	"it":{
		"name":"Italian",
		"nativeName":"Italiano"
	},
	"iu":{
		"name":"Inuktitut",
		"nativeName":"ᐃᓄᒃᑎᑐᑦ"
	},
	"ja":{
		"name":"Japanese",
		"nativeName":"日本語"
	},
	"jv":{
		"name":"Javanese",
		"nativeName":"Basa Jawa"
	},
	"kl":{
		"name":"Kalaallisut",
		"nativeName":"Kalaallisut"
	},
	"kn":{
		"name":"Kannada",
		"nativeName":"ಕನ್ನಡ"
	},
	"kr":{
		"name":"Kanuri",
		"nativeName":"Kanuri"
	},
	"ks":{
		"name":"Kashmiri",
		"nativeName":"कश्मीरी"
	},
	"kk":{
		"name":"Kazakh",
		"nativeName":"Қазақ тілі"
	},
	"km":{
		"name":"Khmer",
		"nativeName":"ភាសាខ្មែរ"
	},
	"ki":{
		"name":"Kikuyu",
		"nativeName":"Gĩkũyũ"
	},
	"rw":{
		"name":"Kinyarwanda",
		"nativeName":"Ikinyarwanda"
	},
	"ky":{
		"name":"Kirghiz",
		"nativeName":"кыргыз тили"
	},
	"kv":{
		"name":"Komi",
		"nativeName":"коми кыв"
	},
	"kg":{
		"name":"Kongo",
		"nativeName":"KiKongo"
	},
	"ko":{
		"name":"Korean",
		"nativeName":"한국어"
	},
	"ku":{
		"name":"Kurdish",
		"nativeName":"كوردی‎"
	},
	"kj":{
		"name":"Kwanyama",
		"nativeName":"Kuanyama"
	},
	"la":{
		"name":"Latin",
		"nativeName":"Latine"
	},
	"lb":{
		"name":"Luxembourgish",
		"nativeName":"Lëtzebuergesch"
	},
	"lg":{
		"name":"Luganda",
		"nativeName":"Luganda"
	},
	"li":{
		"name":"Limburgish",
		"nativeName":"Limburgs"
	},
	"ln":{
		"name":"Lingala",
		"nativeName":"Lingála"
	},
	"lo":{
		"name":"Lao",
		"nativeName":"ພາສາລາວ"
	},
	"lt":{
		"name":"Lithuanian",
		"nativeName":"lietuvių kalba"
	},
	"lu":{
		"name":"Luba-Katanga",
		"nativeName":"Kiluba"
	},
	"lv":{
		"name":"Latvian",
		"nativeName":"Latviešu valoda"
	},
	"gv":{
		"name":"Manx",
		"nativeName":"Gaelg"
	},
	"mk":{
		"name":"Macedonian",
		"nativeName":"македонски јазик"
	},
	"mg":{
		"name":"Malagasy",
		"nativeName":"Malagasy fiteny"
	},
	"ms":{
		"name":"Malay",
		"nativeName":"بهاس ملايو‎"
	},
	"ml":{
		"name":"Malayalam",
		"nativeName":"മലയാളം"
	},
	"mt":{
		"name":"Maltese",
		"nativeName":"Malti"
	},
	"mi":{
		"name":"Māori",
		"nativeName":"te reo Māori"
	},
	"mr":{
		"name":"Marathi (Marāṭhī)",
		"nativeName":"मराठी"
	},
	"mh":{
		"name":"Marshallese",
		"nativeName":"Kajin M̧ajeļ"
	},
	"mn":{
		"name":"Mongolian",
		"nativeName":"монгол"
	},
	"na":{
		"name":"Nauru",
		"nativeName":"Ekakairũ Naoero"
	},
	"nv":{
		"name":"Navajo",
		"nativeName":"Diné bizaad"
	},
	"nb":{
		"name":"Norwegian Bokmål",
		"nativeName":"Norsk bokmål"
	},
	"nd":{
		"name":"North Ndebele",
		"nativeName":"isiNdebele"
	},
	"ne":{
		"name":"Nepali",
		"nativeName":"नेपाली"
	},
	"ng":{
		"name":"Ndonga",
		"nativeName":"Owambo"
	},
	"nn":{
		"name":"Norwegian Nynorsk",
		"nativeName":"Norsk nynorsk"
	},
	"no":{
		"name":"Norwegian",
		"nativeName":"Norsk"
	},
	"ii":{
		"name":"Nuosu",
		"nativeName":"ꆈꌠ꒿ Nuosuhxop"
	},
	"nr":{
		"name":"South Ndebele",
		"nativeName":"isiNdebele"
	},
	"oc":{
		"name":"Occitan",
		"nativeName":"Occitan"
	},
	"oj":{
		"name":"Ojibwe",
		"nativeName":"ᐊᓂᔑᓈᐯᒧᐎᓐ"
	},
	"cu":{
		"name":"Church Slavonic",
		"nativeName":"ѩзыкъ словѣньскъ"
	},
	"om":{
		"name":"Oromo",
		"nativeName":"Afaan Oromoo"
	},
	"or":{
		"name":"Oriya",
		"nativeName":"ଓଡ଼ିଆ"
	},
	"os":{
		"name":"Ossetian",
		"nativeName":"ирон æвзаг"
	},
	"pa":{
		"name":"Panjabi",
		"nativeName":"ਪੰਜਾਬੀ"
	},
	"pi":{
		"name":"Pāli",
		"nativeName":"पाऴि"
	},
	"fa":{
		"name":"Persian",
		"nativeName":"فارسی"
	},
	"pl":{
		"name":"Polish",
		"nativeName":"polski"
	},
	"ps":{
		"name":"Pashto",
		"nativeName":"پښتو"
	},
	"pt":{
		"name":"Portuguese",
		"nativeName":"Português"
	},
	"pb":{
		"name":"Portuguese (Brazil)",
		"nativeName":"Português (Brasil)"
	},
	"pt-br":{
		"name":"Portuguese (Brazil)",
		"nativeName":"Português (Brasil)"
	},
	"qu":{
		"name":"Quechua",
		"nativeName":"Runa Simi"
	},
	"rm":{
		"name":"Romansh",
		"nativeName":"rumantsch grischun"
	},
	"rn":{
		"name":"Kirundi",
		"nativeName":"kiRundi"
	},
	"ro":{
		"name":"Romanian",
		"nativeName":"română"
	},
	"ru":{
		"name":"Russian",
		"nativeName":"русский язык"
	},
	"sa":{
		"name":"Sanskrit (Saṁskṛta)",
		"nativeName":"संस्कृतम्"
	},
	"sc":{
		"name":"Sardinian",
		"nativeName":"sardu"
	},
	"sd":{
		"name":"Sindhi",
		"nativeName":"سنڌي، سندھی‎"
	},
	"se":{
		"name":"Northern Sami",
		"nativeName":"Davvisámegiella"
	},
	"sm":{
		"name":"Samoan",
		"nativeName":"gagana faa Samoa"
	},
	"sg":{
		"name":"Sango",
		"nativeName":"yângâ tî sängö"
	},
	"sr":{
		"name":"Serbian",
		"nativeName":"српски језик"
	},
	"gd":{
		"name":"Scottish Gaelic",
		"nativeName":"Gàidhlig"
	},
	"sn":{
		"name":"Shona",
		"nativeName":"chiShona"
	},
	"si":{
		"name":"Sinhala",
		"nativeName":"සිංහල"
	},
	"sk":{
		"name":"Slovak",
		"nativeName":"slovenčina"
	},
	"sl":{
		"name":"Slovene",
		"nativeName":"slovenščina"
	},
	"so":{
		"name":"Somali",
		"nativeName":"Soomaaliga"
	},
	"st":{
		"name":"Southern Sotho",
		"nativeName":"Sesotho"
	},
	"es":{
		"name":"Spanish",
		"nativeName":"Español"
	},
	"su":{
		"name":"Sundanese",
		"nativeName":"Basa Sunda"
	},
	"sw":{
		"name":"Swahili",
		"nativeName":"Kiswahili"
	},
	"ss":{
		"name":"Swati",
		"nativeName":"SiSwati"
	},
	"sv":{
		"name":"Swedish",
		"nativeName":"svenska"
	},
	"ta":{
		"name":"Tamil",
		"nativeName":"தமிழ்"
	},
	"te":{
		"name":"Telugu",
		"nativeName":"తెలుగు"
	},
	"tg":{
		"name":"Tajik",
		"nativeName":"тоҷикӣ‎"
	},
	"th":{
		"name":"Thai",
		"nativeName":"ไทย"
	},
	"ti":{
		"name":"Tigrinya",
		"nativeName":"ትግርኛ"
	},
	"bo":{
		"name":"Tibetan",
		"nativeName":"བོད་ཡིག"
	},
	"tk":{
		"name":"Turkmen",
		"nativeName":"Türkmen"
	},
	"tl":{
		"name":"Tagalog",
		"nativeName":"Wikang Tagalog"
	},
	"tn":{
		"name":"Tswana",
		"nativeName":"Setswana"
	},
	"to":{
		"name":"Tonga",
		"nativeName":"faka Tonga"
	},
	"tr":{
		"name":"Turkish",
		"nativeName":"Türkçe"
	},
	"ts":{
		"name":"Tsonga",
		"nativeName":"Xitsonga"
	},
	"tt":{
		"name":"Tatar",
		"nativeName":"татарча‎"
	},
	"tw":{
		"name":"Twi",
		"nativeName":"Twi"
	},
	"ty":{
		"name":"Tahitian",
		"nativeName":"Reo Tahiti"
	},
	"ug":{
		"name":"Uighur",
		"nativeName":"ئۇيغۇرچە‎"
	},
	"uk":{
		"name":"Ukrainian",
		"nativeName":"українська"
	},
	"ur":{
		"name":"Urdu",
		"nativeName":"اردو"
	},
	"uz":{
		"name":"Uzbek",
		"nativeName":"Oʻzbek‎"
	},
	"ve":{
		"name":"Venda",
		"nativeName":"Tshivenḓa"
	},
	"vi":{
		"name":"Vietnamese",
		"nativeName":"Tiếng Việt"
	},
	"vo":{
		"name":"Volapük",
		"nativeName":"Volapük"
	},
	"wa":{
		"name":"Walloon",
		"nativeName":"Walon"
	},
	"cy":{
		"name":"Welsh",
		"nativeName":"Cymraeg"
	},
	"wo":{
		"name":"Wolof",
		"nativeName":"Wollof"
	},
	"fy":{
		"name":"Western Frisian",
		"nativeName":"Frysk"
	},
	"xh":{
		"name":"Xhosa",
		"nativeName":"isiXhosa"
	},
	"yi":{
		"name":"Yiddish",
		"nativeName":"ייִדיש"
	},
	"yo":{
		"name":"Yoruba",
		"nativeName":"Yorùbá"
	},
	"za":{
		"name":"Zhuang",
		"nativeName":"Saɯ cueŋƅ"
	}
};

// Handles language detection and internationalization
i18n.configure({
    defaultLocale: 'en',
    locales: App.Localization.allTranslations,
    directory: './src/app/language'
});
