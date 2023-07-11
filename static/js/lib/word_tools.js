define(["ajax_api", 'tag_api', 'keyboard', 'editor_api', 'constants'],function(ajax_api, tag_api, Keyboard, Editor_API, Constants) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "word";
    const QUERY_DELAY = 800;
    const API_BASE_URL = Constants.API_BASE_URL;

    function remove_children(tag){
        if(!tag){
            return;
        }
        while(tag.firstChild){
            tag.removeChild(tag.firstChild);
        }
    }

    function register_selectable(container, selectable_list){
        let selectables = selectable_list || document.querySelectorAll('.js-selectable', container);
        selectables = Array.from(selectables);
        let select_all = $('.js-select-all');
        select_all = document.querySelectorAll('.js-select-all', container);
        select_all.forEach(input=>{
            input.addEventListener('change', function(event){
                selectables.forEach(i=>{
                    i.checked = input.checked;
                });
            });
        });
        selectables.forEach(i=>{
            i.addEventListener('change', function(event){
                let all_selected = selectables.every(input => input.checked);
                select_all.forEach(input => input.checked = all_selected);
            });
        });
    }

    function WordTools(){
        
        this.form = document.getElementById('word-form-translation');
        this.word_form = document.getElementById('word-form-translation');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.wrappers = [];
        this.preview_value = undefined;
        this.word_index = undefined;
        this.form_is_valid = false;
        this.total_form = 0;
        this.scheduled_query = undefined;
        this.input_max_length = 32;
        this.replace_pattern = /\d+/g;
    };
    WordTools.prototype.init = function(){
        var self = this;
        this.word_inputs = document.querySelectorAll('.search-word');
        if(this.word_inputs.length == 0){
            return;
        }
        this.word_input = document.getElementById('search-word');
        this.word_inputs.forEach(input =>{
            if(input.dataset.keyboard_btn){
                Keyboard.register_keyboard(document.getElementById(input.dataset.keyboard_btn));
            }
        });
        /*
        if(this.word_input.dataset.keyboard_btn){
            this.keyboard_btn = document.getElementById(this.word_input.dataset.keyboard_btn);
            Keyboard.register_keyboard(this.keyboard_btn);
        }
        */
        
        let forms = document.querySelectorAll('.update-form');
        forms.forEach(function(form){
            form.addEventListener('submit', function(event){
                event.stopPropagation();
                event.preventDefault();
                self.submit(form);
                return false;
            });
        });
        /*
        if(this.word_form){
            this.word_form.addEventListener('submit', function(event){
                event.stopPropagation();
                event.preventDefault();
                self.submit();
                return false;
            });
        }*/
        ['keyup','change'].forEach(function (e) {
            self.word_inputs.forEach(function(input){
                input.addEventListener(e, function(event){
                    event.stopPropagation();
    
                    if(!input || !input.value || !input.value.trim().length){
                        input.value = "";
                        remove_children(document.getElementById(input.dataset.target));
                        return;
                    }
                    if(!input.dataset.target){
                        remove_children(document.getElementById(input.dataset.target));
                        return;
                    }
                    if(self.scheduled_query){
                        clearTimeout(self.scheduled_query);
                    }
                    self.scheduled_query = setTimeout(self.search_word.bind(self), QUERY_DELAY, input);
                    //self.search_word(result.word_input);
                });
            });
        });
        /*
        ['keyup','change'].forEach(function (e) {
            self.word_input.addEventListener(e, function(event){
                event.stopPropagation();

                if(!self.word_input || !self.word_input.value || !self.word_input.value.trim().length){
                    self.word_input.value = "";
                    remove_children(document.getElementById(self.word_input.dataset.target));
                    return;
                }
                if(!self.word_input.dataset.target){
                    remove_children(document.getElementById(self.word_input.dataset.target));
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.search_word.bind(self), QUERY_DELAY, self.word_input);
                //self.search_word(result.word_input);
            });
            
        });
        */
        console.log("WordTools ready");
    };



    WordTools.prototype.search_word = function(tag){
        if(!tag || !tag.value.trim()){
            return;
        }
        if(tag.value.trim() == this.preview_value){
            return;
        }
        let self = this;
        let exclude = "";
        if(tag.dataset.word){
            exclude = `&exclude=${tag.dataset.word}`;
        }
        this.preview_value = tag.value.trim();
        let url = `${Constants.API_BASE_URL}/search-word/?word=${tag.value}${exclude}`;
        let option = {
            type:'GET',
            dataType: 'json',
            processData: false,
            contentType : false,
            crossDomain: true,
            url : url
        }
        ajax_api.ajax(option).then(function(response){
            self.on_word_exist(tag, response.found, response);
        }, function(reason){
            console.error(reason);
        });
    }



    WordTools.prototype.on_word_exist = function(tag, word_exist, response){
        let result_container = document.getElementById(tag.dataset.target);
        tag.classList.toggle('warning', !word_exist);
        this.form_is_valid = !word_exist;
        remove_children(result_container);
        if(!(response.success && word_exist)){
            let span_word = tag_api.create_tag({'element': 'span', 'options': {
                'cls':'bold',
                'innerText': `No word found for query \"${response.query}\"`
            }});
            let div = tag_api.create_tag({'element': 'div', 'options': {
                'cls': 'full',
                'children': [span_word]
            }});
            result_container.appendChild(div);
            return;
        }
        let inputs = [];
        response.words.forEach(word =>{
            let children = [];
            
            let input = tag_api.create_tag({'element': 'input', 'options': {
                'id': `word-${word.id}`,
                'cls': 'js-selectable',
                'type': 'checkbox',
                'name': tag.dataset.field,
                'value': word.id,
            }});
            let label = tag_api.create_tag({'element': 'label', 'options': {
                'cls':'bold',
                'innerText': `${word.word} [${word.langage.name}]`,
                'htmlFor': `word-${word.id}`
            }});
            let span_word = tag_api.create_tag({'element': 'div', 'options': {
                'cls':'result-header',
                'children': [label,input]
            }});
            children.push(span_word);
            if(word.definition){
                let span_def = tag_api.create_tag({'element': 'span', 'options': {
                    'innerText': word.definition
                }});
                let definition = tag_api.create_tag({'element': 'div', 'options': {
                    'cls': 'result-content',
                    'children': [span_def]
                }});
                children.push(definition);
            }else if (word.description && word.description.blocks){
                let description = tag_api.create_tag({'element': 'div', 'options': {
                    'cls': 'result-content',
                    'children': Editor_API.render(word.description.blocks)
                }});
                children.push(description);
            }
            
            let div = tag_api.create_tag({'element': 'div', 'options': {
                'cls': 'search-result',
                'children': children
            }});
            result_container.appendChild(div);
            inputs.push(input);
        });
        register_selectable(result_container, inputs);
    }

    WordTools.prototype.clear = function(){
        this.word_inputs.forEach(input =>{
            remove_children(document.getElementById(input.dataset.target));
            input.value = "";
        });
    }


    WordTools.prototype.submit = function(form){
        let self = this;
        let formData = new FormData(form);
        let url = `${Constants.API_BASE_URL}${form.dataset.endpoint}`;
        let option = {
            type:'POST',
            dataType: 'json',
            processData: false,
            contentType : false,
            enctype : 'multipart/form-data',
            crossDomain: true,
            data: formData,
            url : url
        }
        ajax_api.ajax(option).then(function(response){
            if(response.success){
                self.clear();
                notify({'level': 'info', 'content': response.message})
            }else{
                notify({'level': 'warn', 'content': response.message});
            }
        }, function(reason){
            console.error(reason);
        });
    }
    return WordTools;
});
