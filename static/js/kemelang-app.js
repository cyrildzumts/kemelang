requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors',
        editor: '../vendors/editor'
    },
    waitSeconds: 0
});

requirejs(['accounts','scroll','ajax_api', 'core','country_manager', 'langage_manager','word_manager', 'dict_manager','translation_manager', 'commons', 'image_loader', 'editor_api', 'image_loader'], function(account, scroll_tools,ajax_api, core, CountryManager, LangageManager, WordManager, DictManager, TranslationManager ){
    account.init();
    scroll_tools.init();
    let countryManager = new CountryManager();
    countryManager.init();
    let langageManager = new LangageManager();
    langageManager.init();
    let wordManager = new WordManager();
    wordManager.init();
    let dictManager = new DictManager();
    dictManager.init();
    let translation_manager = new TranslationManager();
    translation_manager.init();
    console.log("JQuery version :", $().jquery);
});