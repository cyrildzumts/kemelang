requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors',
        editor: '../vendor/editor'
    },
    waitSeconds: 0
});

requirejs(['accounts','scroll','ajax_api', 'core','country_manager', 'commons', 'image_loader', 'editor_api', 'image_loader'], function(account, scroll_tools,ajax_api, core, CountryManager ){
    account.init();
    scroll_tools.init();
    CountryManager.init();
    console.log("JQuery version :", $().jquery);
});