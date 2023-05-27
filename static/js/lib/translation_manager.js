define(["ajax_api", 'tag_api', 'translation_form_factory'],function(ajax_api, tag_api, TranslationFormFactory) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "translation";
    const QUERY_DELAY = 800;
    const API_BASE_URL = "https://api.kemelang-local.com"


    function TranslationManager(){
        
        this.form = document.getElementById('translation-form');
        this._form = document.getElementById('translation-form');
        this.form_container = document.getElementById('translation-form-container');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.langage_selection_list = Array.from(document.querySelectorAll('.langage-selection'));
        this.translationFormFactory;
        this.span_selected_langage = undefined;
        this.span_selected_source_langage = undefined;
        this.span_selected_target_langage = undefined;
        this.current_langage_container = undefined;
        this.current_target = undefined;
        this.wrappers = [];
        this.active_translations = {};
        this.active_translation = {};
        this._index = undefined;
        this.form_is_valid = false;
        this.total_form = 0;
        this.scheduled_query = undefined;
        this.input_max_length = 32;
        this.replace_pattern = /\d+/g;
    };
    TranslationManager.prototype.init = function(){
        var self = this;
        if(!this.form_container){
            return;
        }
        this.loader = document.getElementById('loader');
        this.translationFormFactory = new TranslationFormFactory();
        this.translationFormFactory.init();
        let add_form_btn = document.getElementById('add-btn');
        let create_btn = document.getElementById('create-btn');
        if(add_form_btn){
            add_form_btn.addEventListener('click', function(even){
                event.stopPropagation();
                event.preventDefault();
                self.add_form(PREFIX);
            });
        }
        self.create_managed_form(PREFIX);
        if(this._form){
            this._form.addEventListener('submit', function(even){
                event.stopPropagation();
                event.preventDefault();
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
        
    };


    TranslationManager.prototype.create_managed_form = function(prefix){
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

    TranslationManager.prototype.register_modal = function(btn){
        if(!btn){
            return false;
        }
        let self = this;
        btn.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let modal = document.getElementById(btn.dataset.target);
            self._index = btn.dataset.index;
            
            self.span_selected_langage = document.getElementById(btn.dataset.selected);
            self.current_translation_container = document.getElementById(btn.dataset.container);
            //let selection = self.active_translations[self._index].langages;
            self.active_translation = self.active_translations[btn.dataset.index];
            let translation = self.active_translation[btn.dataset.selector];
            self.current_target = translation;
            self.langage_selection_list.forEach((c) =>{
                c.classList.toggle('selected', translation.langage.dataset.lang == c.dataset.name );
            });

            //self.active_word = btn.dataset.name;
            //self.current_translation_container = document.getElementById(btn.dataset.container);
            modal.style.display = "flex";
            if(window){
                $(window).click(function(eventModal){
                    if(eventModal.target == modal){
                        modal.style.display = "none";
                        //self.active_word = undefined;
                        self.current_translation_container = undefined;
                        self.span_selected_langage = undefined;
                        self.active_translation = undefined;
                        self._index = undefined;
                        self.current_target = undefined;
                        self.langage_selection_list.forEach((c) =>{
                            c.classList.remove('selected');
                        });
                    }
                });
            }
        });
        return true;
    }

    TranslationManager.prototype.add_form = function(prefix){
        let self = this;
        let result = this.translationFormFactory.create_form(this.total_form, PREFIX, this.remove_form.bind(this));
        let translation = result['translation'];
        this.form_container.appendChild(result.tag);
        this.wrappers.push(result.tag);
        this.active_translations[result.index] = translation;
        translation['langages-btn'].forEach(this.register_modal.bind(this));
        let words = [translation['source'].word, translation['target'].word];
        let remove_warnin_on_word = (word) =>{
            let error_target = document.getElementById(word.dataset.error);
            error_target.classList.add('hidden');
            error_target.classList.remove('warning');
            word.classList.remove('warning');
        }
        ['keyup','change'].forEach(function (e) {
            words.forEach(function(word){
                word.addEventListener(e, function(event){
                    event.stopPropagation();
    
                    if(!word.value.trim().length){
                        word.value = "";
                        remove_warnin_on_word(word);
                        return;
                    }
                    if(!word.dataset.lang){
                        remove_warnin_on_word(word);
                        return;
                    }
                    if(self.scheduled_query){
                        clearTimeout(self.scheduled_query);
                    }
                    self.scheduled_query = setTimeout(self.find_word.bind(self), QUERY_DELAY, word, word.dataset.lang);
                });
            });
            
        });
        
        this.incremente_management_form();
        
    };


    TranslationManager.prototype.remove_form = function(tag){
        let index = tag['index'];
        let element_index = this.wrappers.findIndex((element) => element.id == tag['id']);
        if(element_index > -1){
            
            this.wrappers.splice(element_index, 1);
            delete this.active_translations[index];
            this.decremente_management_form();
            this.updateManagementFormIndex();
            
        }else{
            console.log("Removed word form wrapper  failed:  %s not found", tag['id']);
        }
        
    };

    TranslationManager.prototype.clear = function(){
        this.total_form = 0;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
        this.wrappers.length = 0;
        while(this.form_container.firstChild){
            this.form_container.removeChild(this.form_container.firstChild);
        }
    };

    TranslationManager.prototype.find_word = function(tag, lang){
        if(!lang || !tag || !tag.value.trim()){
            return;
        }
        let self = this;
        let url = `${API_BASE_URL}/find-word/?word=${tag.value}&lang=${lang}`;
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
                self.on_word_exist(tag,response.words, response.found);
            }
        }, function(reason){
            console.error(reason);
        });
    }

    TranslationManager.prototype.on_word_exist = function(tag, word_list, word_exist){
        let target = document.getElementById(tag.dataset.error);
        target.classList.toggle('hidden', word_exist);
        target.classList.toggle('warning', !word_exist);
        tag.classList.toggle('warning', !word_exist);
        this.form_is_valid = word_exist;
        if(word_exist){
            console.log("found %s word for query %", word_list.length, tag.value);
            console.log("found words : ", word_list);
            let word = document.getElementById(tag.dataset.target);
            word.value = word_list[0].id;
        }
    }

    TranslationManager.prototype.on_langage_selection_clicked = function(langage_tag){
        if(!langage_tag){
            return;
        }
        let self = this;
        let selected = langage_tag.classList.contains('selected');
        let translation = this.active_translations[this._index];
        let selection = this.current_target['selection'];
        let langage_name = langage_tag.dataset.name;
        let lang_slug = langage_tag.dataset.slug;
        
        if(selected){
            // remove langage
            self.current_target.langage.value = "";
            self.current_target.langage.dataset.lang = "";
            self.current_target.word.dataset.lang = "";
            selection.removeChild(document.getElementById(langage_name));
            
        }else{
            while(selection.firstChild){
                selection.removeChild(selection.firstChild);
            }
            /*
            let input = tag_api.create_tag({'element': 'input', 'options': {
                'name': this.active_word,
                'value': langage_tag.dataset.id,
                'data-name': langage_name,
                'data-slug': lang_slug,
                'type': 'hidden'
            }});
            */
            self.current_target.langage.value = langage_tag.dataset.id;
            self.current_target.langage.dataset.lang = lang_slug;
            self.current_target.word.dataset.lang = lang_slug;
            selection.appendChild(tag_api.create_tag({'element':'span','options':{
                'cls': 'chips small',
                'innerText': langage_name,
                'id': langage_name
            }}));
            
            if(self.current_target.word.value.trim().length > 0 ){
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.find_word.bind(self), QUERY_DELAY, self.current_target.word, lang_slug);
            }
            
        }
        this.langage_selection_list.forEach((c) =>{
            if(c != langage_tag){
                c.classList.remove('selected');
            }
        });
        langage_tag.classList.toggle('selected', !selected);

    }


    TranslationManager.prototype.updateFormIndex = function(tag, index){
        
        let self = this;
        this.updatable_attrs.forEach(function(attr){
            if(tag.hasAttribute(attr)){
                tag.setAttribute(attr, tag.getAttribute(attr).replace(self.replace_pattern, index));
            }
        });
    }


    TranslationManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    TranslationManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    TranslationManager.prototype.updateManagementFormIndex = function(){
        let self = this;
        
        this.wrappers.forEach(function (div, index) {
            
            let managed_update = div.querySelectorAll('.managed-update');
            managed_update.forEach(function(e, i){
                
                self.updateFormIndex(e, index);
            });
            self.updateFormIndex(div, index);
        });
    };

    TranslationManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this._form);
        let url = `${API_BASE_URL}/create-translation/`;
        let option = {
            type:'POST',
            dataType: 'json',
            processData: false,
            contentType : false,
            enctype : 'multipart/form-data',
            crossDomain: true,
            data: formData,
            url : url,
            beforSend: function(xhr, status){
                let loader = document.getElementById('loader');
                loader.style.display = "";
            },
            complete: function(xhr, status){
                let loader = document.getElementById('loader');
                loader.style.display = "none";
            }
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
    return TranslationManager;
});
