define(['ajax_api', 'filters', 'editor_api', 'word_tools'], 
function(ajax_api, Filter, Editor_API, WordTools) {
    'use strict';
    let messages;
    let notification_wrapper;
    let fadeDelay = 5000; // 5s
    var CAROUSEL_INTERVAL = 5000;
    const MIN_LEN_WARNING = 20;
    const MAX_COMMENT_TEXT_LEN = 256;
    const MAX_MAIL_TEXT_LEN = 512;
    const LOGIN_REQUIRED_KEY = "login_required";
    const UI_TOGGLE_OPEN_CSS = "fa-bars";
    const UI_TOGGLE_CLOSE_CSS = "fa-times";

    function notify(message){
        if( typeof notification_wrapper === 'undefined' || typeof messages === 'undefined'){
            console.warn("Notify call for message %s. But There is no messages container", message);
            return;
        }
        let li = $('<li />', {
            "class" : message.level,
        });
        let div = $('<div />', {
            "class" : "notification flex"
        });
        div.append($('<i />', {
            "class" : "fas fa-info-circle icon"
        })).append($('<span />', {
            'text': message.content
        })).appendTo(li);
        li.appendTo(messages);
        notification_wrapper.fadeIn().delay(fadeDelay).fadeOut('slow', function () {
            messages.empty();
        });
    }

    function notify_init(wrapper, message_container){
    
        if(typeof wrapper === 'undefined'){
            return;
        }

        if(typeof message_container === 'undefined' || $('li', message_container).length == 0){
            return;
        }

        wrapper.fadeIn().delay(fadeDelay).fadeOut('slow', function () {
            message_container.empty();
        });
    }
    
    var Collapsible = (function(){
        function Collapsible(){
            this.$collapsible   = {}; // all element with collapsible class
            this.$close         = {}; // all button used to close a collapsible elements.
            this.init();
    
        }
        Collapsible.prototype.init = function(){
            this.$collapsible = $(".collapsible");
            let filter_content = $('#filter-content');
            let content_fitler = document.getElementById('filter-content');
            if(this.$collapsible.length == 0){
                return;
            }
            /*
            $('.collapsible').on('click', '.collapse-toggle', function(event){
                event.stopPropagation();
                $('.js-attr-opt').toggleClass('hidden');
                let content  = $('#' + $(this).data('target'));
                if(content.eq(filter_content)|| content.parent().eq(filter_content)){
                    $('.collapsible .collapse-content', filter_content).not(content).hide();
                }else{
                    $('.collapsible .collapse-content').not(content).hide();
                }
                content.toggle();
            });
            */
            $('.collapsible').on('click', '.collapse-toggle', function(event){
                event.stopPropagation();
                $('.js-attr-opt').toggleClass('hidden');
                let target  = document.getElementById(this.dataset.target);
                if(!target) return;
                let display = target.style.display || 'none';
                if(target == content_fitler || target.parentElement == content_fitler){
                    content_fitler.querySelectorAll('.collapse-content').forEach((el)=>{
                        el.classList.toggle('hidden', el != target);
                    });
                }else{
                    document.querySelectorAll('.collapse-content').forEach((el)=>{
                        el.classList.toggle('hidden', el != target);
                    });
                }
                /*
                if(display != "none"){
                    target.style.display = 'none';
                    target.parentElement.classList.add('activated');
                }else{
                    target.style.display = 'block';
                    target.parentElement.classList.remove('activated');
                }*/
                target.style.display = display == 'none' ? 'block': 'none';
                this.parentElement.classList.toggle('activated', display == 'none');
                
                //$('input.clearable', content).val('');
            });
            $('.collapsible .toggle').on('click', function(event){
                event.stopPropagation();
                let parent = $(this).parent();
                let target = $('.' + this.dataset.toggle, parent);
                $('input', parent).val('');
                
                target.toggle();
            });
            $(this.$collapsible).on("click", ".open", function(event){
                event.stopPropagation();
                let target =$(event.target).data("target");
                if(target == undefined){
                    $(this).parent().children(".collapse-content").toggle();
                }
                else{
                    $(target).toggle();
                }
            });
    
            $(this.$collapsible).on("click", ".close", function(event){
                event.stopPropagation();
                let target =$(event.target).data("target");
    
                if(target == undefined){
                    $(this).parent().toggle();
                }
                else{
                    $(target).toggle();
                }
            });
        };
    
        return Collapsible;
    })();
    
    
    var Modal = (function(){
        function Modal(options){
            this.modal = {};
            this.init();
        }
        Modal.prototype.init = function(){
            let that = this;
            function clear_inputs_field(inputs) {
                if(!inputs || inputs-length == 0){
                    return;
                }
                Array.from(inputs).filter(input => { return ("clearable" in input.dataset === false) || (input.dataset.clearable === "true"); })
                    .forEach(function (el, index) {
                        el.value = "";
                        el.dataset.update = "";
                        if (el.type == "file") {
                            el.files = null;
                        }
                        if (el.type == "checkbox" || el.type == "radio") {
                            el.checked = false;
                        }
                    });
            }

            $(".js-open-modal").click(function(event){
                if((LOGIN_REQUIRED_KEY in this.dataset) && this.dataset[LOGIN_REQUIRED_KEY] == "1" ){
                    event.stopPropagation();
                    event.preventDefault();
                    notify({"level": "info", "content": this.dataset.message});
                    return false;
                }
                let modal = document.getElementById(this.dataset.target);
                that.modal = modal;
                
                modal.style.display = "flex";
                if(window){
                    $(window).click(function(eventModal){
                        if(eventModal.target == modal){
                            modal.style.display = "none";
                            that.modal = undefined;
                            let inputs = modal.querySelectorAll("input:not([name='csrfmiddlewaretoken']):not([type='hidden']), textarea");
                            let clearables = modal.querySelectorAll('.clearable');
                            if(clearables){
                                clearables.forEach((el) =>{
                                    el.innerText = "";
                                    el.classList.remove('warning', 'danger');
                                });
                            }
                            clear_inputs_field(inputs);
                        }

                        
                    });
                }
            });
    
            $(".js-close-modal").click(function(event){
                event.stopPropagation();
                let modal = document.getElementById(this.dataset.target);
                modal.style.display = "none";
                that.modal = undefined;
                let inputs = modal.querySelectorAll("input:not([name='csrfmiddlewaretoken']):not([type='hidden']), textarea");
                let clearables = modal.querySelectorAll('.clearable');
                if(clearables){
                    clearables.forEach((el) =>{
                        el.innerText = "";
                        el.classList.remove('warning', 'danger');
                    });
                }
                clear_inputs_field(inputs);
            });
        }
        return Modal;
    })();

    function init_tabs(){
        let tabs = document.querySelectorAll('.tab');
        if(tabs.length == 0){
            return;
        }
        let removeClass = (list, cls) => {
            list.forEach(tag =>{
                tag.classList.remove(cls);
                document.getElementById(tag.dataset.target).style.display = "none";
            });
        }
        tabs.forEach((tab) =>{
            
            tab.addEventListener('click', (event)=>{
                if(tab.classList.contains('active')){
                    return;
                }
                removeClass(tabs, 'active');
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).style.display = "block";
            });
        });
    }

    function autoplayCarousel() {
        const carouselEl = document.getElementById("carousel");
        if(!carouselEl){
            return;
        }
        const slideContainerEl = carouselEl.querySelector("#slide-container");
        const slideEl = carouselEl.querySelector(".slide");
        
        let slideWidth = slideEl.offsetWidth;
    
        document.querySelectorAll(".slide-indicator")
            .forEach((dot, index) => {
                dot.addEventListener("click", () => navigate(index));
                dot.addEventListener("mouseenter", () => clearInterval(autoplay));
            });
        // Add keyboard handlers
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') {
                clearInterval(autoplay);
                navigate("backward");
            } else if (e.code === 'ArrowRight') {
                clearInterval(autoplay);
                navigate("forward");
            }
        });
        // Add resize handler
        window.addEventListener('resize', () => {
            slideWidth = slideEl.offsetWidth;
        });
        // Autoplay
        let autoplay = setInterval(() => navigate("forward"), CAROUSEL_INTERVAL);
        slideContainerEl.addEventListener("mouseenter", () => clearInterval(autoplay));
        slideContainerEl.addEventListener("mouseleave", () => {
            autoplay = setInterval(() => navigate("forward"), CAROUSEL_INTERVAL);
        });
        // Slide transition
        const getNewScrollPosition = (arg) => {
            const gap = 10;
            const maxScrollLeft = slideContainerEl.scrollWidth - slideWidth;
            if (arg === "forward") {
                const x = slideContainerEl.scrollLeft + slideWidth + gap;
                return x <= maxScrollLeft ? x : 0;
            } else if (arg === "backward") {
                const x = slideContainerEl.scrollLeft - slideWidth - gap;
                return x >= 0 ? x : maxScrollLeft;
            } else if (typeof arg === "number") {
                const x = arg * (slideWidth + gap);
                return x;
            }
        }
        const navigate = (arg) => {
            slideContainerEl.scrollLeft = getNewScrollPosition(arg);
        }
        // Slide indicators
        const slideObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const slideIndex = entry.target.dataset.slideindex;
                    carouselEl.querySelector('.slide-indicator.active').classList.remove('active');
                    carouselEl.querySelectorAll('.slide-indicator')[slideIndex].classList.add('active');
                }
            });
        }, { root: slideContainerEl, threshold: .1 });
        let slides = document.querySelectorAll('.slide');
        if(!slides || slides.length <= 1){
            return;
        }
        slides.forEach((slide) => {
            slideObserver.observe(slide);
        });
    }
    function kiosk_update(event){
        document.getElementById('main-image').src = event.target.src;
        $(".kiosk-image").removeClass('active').filter(event.target).addClass("active");
    }
    async function track_action(track_element){
        let csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]');
        let url = '/api/track-actions/';
        let action = parseInt(track_element.dataset.action);
        let options = {
            url : url,
            type: 'POST',
            data : {'action': action, 'csrfmiddlewaretoken': csrfmiddlewaretoken.value},
            dataType : 'json',
            cache : false,
        };
        ajax_api.ajax(options, false).then(function(response){}, function(error){});
    }
    autoplayCarousel();
    let modal = new Modal();
    let collapsible =  new Collapsible();
    function image_preview(){
        let previewer = document.getElementById('image-previewer');
        if(!previewer){
            return;
        }
        let images = previewer.querySelectorAll('.preview-image');
        if(!images){
            return;
        }
        let max_index = parseInt(previewer.dataset.count);
        let active_image = previewer.querySelector('#active-image');
        let prev_btn = previewer.querySelector('.prev');
        let close_btn = previewer.querySelector('.js-close-modal');
        let next_btn = previewer.querySelector('.next');
        let viewer_current_index = previewer.querySelector('.viewer-current-index');
        let current = parseInt(previewer.dataset.current);
        prev_btn.addEventListener('click', function(event){
            event.stopPropagation();
            current--;
            if(current >= 0){
                active_image.src = images[current].src;
                next_btn.classList.remove('disabled');
                previewer.dataset.current = current;
            }else{
                current = 0;
            }
            this.classList.toggle('disabled', current == 0);
            viewer_current_index.innerText = current + 1;
        });
        next_btn.addEventListener('click', function(event){
            event.stopPropagation();
            current++;
            if(current < max_index){
                active_image.src = images[current].src;
                prev_btn.classList.remove('disabled');
                previewer.dataset.current = current;
            }else{
                current = max_index;
            }
            this.classList.toggle('disabled', current >= (max_index - 1));
            viewer_current_index.innerText = current + 1;
        });
        close_btn.addEventListener('click', function(event){
            current = 0;
            active_image.src = images[current].src;
            next_btn.classList.remove('disabled');
            prev_btn.classList.add('disabled');
            previewer.dataset.current = current;
            viewer_current_index.innerText = current + 1;
        });
    }
    function input_check_max_limit2(input){
        let max_len = parseInt(input.dataset.maxLength);
        let len = input.value.length;
        let target = document.getElementById(input.dataset.target);
        if(target){
            target.innerText = len
            target.classList.toggle("danger", (max_len - len) <= 0);
            target.classList.toggle("warning", ((max_len - len) > 0 && (max_len - len) <= MIN_LEN_WARNING));
        }else{
            console.warn("input check max length failed : target for selector %s is null", input.dataset.target)
        }
        
    }

    function is_mail_form_valid(form){
        let inputs_selectors = [
            {'id':'customer_name', 'name':'customer_name','type': 'input', 'validator': null, valid:false, missing:false, required:true},
            {'id':'customer_email', 'name':'customer_email','type': 'input', 'validator': null, valid:false, missing:false, required:true},
            {'id':'subject', 'name':'subject','type': 'input', 'validator': null, valid:false, missing:false, required:true},
            {'id':'message', 'name':'message','type': 'textarea', 'validator': null, valid:false, missing:false, required:true},
        ];
    
        inputs_selectors.forEach(selector =>{
            let input = form.querySelector(`${selector.type}[name='${selector.name}']`);
            if(input == null){
                selector.missing = true;
            }else{
                selector.valid = selector.validator != null ? selector.validator(input.value) : input.value != "";
                input.classList.toggle('error', !selector.valid);
            }
        });
        let some_invalid = function(selector){
            return (selector.valid == false || selector.missing) && selector.required;
        }
        return !inputs_selectors.some(some_invalid);
    }
    
    function send_mail_listeners(){
        let form = document.getElementById('new-mail');
        let forms = document.querySelectorAll('.mail-form');
        if(forms.length == 0){
            return;
        }
        let on_success = function(response, close_target){
            if(response.success){
                let subject = document.getElementById('subject');
                let message = document.getElementById('message');
                let length_counter = document.getElementById('length-counter');
                
                subject.value = "";
                message.value = "";
                length_counter.value = "0";
                length_counter.classList.remove('danger');
                length_counter.classList.remove('warning');
                if(close_target && close_target != ''){
                    let close_modal_btn = document.getElementById(close_target);
                    close_modal_btn.dispatchEvent(new Event('click'));
                }
            }else{
                console.log(response);
            }
        }
        forms.forEach(function(form){
            form.addEventListener('submit', function(e){
                e.preventDefault();
                e.stopPropagation();
                if(!is_mail_form_valid(form)){
                    return false;
                }
                let close_target = form.dataset.close;
                let formData = new FormData(form);
                let url = form.dataset.url;
    
                let options = {
                    url : url,
                    type: 'POST',
                    enctype : 'multipart/form-data',
                    data: formData,
                    dataType : 'json',
                    processData : false,
                    cache : false,
                    contentType : false
                };
                ajax_api.ajax(options).then(function(response){
                    let msg = {
                        content : response.message,
                        level : response.success
                    }
                    notify(msg);
                    if(form.dataset.onsuccess == "1"){
                        on_success(response, close_target);
                    }
                    
                }, function(reason){
                    console.error("Mail could not be sent.");
                    console.error(reason);
                });
            });
        });
        
    }

    function update_rating(el){
        let current = el.dataset.index;
        let stars  = document.querySelectorAll('.js-star');
        stars.forEach(function(tag, index){
            tag.classList.toggle('selected', current >= index);
        });
    }

    function init_collapsible(){
        let toggle_list = document.querySelectorAll('.collapse-v2-toggle');
        if( toggle_list == 0){
            return;
        }
        toggle_list.forEach((t,i)=>{
            t.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                let activate = !this.classList.contains('active');
                /*
                toggle_list.forEach((e,i)=>{
                    e.classList.remove('active');
                    if(e.dataset.target){
                        let el = document.getElementById(e.dataset.target);
                        el.style.display = 'none';
                    }else{
                        if(e.parentElement.nextElementSibling){
                            e.parentElement.nextElementSibling.style.display = 'none';
                        }
                    }
                });*/
                this.classList.toggle('active', activate);
                if(this.dataset.target){
                    let el = document.getElementById(this.dataset.target);
                    if(el){
                        el.style.display = activate ? 'block': '';
                    }
                }else{
                    //this.parentElement.nextElementSibling.classList.toggle('hidden', !activate);
                    if(this.nextElementSibling){
                        this.nextElementSibling.style.display = activate ? 'block': '';
                    }
                    
                }
            });
        });
    }


    function init_accordion(){
        let toggle_list = document.querySelectorAll('.accordion-toggle');
        if( toggle_list == 0){
            return;
        }
        toggle_list.forEach((t,i)=>{
            t.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                let activate = !this.classList.contains('active');
                toggle_list.forEach((e,i)=>{
                    e.classList.remove('active');
                    if(e.dataset.target){
                        let el = document.getElementById(e.dataset.target);
                        el.style.display = 'none';
                    }else{
                        if(e.parentElement.nextElementSibling){
                            e.parentElement.nextElementSibling.style.display = 'none';
                        }
                    }
                });
                this.classList.toggle('active', activate);
                if(this.dataset.target){
                    let el = document.getElementById(this.dataset.target);
                    if(el){
                        el.style.display = activate ? 'block': '';
                    }
                }else{
                    //this.parentElement.nextElementSibling.classList.toggle('hidden', !activate);
                    if(this.parentElement.nextElementSibling){
                        this.parentElement.nextElementSibling.style.display = activate ? 'block': '';
                    }
                    
                }
            });
        });
    }

    function init_dropdown(){
        let toggle_list = document.querySelectorAll('.dropdown-toggle');
        if( !toggle_list){
            return;
        }
        

        toggle_list.forEach((t,i)=>{
            t.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                toggle_list.forEach((e,i)=>{
                    if((e != t) && (e.dataset.target != t.dataset.target)){
                        if(e.dataset.target){
                            let el = document.getElementById(e.dataset.target);
                            if(el){
                                el.classList.remove('show');
                            }
                        }else{
                            if(e.nextElementSibling){
                                e.nextElementSibling.classList.remove('show');
                            }
                        }
                    }
                });
                if(this.dataset.target){
                    let el = document.getElementById(this.dataset.target);
                    if(el){
                        el.classList.toggle('show');
                    }
                }else{
                    if(this.nextElementSibling){
                        this.nextElementSibling.classList.toggle('show');
                    } 
                }
            });
        });
        
    }

    function init_editor(){
        let editor_tags = document.querySelectorAll('.editor');
        editor_tags.forEach((tag) =>{
            let target = document.getElementById(tag.dataset.target);
            let initial_data = null;
            if(target.value.length > 0 ){
                try {
                    initial_data = JSON.parse(target.value);
                } catch (error) {
                    console.error(`Error while parsing json string for tag ${tag.dataset.editor}`, error);
                }
            }
            let editor = new Editor_API.EditorWrapper(tag.dataset.editor, initial_data);
            editor.init()
            if(!editor.created){
                console.warn(`Editor not created for tag ${tag.dataset.editor}`);
            }
        });
        
    }
   
    function init_word_tools(){
        let word_tools = new WordTools();
        word_tools.init();
    }

    $(document).ready(function(){
        if(window){
            window.notify = notify;
        }
        init_accordion();
        init_dropdown();
        init_collapsible();
        init_tabs();
        send_mail_listeners();
        init_editor()
        init_word_tools();
        notification_wrapper = $('#notifications-wrapper');
        messages = $('#messages', notification_wrapper);
        notify_init(notification_wrapper, messages);
        Filter.init();
        image_preview();
        $('.js-star').on('click', function(event){update_rating(this)});
        $('.js-select-image').on('click', kiosk_update);
        $('.js-dialog-open').on('click', function(){
            let target = $('#' + this.dataset.target);
            target.show();
        });
        
        $('.js-dialog-close').on('click', function(){
            let target = $("#" + this.dataset.target);
            target.hide();
            //var parent = $(this).parents('.dialog').hide();
            $('input[type!="hidden"]', target).val('');
        });
        $('.js-reveal-btn, .js-revealable-hide').on('click', function(){
            let target = $(this.dataset.target).parent();
            $('.js-revealable', target).toggleClass('hidden');
        });
        $('.js-clear-input').on('click', function(){
            
            let target = $('#' + this.dataset.target);
            $('input[type!=checkbox]', target).val('');
            $('input:checkbox', target).val('').prop('checked', '');
        });
        let selectable_list = $(".js-selectable");
        let activable_list = $(".js-activable");
        let select_all = $('.js-select-all');
        selectable_list.on('click', function(){
            let is_selected = selectable_list.is(function (el) {
                return this.checked;
            });
            
            let selected_all = selectable_list.is(function (el) {
                return !this.checked;
            });
            select_all.prop('checked', !selected_all);
            activable_list.prop('disabled', !is_selected);
        });

        select_all.on('click', function(){
            selectable_list.prop('checked', this.checked);
            activable_list.prop('disabled', !this.checked);
        });
        $(".limited-input").on("keyup", function(event){
            event.stopPropagation();
            input_check_max_limit2(this);
        });

        $('.js-menu').on('click', function(){
            $('#menu-overlay-label').click();
            $('.js-menu-close').show();
            $(this).hide();

        });
        $('.js-menu-close').on('click', function(){

            $('#menu-overlay-label').click();
            $('.js-menu').show();
            $(this).hide();
        });
        $('.js-action-abtest').on('click', function(e){
            if(!this.dataset.action){
                return;
            }
            track_action(this);
        });
        let btn_toggle_list = document.querySelectorAll("button[data-ui-toggle='collapse']");
        btn_toggle_list.forEach((button)=>{
            if(!button.dataset.uiTarget){
                console.warn("found button with data-ui-toggle set but no target were defined", button);
                return;
            }
            button.addEventListener('click',(event)=>{
                let target = document.getElementById(button.dataset.uiTarget);
                target.classList.toggle('show');
                if(!button.dataset.custom){
                    let i = button.querySelector("i");
                    i.classList.toggle(UI_TOGGLE_OPEN_CSS);
                    i.classList.toggle(UI_TOGGLE_CLOSE_CSS);
                }
                
            });

        });
    });
});
