// Detect the language and update the global Language file
var setLanguage = function (preferredLanguage) {

    if (!preferredLanguage) {
        // we are still on default
        var lang = App.Localization.detectLocale();
        i18n.setLocale(lang);
        AdvSettings.set('language', lang);
    } else {
        i18n.setLocale(preferredLanguage);
    }

    // This is a hack to translate non-templated UI elements.
    $('[data-translate]').each(function () {
        var $el = $(this);
        var key = $el.data('translate');

        if ($el.is('input')) {
            $el.attr('placeholder', i18n.__(key));
        } else {
            $el.text(i18n.__(key));
        }
    });
};

App.Localization.detectLocale = function () {

    var fs = require('fs');
    // The full OS language (with localization, like 'en-uk')
    var pureLanguage = navigator.language.toLowerCase();
    // The global language name (without localization, like 'en')
    var baseLanguage = navigator.language.toLowerCase().slice(0, 2);

    if ($.inArray(pureLanguage, App.Localization.allTranslations) !== -1) {
        return pureLanguage;
    } else if ($.inArray(baseLanguage, App.Localization.allTranslations) !== -1) {
        return baseLanguage;
    } else {
        return 'en';
    }
};

// Remove unsupported subtitle language from object
App.Localization.filterSubtitle = function (langs) {
    var filteredLang = {};
    _.each(langs, function (data, lang) {
        var langInfo = App.Localization.langcodes[lang];
        if (langInfo && langInfo.subtitle) {
            filteredLang[lang] = data;
        }
    });

    return filteredLang;
};

App.Localization.allTranslations = ['en', 'ar', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'es', 'es-mx', 'et', 'eu', 'fa', 'fi', 'fr', 'gl', 'he', 'hr', 'hu', 'id', 'it', 'ko', 'lt', 'mk', 'ms', 'nb', 'nl', 'nn', 'pl', 'pt', 'pt-br', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'tr', 'zh-cn', 'zh-tw'];

App.Localization.langcodes = {
    'aa': {
        name: 'Afar',
        nativeName: 'Afaraf'
    },
    'ab': {
        name: 'Abkhaz',
        nativeName: 'аҧсуа'
    },
    'ae': {
        name: 'Avestan',
        nativeName: 'avesta'
    },
    'af': {
        name: 'Afrikaans',
        nativeName: 'Afrikaans'
    },
    'ak': {
        name: 'Akan',
        nativeName: 'Akan'
    },
    'am': {
        name: 'Amharic',
        nativeName: 'አማርኛ'
    },
    'an': {
        name: 'Aragonese',
        nativeName: 'Aragonés'
    },
    'ar': {
        name: 'Arabic',
        nativeName: 'العربية',
        subtitle: true,
        encoding: ['windows-1256'] // Tested
    },
    'as': {
        name: 'Assamese',
        nativeName: 'অসমীয়া'
    },
    'av': {
        name: 'Avaric',
        nativeName: 'авар мацӀ'
    },
    'ay': {
        name: 'Aymara',
        nativeName: 'aymar aru'
    },
    'az': {
        name: 'Azerbaijani',
        nativeName: 'azərbaycan dili'
    },
    'ba': {
        name: 'Bashkir',
        nativeName: 'башҡорт теле'
    },
    'be': {
        name: 'Belarusian',
        nativeName: 'Беларуская'
    },
    'bg': {
        name: 'Bulgarian',
        nativeName: 'Български',
        subtitle: true,
        encoding: ['Windows-1251'] // Tested
    },
    'bh': {
        name: 'Bihari',
        nativeName: 'भोजपुरी'
    },
    'bi': {
        name: 'Bislama',
        nativeName: 'Bislama'
    },
    'bm': {
        name: 'Bambara',
        nativeName: 'bamanankan'
    },
    'bn': {
        name: 'Bengali',
        nativeName: 'বাংলা'
    },
    'bo': {
        name: 'Tibetan',
        nativeName: 'བོད་ཡིག'
    },
    'br': {
        name: 'Breton',
        nativeName: 'Brezhoneg'
    },
    'bs': {
        name: 'Bosnian',
        nativeName: 'Bosanski jezik',
        subtitle: true,
        encoding: ['Windows-1250'] // Tested
    },
    'ca': {
        name: 'Catalan',
        nativeName: 'Català'
    },
    'ce': {
        name: 'Chechen',
        nativeName: 'нохчийн мотт'
    },
    'ch': {
        name: 'Chamorro',
        nativeName: 'Chamoru'
    },
    'co': {
        name: 'Corsican',
        nativeName: 'Corsu'
    },
    'cr': {
        name: 'Cree',
        nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ'
    },
    'cs': {
        name: 'Czech',
        nativeName: 'Český',
        subtitle: true,
        encoding: ['iso-8859-2'] // Tested
    },
    'cu': {
        name: 'Church Slavonic',
        nativeName: 'ѩзыкъ словѣньскъ'
    },
    'cv': {
        name: 'Chuvash',
        nativeName: 'чӑваш чӗлхи'
    },
    'cy': {
        name: 'Welsh',
        nativeName: 'Cymraeg'
    },
    'da': {
        name: 'Danish',
        nativeName: 'Dansk',
        subtitle: true,
        encoding: ['iso-8859-1'] // Tested
    },
    'de': {
        name: 'German',
        nativeName: 'Deutsch',
        subtitle: true,
        encoding: ['iso-8859-1'] /** NEED TEST **/
    },
    'dv': {
        name: 'Divehi',
        nativeName: 'ދިވެހި'
    },
    'ee': {
        name: 'Ewe',
        nativeName: 'Eʋegbe'
    },
    'el': {
        name: 'Modern Greek',
        nativeName: 'Ελληνικά',
        subtitle: true,
        encoding: ['Windows-1253'] // Tested
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
    'es': {
        name: 'Spanish',
        nativeName: 'Español',
        subtitle: true,
        encoding: ['iso-8859-1'], // Tested
        keywords: ['@TSF', 'aRGENTeaM']
    },
    'es-ar': {
        name: 'Spanish (Argentina)',
        nativeName: 'Español (Argentina)'
    },
    'es-mx': {
        name: 'Spanish (Mexico)',
        nativeName: 'Español (México)'
    },
    'et': {
        name: 'Estonian',
        nativeName: 'Eesti',
        subtitle: true,
        encoding: ['iso-8859-4'] /** NEED TEST **/
    },
    'eu': {
        name: 'Basque',
        nativeName: 'Euskara',
        subtitle: true,
        encoding: ['iso-8859-1'] /** NEED TEST **/
    },
    'fa': {
        name: 'Persian',
        nativeName: 'فارسی',
        subtitle: true,
        encoding: ['Windows-1256'] // Tested
    },
    'ff': {
        name: 'Fula',
        nativeName: 'Fulfulde'
    },
    'fi': {
        name: 'Finnish',
        nativeName: 'Suomi',
        subtitle: true,
        encoding: ['iso-8859-1'] // Tested
    },
    'fj': {
        name: 'Fijian',
        nativeName: 'Vosa Vakaviti'
    },
    'fo': {
        name: 'Faroese',
        nativeName: 'føroyskt'
    },
    'fr': {
        name: 'French',
        nativeName: 'Français',
        subtitle: true,
        encoding: ['Windows-1252'] // Tested
    },
    'fy': {
        name: 'Western Frisian',
        nativeName: 'Frysk'
    },
    'ga': {
        name: 'Irish',
        nativeName: 'Gaeilge'
    },
    'gd': {
        name: 'Scottish Gaelic',
        nativeName: 'Gàidhlig'
    },
    'gl': {
        name: 'Galician',
        nativeName: 'Galego'
    },
    'gn': {
        name: 'Guaraní',
        nativeName: 'Avañeẽ'
    },
    'gu': {
        name: 'Gujarati',
        nativeName: 'ગુજરાતી'
    },
    'gv': {
        name: 'Manx',
        nativeName: 'Gaelg'
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
    'hi': {
        name: 'Hindi',
        nativeName: 'हिन्दी'
    },
    'ho': {
        name: 'Hiri Motu',
        nativeName: 'Hiri Motu'
    },
    'hr': {
        name: 'Croatian',
        nativeName: 'Hrvatski',
        subtitle: true,
        encoding: ['Windows-1250'] // Tested
    },
    'ht': {
        name: 'Haitian',
        nativeName: 'Kreyòl ayisyen'
    },
    'hu': {
        name: 'Hungarian',
        nativeName: 'Magyar',
        subtitle: true,
        encoding: ['iso-8859-2'] // Tested
    },
    'hy': {
        name: 'Armenian',
        nativeName: 'Հայերեն'
    },
    'hz': {
        name: 'Herero',
        nativeName: 'Otjiherero'
    },
    'ia': {
        name: 'Interlingua',
        nativeName: 'Interlingua'
    },
    'id': {
        name: 'Indonesian',
        nativeName: 'Bahasa Indonesia',
        subtitle: true,
        encoding: ['UTF8'] /** NEED TEST **/
    },
    'ie': {
        name: 'Interlingue',
        nativeName: 'Interlingue'
    },
    'ig': {
        name: 'Igbo',
        nativeName: 'Asụsụ Igbo'
    },
    'ii': {
        name: 'Nuosu',
        nativeName: 'ꆈꌠ꒿ Nuosuhxop'
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
    'ka': {
        name: 'Georgian',
        nativeName: 'ქართული'
    },
    'kg': {
        name: 'Kongo',
        nativeName: 'KiKongo'
    },
    'ki': {
        name: 'Kikuyu',
        nativeName: 'Gĩkũyũ'
    },
    'kj': {
        name: 'Kwanyama',
        nativeName: 'Kuanyama'
    },
    'kk': {
        name: 'Kazakh',
        nativeName: 'Қазақ тілі'
    },
    'kl': {
        name: 'Kalaallisut',
        nativeName: 'Kalaallisut'
    },
    'km': {
        name: 'Khmer',
        nativeName: 'ភាសាខ្មែរ'
    },
    'kn': {
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ'
    },
    'ko': {
        name: 'Korean',
        nativeName: '한국어'
    },
    'kr': {
        name: 'Kanuri',
        nativeName: 'Kanuri'
    },
    'ks': {
        name: 'Kashmiri',
        nativeName: 'कश्मीरी'
    },
    'ku': {
        name: 'Kurdish',
        nativeName: 'كوردی'
    },
    'ku-iq': {
        name: 'Kurdish (Sorani)',
        nativeName: 'کوردیی ناوەندی'
    },
    'kv': {
        name: 'Komi',
        nativeName: 'коми кыв'
    },
    'kw': {
        name: 'Cornish',
        nativeName: 'Kernewek'
    },
    'ky': {
        name: 'Kirghiz',
        nativeName: 'кыргыз тили'
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
    'mg': {
        name: 'Malagasy',
        nativeName: 'Malagasy fiteny'
    },
    'mh': {
        name: 'Marshallese',
        nativeName: 'Kajin M̧ajeļ'
    },
    'mi': {
        name: 'Māori',
        nativeName: 'te reo Māori'
    },
    'mk': {
        name: 'Macedonian',
        nativeName: 'македонски јазик'
    },
    'ml': {
        name: 'Malayalam',
        nativeName: 'മലയാളം'
    },
    'mn': {
        name: 'Mongolian',
        nativeName: 'монгол'
    },
    'mr': {
        name: 'Marathi (Marāṭhī)',
        nativeName: 'मराठी'
    },
    'ms': {
        name: 'Malay',
        nativeName: 'بهاس ملايو'
    },
    'mt': {
        name: 'Maltese',
        nativeName: 'Malti'
    },
    'my': {
        name: 'Burmese',
        nativeName: 'ဗမာစာ'
    },
    'na': {
        name: 'Nauru',
        nativeName: 'Ekakairũ Naoero'
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
    'nl': {
        name: 'Dutch',
        nativeName: 'Nederlands',
        subtitle: true,
        encoding: ['iso-8859-1'] // Tested
    },
    'nn': {
        name: 'Norwegian Nynorsk',
        nativeName: 'Norsk nynorsk'
    },
    'nb': {
        name: 'Norwegian Bokmål',
        nativeName: 'Norsk bokmål'
    },
    'no': {
        name: 'Norwegian',
        nativeName: 'Norsk',
        subtitle: true,
        encoding: ['iso-8859-1'] // Tested
    },
    'nr': {
        name: 'South Ndebele',
        nativeName: 'isiNdebele'
    },
    'nv': {
        name: 'Navajo',
        nativeName: 'Diné bizaad'
    },
    'ny': {
        name: 'Chichewa',
        nativeName: 'chiCheŵa'
    },
    'oc': {
        name: 'Occitan',
        nativeName: 'Occitan'
    },
    'oj': {
        name: 'Ojibwe',
        nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ'
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
    'rw': {
        name: 'Kinyarwanda',
        nativeName: 'Ikinyarwanda'
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
    'sg': {
        name: 'Sango',
        nativeName: 'yângâ tî sängö'
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
    'sm': {
        name: 'Samoan',
        nativeName: 'gagana faa Samoa'
    },
    'sn': {
        name: 'Shona',
        nativeName: 'chiShona'
    },
    'so': {
        name: 'Somali',
        nativeName: 'Soomaaliga'
    },
    'sq': {
        name: 'Albanian',
        nativeName: 'Shqip'
    },
    'sr': {
        name: 'Serbian',
        nativeName: 'српски језик',
        subtitle: true,
        encoding: ['Windows-1250'] // Tested
    },
    'ss': {
        name: 'Swati',
        nativeName: 'SiSwati'
    },
    'st': {
        name: 'Southern Sotho',
        nativeName: 'Sesotho'
    },
    'su': {
        name: 'Sundanese',
        nativeName: 'Basa Sunda'
    },
    'sv': {
        name: 'Swedish',
        nativeName: 'svenska',
        subtitle: true,
        encoding: ['iso-8859-1'] /** NEED TEST **/
    },
    'sw': {
        name: 'Swahili',
        nativeName: 'Kiswahili'
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
        nativeName: 'Tiếng Việt',
        subtitle: true,
        encoding: ['Windows-1258'] /** NEED TEST **/
    },
    'vo': {
        name: 'Volapük',
        nativeName: 'Volapük'
    },
    'wa': {
        name: 'Walloon',
        nativeName: 'Walon'
    },
    'wo': {
        name: 'Wolof',
        nativeName: 'Wollof'
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
        subtitle: true,
        encoding: ['GB18030'] /** Seems to work best. Tested: UTF8/UTF16/CP936/GB2312/GB2313/GB18030/Windows936/Big5 **/
    },
    'zh-cn': {
        name: 'Chinese (simplified)',
        nativeName: '简体中文'
    },
    'zh-tw': {
        name: 'Chinese (traditional)',
        nativeName: '正體中文'
    }
};

// Handles language detection and internationalization
i18n.configure({
    defaultLocale: App.Localization.detectLocale(),
    locales: App.Localization.allTranslations,
    directory: './src/app/language'
});
