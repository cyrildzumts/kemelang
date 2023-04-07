requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors',
        editor: '../vendors/editor'
    },
    waitSeconds: 0
});

requirejs(['accounts','scroll', 'editor_api', 'image_loader', 'core'], function(account, scroll_tools){
    account.init();
    scroll_tools.init();
});