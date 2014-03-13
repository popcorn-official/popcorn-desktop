// Handles language detection and internationalization
i18n.configure({
    defaultLocale: 'en',
    locales: ['ar', 'bg', 'ca', 'da', 'de', 'el', 'en', 'es', 'eu', 'fr', 'he', 'hu', 'it', 'ja', 'kr',
              'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'pt-br', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk', 'zh-cn', 'zh-tw'],
    directory: './language'
});


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

// Detect the language. The default is english
detectLanguage('en');
