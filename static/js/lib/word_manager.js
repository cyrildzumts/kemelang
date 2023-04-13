define(["ajax_api", 'tag_api', 'word_form_factory','editor_api'],function(ajax_api, tag_api, WordFormFactory, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "word";
    const QUERY_DELAY = 800;


    function WordManager(){
        
        this.form = document.getElementById('word-form');
        this.word_form = document.getElementById('word-form');
        this.form_container = document.getElementById('word-form-container');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.langage_selection_list = Array.from(document.querySelectorAll('.langage-selection'));
        this.wrappers = [];
        this.form_is_valid = false;
        this.total_form = 0;
        this.scheduled_query = undefined;
        this.input_max_length = 32;
        this.replace_pattern = /\d+/g;
    };
    WordManager.prototype.init = function(){
        var self = this;
        if(!this.form_container){
            return;
        }
        this.wordFormFactory = new WordFormFactory();
        this.wordFormFactory.init();
        let add_form_btn = document.getElementById('add-word-btn');
        let create_country_btn = document.getElementById('create-word-btn');
        if(add_form_btn){
            add_form_btn.addEventListener('click', function(even){
                event.stopPropagation();
                event.preventDefault();
                console.log("Click on Add Word Form");
                self.add_word_form('word');
            });
        }
        self.create_managed_word_form(PREFIX);
        if(this.word_form){
            this.word_form.addEventListener('submit', function(even){
                event.stopPropagation();
                event.preventDefault();
                console.log("Click on Create Word Btn");
                self.submit();
                return false;
            });
        }
        this.langage_selection_list.forEach(function(langage){
            langage.addEventListener('click', function(event){
                event.stopPropagation();
                self.on_langage_selection_clicked(langage);
            });
        });
        console.log("Word Manager initialised");
    };

    WordManager.prototype.create_managed_word_form = function(prefix){
        const FORM_PREFIX = prefix || 'form';
        let create_tag = tag_api.create_tag;
        this.form_TOTAL_FORMS = create_tag({
            'element': 'input', 
            'options': {
                'id': `id_${FORM_PREFIX}-${TOTAL_FORMS}`,
                'value': 0,
                'type': 'hidden',
                'name': `${FORM_PREFIX}-${TOTAL_FORMS}`
            }
        });
        this.form_INITIAL_FORMS = create_tag({
            'element': 'input', 
            'options': {
                'id': `id_${FORM_PREFIX}-${INITIAL_FORMS}`,
                'value': this.total_form,
                'type': 'hidden',
                'name': `${FORM_PREFIX}-${INITIAL_FORMS}`
            }
        });
        this.form_MIN_NUM_FORMS = create_tag({
            'element': 'input', 
            'options': {
                'id': `id_${FORM_PREFIX}-${MIN_NUM_FORMS}`,
                'value': this.total_form,
                'type': 'hidden',
                'name': `${FORM_PREFIX}-${MIN_NUM_FORMS}`
            }
        });
        this.form_MAX_NUM_FORMS = create_tag({
            'element': 'input', 
            'options': {
                'id': `id_${FORM_PREFIX}-${MAX_NUM_FORMS}`,
                'value': MAX_SUBMITTED_FORMS,
                'type': 'hidden',
                'name': `${FORM_PREFIX}-${MAX_NUM_FORMS}`
            }
        });
        this.form_container.appendChild(this.form_TOTAL_FORMS);
        this.form_container.appendChild(this.form_INITIAL_FORMS);
        this.form_container.appendChild(this.form_MIN_NUM_FORMS);
        this.form_container.appendChild(this.form_MAX_NUM_FORMS);
    }

    WordManager.prototype.register_modal = function(btn){
        if(!btn){
            return false;
        }
        let self = this;
        btn.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let modal = document.getElementById(btn.dataset.target);
            let container = document.getElementById(btn.dataset.container);
            let selected_langage = container.querySelector(`input[name='${btn.dataset.name}']`);
            let langages = Array.from(modal.querySelectorAll('.langage-selection'));
            let find = null;
            find = langages.find((c) => selected_langage.value == c.dataset.id);
            if(find){
                find.classList.add('selected');
            }
            self.active_word = btn.dataset.name;
            self.current_word_container = document.getElementById(btn.dataset.container);
            modal.style.display = "flex";
            if(window){
                $(window).click(function(eventModal){
                    if(eventModal.target == modal){
                        modal.style.display = "none";
                        self.active_word = undefined;
                        self.current_word_container = undefined;
                        let selected_list = modal.querySelectorAll('.selected');
                        if(selected_list){
                            selected_list.forEach((el) =>{
                                el.classList.remove('selected');
                            });
                        }
                    }
                });
            }
        });
        return true;
    }

    WordManager.prototype.add_word_form = function(prefix){
        let self = this;
        let result = this.wordFormFactory.create_form(this.total_form, PREFIX, this.remove_word_form.bind(this));
        
        this.form_container.appendChild(result.tag);
        let editor = new Editor_API.EditorWrapper(result.editor.id, {});
        editor.init()
        if(!editor.created){
            console.warn("Editor not created for tag %s", result.editor.id);
            return;
        }
        this.wrappers.push(result.tag);
        let registered_modal = this.register_modal(result['add-langage-btn']);
        if(!registered_modal){
            console.warn("Could not find lanage source ...");
            this.clear();
            return;
        }
        console.warn("Editor created for tag %s", result.editor.id);
        ['keyup'].forEach(function (e) {
            result.word_input.addEventListener(e, function(event){
                if(!result.word_input || !result.word_input.value || !result.word_input.value.trim().length){
                    result.word_input.value = "";
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.find_word.bind(self), QUERY_DELAY, result.word_input);
                //self.find_word(result.word_input);
            });
        });
        
        this.incremente_management_form();
        console.log("Added new country form %s", result.tag.id);
    };


    WordManager.prototype.remove_word_form = function(element_id){
        
        let element_index = this.wrappers.findIndex((element) => element.id == element_id);
        if(element_index > -1){
            console.log("Removing word form wrapper %s - Size %s", element_id, this.wrappers.length);
            this.wrappers.splice(element_index, 1);
            this.decremente_management_form();
            this.updateManagementFormIndex();
            console.log("Removed word form wrapper %s - Size %s", element_id, this.wrappers.length);
        }else{
            console.log("Removed word form wrapper  failed:  %s not found", element_id);
        }
        
    };

    WordManager.prototype.clear = function(){
        this.total_form = 0;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
        this.wrappers.length = 0;
        while(this.form_container.firstChild){
            this.form_container.removeChild(this.form_container.firstChild);
        }
    };

    WordManager.prototype.find_word = function(tag){
        let self = this;
        let url = `http://api.kemelang-local.com/find-word/?word=${tag.value}`;
        let option = {
            type:'GET',
            dataType: 'json',
            processData: false,
            contentType : false,
            crossDomain: true,
            url : url
        }
        ajax_api.ajax(option).then(function(response){
            if(response.success){
                self.on_word_exist(tag, response.found);
            }
        }, function(reason){
            console.error(reason);
        });
    }

    WordManager.prototype.on_word_exist = function(tag, word_exist){
        let target = document.getElementById(tag.dataset.error);
        target.classList.toggle('hidden', !word_exist);
        target.classList.toggle('warning', word_exist);
        tag.classList.toggle('warning', word_exist);
        this.form_is_valid = !word_exist;
    }

    WordManager.prototype.on_langage_selection_clicked = function(langage_tag){
        if(!langage_tag){
            return;
        }
        let selected = langage_tag.classList.contains('selected');
        let word_langage = document.querySelector(`input[name='${this.active_word}']`);
        if(selected){
            // remove langage
            
            if(word_langage){
                word_langage.value = "";
            }
            
        }else{
            // add langage.
            word_langage.value = langage_tag.dataset.id;
        }
        document.querySelectorAll('.langage-selection.selected').forEach((tag) =>{
            if(tag != langage_tag){
                tag.classList.remove('selected');
            }
        });
        langage_tag.classList.toggle('selected');

    }


    WordManager.prototype.updateFormIndex = function(tag, index){
        console.log("Updating FormIndex for Tag  and index %", index,tag);
        this.updatable_attrs.forEach(function(attr){
            if(tag.hasAttribute(attr)){
                tag.setAttribute(attr, tag.getAttribute(attr).replace(this.replace_pattern, index));
            }
        });
    }


    WordManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    WordManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    WordManager.prototype.updateManagementFormIndex = function(){
        let self = this;
        console.log("Updating Management Form : size %s", this.wrappers.length);
        this.wrappers.forEach(function (div, index) {
            console.log("Updating Index for wrapper %s - index %s", div.id, index);
            let managed_update = div.querySelectorAll('.managed-update');
            managed_update.forEach(function(e, i){
                console.log("Updating Index for wrapper %s", div.id);
                self.updateFormIndex(e, index);
            });
            self.updateFormIndex(div, index);
        });
    };

    WordManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.word_form);
        let url = "http://api.kemelang-local.com/create-word/";
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
    return WordManager;
});
