define(['ajax_api','tag_api'], 
    function(ajax_api,TAG_API, Editor_API){
const QUERY_DELAY = 800;
let scheduled_query = false;
let event_registered = false;
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
    let keys = document.querySelectorAll(".keyboard button");
    let content = document.getElementById("ip");
    let space = document.getElementById("space");
    let backspace = document.getElementById("backspace");
    tag.addEventListener('click', function(event){
        tag.classList.toggle('active');
        let keyboard = document.getElementById(tag.dataset.keyboard);
        keyboard.classList.toggle('hidden');
        if(tag.classList.contains('active')){
            keyboard.dataset.target = tag.dataset.target;
            content.innerText = document.getElementById(keyboard.dataset.target).value;
        }else{
            keyboard.dataset.target = "";
            content.innerText = "";
        }
    });
    if(event_registered){
        return;
    }
    keys.forEach(k =>{
        // KEY Pressed
        k.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            k.classList.add("active");
            content.innerText += k.innerText;
            if(keyboard.dataset.target){
                document.getElementById(keyboard.dataset.target).value = content.innerText;
            }
        });
        k.addEventListener('mouseup', function (e) {
            k.classList.remove("active");
        });

        // TOUCH Event
        k.addEventListener('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            k.classList.add("active");
            //content.innerText += k.innerText;
        });
        k.addEventListener('touchend', function (e) {
            k.classList.remove("active");
        });
        
    });
    // SPACE 
    space.addEventListener('mousedown', function(e){
        space.classList.add("active");
        content.innerText += "\xa0";
        if(keyboard.dataset.target){
            document.getElementById(keyboard.dataset.target).value = content.innerText;
        }
    });
    space.addEventListener('mouseup', function(e){
        space.classList.remove("active");
    });
    // TOUCH Event
    space.addEventListener('touchstart', function (e) {
        space.classList.add("active");
        //content.innerText += k.innerText;
    });
    space.addEventListener('touchend', function (e) {
        space.classList.remove("active");
    });
    // BACKSPACE
    backspace.addEventListener('mousedown', function(e){
        backspace.classList.add("active");
        content.innerText = content.innerText.slice(0, -1);
        if(keyboard.dataset.target){
            document.getElementById(keyboard.dataset.target).value = content.innerText;
        }
    });
    backspace.addEventListener('mouseup', function(e){
        backspace.classList.remove("active");
    });
    // TOUCH Event
    backspace.addEventListener('touchstart', function (e) {
        backspace.classList.add("active");
        //content.innerText += k.innerText;
    });
    backspace.addEventListener('touchend', function (e) {
        backspace.classList.remove("active");
    });
    // React to physical keyboard Event
    document.addEventListener('keydown', function(event){
        keys.forEach(function(key){
            if(key.innerText == event.key.toUpperCase()){
                key.classList.add('active');
            }
        });
        
        if(event.key == 'Backspace'){
            content.innerText = content.innerText.slice(0, -1);
        }else if(event.key == ' '){
            content.innerText += "\xa0";
        }else{
            content.innerText += event.key;
        }
        /*
        if(keyboard.dataset.target){
            document.getElementById(keyboard.dataset.target).value = content.innerText;
        }
        */
    });
    document.addEventListener('keyup', function(event){
        keys.forEach(function(key){
            if(key.innerText == event.key.toUpperCase()){
                key.classList.remove('active');
            }
        });
    });
    event_registered = true;


}
return {
    "register_keyboard": init_keyboard
}

});