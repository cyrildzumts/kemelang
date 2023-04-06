requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors'
    },
    waitSeconds: 0
});

requirejs(['accounts','cart_lyshop', 'checkout','wishlist','scroll', 'image_loader', 'core'], function(account, Cart, Checkout, Wishlist, scroll_tools){
    account.init();
    let cart = new Cart();
    let wishlist = new Wishlist();
    cart.init();
    wishlist.init();
    let checkout = new Checkout();
    checkout.init();
    scroll_tools.init();
});