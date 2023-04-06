requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors',
        editor: '../vendors/editor'
    },
    waitSeconds: 0
});

requirejs(['attributes_api', 'ajax_api', 'core', 'accounts','price_calculator', 'commons', 'image_loader', 'dashboard','editor_api'], function(AttributeManager ,ajax_api, core, accounts, calculator){
    var attr_manager = new AttributeManager();
    attr_manager.init();
    calculator.init();
    accounts.init();
    console.log("JQuery version :", $().jquery);
});