define(['ajax_api','tag_api'], 
    function(ajax_api,TAG_API, Editor_API){
const QUERY_DELAY = 800;
let scheduled_query = false;
$('.js-user-search').on('keyup', function(event){
    event.stopPropagation();
    query = $(this).val().trim();
    if(query.length == 0 ){
        return;
    }
    search_options.data.search = query
    if(scheduled_query){
        clearTimeout(scheduled_query);
    }
    scheduled_query = setTimeout(userSearch, query_delay, search_options);
});

function init_keyboard(tag){
    if(!tag){
        return;
    }
    tag.addEventListener('click', function(event){
        tag.classList.toggle('active');
        let keyboard = document.getElementById(tag.dataset.keyboard);
        keyboard.classList.toggle('hidden');
        if(tag.classList.contains('active')){
            keyboard.dataset.target = tag.dataset.target;
        }
    });
}
return {
    "register_keyboard": init_keyboard
}

});