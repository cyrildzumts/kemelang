requirejs.config({
    baseUrl :'/static/js/lib',
    paths:{
        vendor: '../vendors'
    },
    waitSeconds: 0
});

requirejs(['core', 'commons' ,'analytics'], function(core){
    console.log("ReportApp loaded ...");
    console.log("JQuery version :", $().jquery);
});