define(['ajax_api','tag_api'], 
    function(ajax_api,TAG_API){
const QUERY_DELAY = 800;
const KEYBOARD_ID = "african-keyboard";
const KEYS_CONTAINER_ID = "keys";
let scheduled_query = false;
let event_registered = false;
// KEYBOARD 3 ROWS
// 1st ROW : 10 Chars
// 2nd ROW : 9 Chars
// 3rd ROW : 7 Chars
const AFRICAN_ALPHABET = [
    // Ā, Ă, Ǻ, ɐ,ɑ, Ċ, Ē, Ė, Ɛ, Ŋ
    ['\u0100','\u0102', '\u01FA', '\u0250', '\u0251','\u010A','\u0112','\u0116', '\u0190','\u014A'],
    // Ō,Ɔ, ɔ,  Ū, Ƨ, Ʒ, ǝ, Ǣ, ɩ
    [,'\u014C', '\u0186', '\u0254', '\u016A','\u01A7', '\u01B7', '\u01DD', '\u01E2','\u0269'],
    //	Δ, Θ, Λ, Π, Σ, Φ, Ψ, Ω
    ['\u0394','\u0398', '\u039B','\u03A0', '\u03A3', '\u03A6','\u03A8','\u03A9'],
]
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

function fill_keyboard(already_filled){
    if(already_filled){
        return;
    }
    let keys = [];
    let keys_container = document.getElementById(KEYS_CONTAINER_ID);
    if(!keys_container){
        return;
    }
    AFRICAN_ALPHABET.forEach(function(row, index){
        let row_keys = [];
        row.forEach(function(key){
            let button = TAG_API.create_tag({'element': 'button', 'options': {
                'innerText': key
            }})
            row_keys.push(button);
            keys.push(button);
        });
        let div = TAG_API.create_tag({'element': 'div', 'options': {
            'cls': `keyboard-row row${index + 1}`,
            'children': row_keys
        }});
        keys_container.appendChild(div);
    });
    return keys;
}

function init_keyboard(tag){
    if(!tag){
        return;
    }
    //let keys = document.querySelectorAll(".keyboard button");

    let keys = fill_keyboard(event_registered);
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
        /*
        if(event.key == 'Backspace'){
            content.innerText = content.innerText.slice(0, -1);
        }else if(event.key == ' '){
            content.innerText += "\xa0";
        }else{
            content.innerText += event.key;
        }*/
        
        if(keyboard.dataset.target){
            content.innerText = document.getElementById(keyboard.dataset.target).value;
        }
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