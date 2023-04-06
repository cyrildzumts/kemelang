requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors',
        editor: '../vendors/editor'
    },
    waitSeconds: 0
});

requirejs(['ajax_api', 'core', 'accounts', 'commons', 'image_loader', 'dashboard','editor_api'], function(ajax_api, core, accounts){
    accounts.init();
    console.log("JQuery version :", $().jquery);
});