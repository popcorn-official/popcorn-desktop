// Detect the language and update the global Language file
var detectLanguage = function(preferredLanguage) {

    var fs = require('fs');
    // The full OS language (with localization, like "en-uk")
    var pureLanguage = navigator.language.toLowerCase();
    // The global language name (without localization, like "en")
    var baseLanguage = navigator.language.toLowerCase().slice(0,2);

    if( fs.existsSync('./language/' + pureLanguage + '.json') ) {
        i18n.setLocale(pureLanguage);
    }
    else if( fs.existsSync('./language/' + baseLanguage + '.json') ) {
        i18n.setLocale(baseLanguage);
    } else {
        i18n.setLocale(preferredLanguage);
    }

    // This is a hack to translate non-templated UI elements. Fuck it.
    $('[data-translate]').each(function(){
        var $el = $(this);
        var key = $el.data('translate');

        if( $el.is('input') ) {
            $el.attr('placeholder', i18n.__(key));
        } else {
            $el.text(i18n.__(key));
        }
    });

    populateCategories();
};


// Populate the Category list (This should be a template, though)
var populateCategories = function() {
    var category_html = '';
    var defaultCategory = 'all';

    for(var key in i18n.__("genres") ) {
        category_html += '<li'+ (defaultCategory == key ? ' class="active" ' : '') +'>'+
                           '<a href="#" data-genre="'+key+'">'+ i18n.__("genres")[key] +'</a>'+
                         '</li>';
    }

    jQuery('#catalog-select .categories').html(category_html);
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

App.Localization.getTranslations = function() {
    return _.chain(App.Localization.languages)
        .keys()
        .filter(function(code){
            var lang = App.Localization.languages[code];
            return _.isUndefined(lang.translation) || lang.translation;
        }).value();
};

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
        display: "Български",
        subtitle: true,
        encoding: ['windows-1251', 'iso-8859-5']
    },
    "bn": {},
    "bs": {
        display: "Bosanski",
        subtitle: true,
        encoding: ['windows-1250'],
        translation: false
    },
    "ca": {},
    "cs": {
        display: "Česky",
        subtitle: true
    },
    "da": {
        display: "Dansk",
        subtitle: true
    },
    "de": {
        display: "Deutsch",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "el": {
        encoding: ['iso-8859-7']
    },
    "en": {
        display: "English",
        subtitle: true
    },
    "es": {
        display: "Español",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "et": {
        display: "Eesti",
        subtitle: true,
        translation: false
    },
    "eu": {},
    "fa": {},
    "fi": {
        display: "Suomi",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "fr": {
        display: "Français",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "he": {
        display: "Hebrew",
        subtitle: true,
        encoding: ['windows-1255']
    },
    "hr": {
        display: "Hrvatski",
        subtitle: true,
        encoding: ['windows-1250']
    },
    "hu": {
        display: "Magyar",
        subtitle: true,
        encoding: ['iso-8859-2']
    },
    "is": {},
    "it": {
        display: "Italiano",
        subtitle: true
    },
    "ja": {},
    "kr": {},
    "lt": {
        display: "Lietuvių",
        subtitle: true
    },
    "lv": {},
    "mt": {},
    "nl": {
        display: "Nederlands",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "no": {},
    "pl": {
        display: "Polish",
        subtitle: true
    },
    "pt": {
        display: "Português",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "pt-br": {
        display: "Português-Br",
        subtitle: true,
        encoding: ['iso-8859-1']
    },
    "ro": {
        display: "Română",
        subtitle: true,
        encoding: ['iso-8859-16']
    },
    "ru": {
        encoding: ['windows-1251', 'iso-8859-5']
    },
    "sk": {},
    "sr": {
        display: "Srpski",
        subtitle: true,
        encoding: ['windows-1250'],
        translation: false
    },
    "sv": {},
    "tr": {
        display: "Türkçe",
        subtitle: true,
        encoding: ['iso-8859-9']
    },
    "uk": {
        encoding: ['windows-1251', 'iso-8859-5']
    },
    "zh-cn": {},
    "zh-tw": {}
};

// Handles language detection and internationalization
i18n.configure({
    defaultLocale: 'en',
    locales: App.Localization.getTranslations(),
    directory: './language'
});

// Detect the language. The default is english
detectLanguage('en');
