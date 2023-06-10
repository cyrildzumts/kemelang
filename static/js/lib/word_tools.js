define(["ajax_api", 'tag_api', 'keyboard', 'editor_api'],function(ajax_api, tag_api, Keyboard, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "word";
    const QUERY_DELAY = 800;
    const API_BASE_URL = "https://api.kemelang-local.com"

    function remove_children(tag){
        if(!tag){
            return;
        }
        while(tag.firstChild){
            tag.removeChild(tag.firstChild);
        }
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
        this.word_input = document.getElementById('search-word');
        if(! this.word_input){
            return;
        }
        if(this.word_input.dataset.keyboard_btn){
            this.keyboard_btn = document.getElementById(this.word_input.dataset.keyboard_btn);
            Keyboard.register_keyboard(this.keyboard_btn);
        }
        
        this.loader = document.getElementById('loader');

        if(this.word_form){
            this.word_form.addEventListener('submit', function(even){
                event.stopPropagation();
                event.preventDefault();
                self.submit();
                return false;
            });
        }
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
        console.log("WordTools ready");
    };

    WordTools.prototype.init_for_update = function(){
        var self = this;
        let update_form = document.getElementById("update-word-form");

        if(!update_form){
            return false;
        }
        let description = document.getElementById("description");
        try {
            if(description && description.value){
        
                let init_data = JSON.parse(description.value);
                let editor = new Editor_API.EditorWrapper('editor', init_data);
                editor.init()
                if(!editor.created){
                    console.warn("Editor not created for Langage update");
                }
            }
            
        } catch (error) {
            console.warn("error on parsing json data from description value : %s", description.value);
            console.error(error);
        }
        return true;
    }


    WordTools.prototype.search_word = function(tag){
        if(!tag || !tag.value.trim()){
            return;
        }
        if(tag.value.trim() == this.preview_value){
            return;
        }
        let self = this;
        this.preview_value = tag.value.trim();
        let url = `${API_BASE_URL}/search-word/?word=${tag.value}/`;
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
    
        response.words.forEach(word =>{
            let input = tag_api.create_tag({'element': 'input', 'options': {
                'id': `word-${word.id}`,
                'type': 'checkbox',
                'name': 'translations',
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
            let description = tag_api.create_tag({'element': 'div', 'options': {
                'cls': 'result-content',
                'children': Editor_API.render(word.description.blocks)
            }});
            let div = tag_api.create_tag({'element': 'div', 'options': {
                'cls': 'search-result',
                'children': [span_word, description]
            }});
            result_container.appendChild(div);
        });
    }

    WordTools.prototype.clear = function(){
        let result_container = document.getElementById(this.word_input.dataset.target);
        remove_children(result_container);
        this.word_input.value = "";
    }


    WordTools.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.word_form);
        let url = `${API_BASE_URL}/add-translations/${this.word_form.dataset.word}/`;
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
                notify({'level': 'info', 'content': response.message})
                self.clear();
            }else{
                notify({'level': 'warn', 'content': response.message});
            }
        }, function(reason){
            console.error(reason);
        });
    }
    return WordTools;
});
