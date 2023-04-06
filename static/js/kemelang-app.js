requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors'
    },
    waitSeconds: 0
});

requirejs(['accounts','scroll', 'image_loader', 'core'], function(account, scroll_tools){
    account.init();
    scroll_tools.init();
});