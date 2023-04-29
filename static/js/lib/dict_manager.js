define(["ajax_api", 'tag_api', 'dict_factory','editor_api'],function(ajax_api, tag_api, DictFactory, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "word";
    const QUERY_DELAY = 800;
    const SELECTION_TYPE_SOURCE = 0;
    const SELECTION_TYPE_TARGET = 1;
    const SELECTION_TYPE_AUTO = 2;
    const API_BASE_URL = "https://api.kemelang-local.com"


    function DictManager(){
        
        this.form = document.getElementById('dict-form');
        this.word_form = document.getElementById('dict-form');
        this.form_container = document.getElementById('dict-form-container');
        this.form_def_container = document.getElementById('dict-def-container');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.langage_selection_list = Array.from(document.querySelectorAll('.dict-langage-selection'));
        this.dict_text = document.getElementById('dict-text');
        this.detect_source_langage = document.getElementById('select-detect-langage');
        this.select_source_langage = document.getElementById('select-source-langage');
        this.select_target_langage = document.getElementById('select-target-langage');
        this.translation_placeholder = document.getElementById('translation-placeholder');
        this.no_translation = document.getElementById('no-translation');
        this.swap_langage_btn = document.querySelectorAll('.swap-langage-btn');
        this.buttons = [this.detect_source_langage, this.select_source_langage, this.select_target_langage];
        this.recent_sources_langages = document.getElementById('recent-source-langages');
        this.recent_target_langages = document.getElementById('recent-target-langages');
        this.no_filter_results = document.getElementById('no-results');
        this.dict_text_definitions = document.getElementById('word-definitions-container');
        this.wrappers = [];
        this.detect_langage_active = true;
        this.source_langage = undefined;
        this.target_langage = undefined;
        this.last_search = "";
        this.selection_type = SELECTION_TYPE_AUTO;
        this.form_is_valid = false;
        this.total_form = 0;
        this.input_max_length = 32;
        this.scheduled_query = undefined;
        this.replace_pattern = /\d+/g;
    };
    DictManager.prototype.init = function(){
        if(!this.dict_text){
            return;
        }
        let self = this;
        this.dictFactory = new DictFactory();
        this.dictFactory.init();
        let search_filter = document.getElementById('search-langages');
        ['keyup'].forEach(function (e) {
            self.dict_text.addEventListener(e, function(event){
                if(!self.dict_text || !self.dict_text.value || self.dict_text.value.trim() == ''){
                    self.dict_text.value = "";
                    self.last_search = "";
                    self.translation_placeholder.classList.remove('hidden');
                    self.no_translation.classList.add('hidden');
                    if(self.dict_text_definitions.firstChild){
                        self.clear_definitions();
                    }
                    return;
                }else if(self.dict_text.value == self.last_search){
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                //self.scheduled_query = setTimeout(self.find_word.bind(self), QUERY_DELAY);
                self.scheduled_query = setTimeout(self.translate.bind(self), QUERY_DELAY);
                
            });
            search_filter.addEventListener(e, function(event){
                if(search_filter.value.trim().length == 0){
                    self.langage_selection_list.forEach(function(lang){
                        lang.classList.remove('hidden');
                    });
                    self.no_filter_results.classList.add('hidden');
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.filter_langage.bind(self), QUERY_DELAY, search_filter.value.trim());
            });
        });
        this.langage_selection_list.forEach(function(lang){
            lang.addEventListener('click', function(event){
                event.stopPropagation();
                if(self.selection_type == SELECTION_TYPE_SOURCE){
                    self.source_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
                    if(self.recent_sources_langages.firstChild){
                        self.recent_sources_langages.removeChild(self.recent_sources_langages.firstChild);
                    }
                    self.recent_sources_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                        'cls': 'mat-button selected',
                        'data-name': lang.dataset.name,
                        'data-slug': lang.dataset.slug,
                        'data-id': lang.dataset.id,
                        'innerText': lang.dataset.name
                    }}));
                    self.detect_source_langage.classList.remove('selected');
                    
                }else if(self.selection_type == SELECTION_TYPE_TARGET){
                    self.target_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
                    if(self.recent_target_langages.firstChild){
                        self.recent_target_langages.removeChild(self.recent_target_langages.firstChild);
                    }
                    self.recent_target_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                        'cls': 'mat-button selected',
                        'data-name': lang.dataset.name,
                        'data-slug': lang.dataset.slug,
                        'data-id': lang.dataset.id,
                        'innerText': lang.dataset.name
                    }}));
                    
                }else{
                    // we should never get here.
                    console.error("Something that should never happend just happended !");
                }
            });
        });
        this.buttons.forEach(function(button){
            button.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                self.selection_type = button.dataset.type;
                button.classList.toggle('selected', !button.classList.contains('selected'));
                if(button.dataset.type == SELECTION_TYPE_AUTO){
                    self.source_langage = undefined;
                    self.update_recent_langages();
                    //self.translate();
                }else if(button.dataset.type == SELECTION_TYPE_SOURCE){

                }else if(button.dataset.type == SELECTION_TYPE_TARGET){
                    
                }
            });
        });

        this.swap_langage_btn.forEach(function(button){
            button.addEventListener('click', function(event){
                event.stopPropagation();
                if(!self.source_langage || !self.target_langage){
                    return;
                }
                let old_source_lang = {'id': self.source_langage.id, 'name': self.source_langage.name, 'slug': self.source_langage.slug}
                self.source_langage = {'id': self.target_langage.id, 'name': self.target_langage.name, 'slug': self.target_langage.slug}
                self.target_langage = {'id': old_source_lang.id, 'name': old_source_lang.name, 'slug': old_source_lang.slug}
                self.update_recent_langages();
                self.translate();
            });
        });
        
    };

    DictManager.prototype.update_recent_langages = function(){
        this.clear_recent_langages();
        if(this.source_langage){
            this.recent_sources_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                'cls': 'mat-button selected',
                'data-name': this.source_langage.name,
                'data-slug': this.source_langage.slug,
                'data-id': this.source_langage.id,
                'innerText': this.source_langage.name
            }}));
        }
        if(this.target_langage){
            this.recent_target_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                'cls': 'mat-button selected',
                'data-name': this.target_langage.name,
                'data-slug': this.target_langage.slug,
                'data-id': this.target_langage.id,
                'innerText': this.target_langage.name
            }}));
        }
        
    }

    DictManager.prototype.clear_recent_langages = function(){
        if(this.recent_sources_langages.firstChild){
            this.recent_sources_langages.removeChild(this.recent_sources_langages.firstChild);
        }

        if(this.recent_target_langages.firstChild){
            this.recent_target_langages.removeChild(this.recent_target_langages.firstChild);
        }
        
    }

    DictManager.prototype.filter_langage = function(value){
        let selft = this;
        let found_any = false;
        if(!value || value.trim() == ''){
            return;
        }
        this.langage_selection_list.forEach(function(lang){
            let contained = lang.dataset.slug.includes(value) || lang.dataset.name.includes(value);
            found_any = found_any || contained;
            lang.classList.toggle('hidden', !contained);
        });
        this.no_filter_results.classList.toggle('hidden', found_any);
        
    }

    DictManager.prototype.register_modal = function(btn){
        if(!btn){
            return false;
        }
        let self = this;
        let select_source_lang_btn = document.getElementById('select-source-langage');
        let select_target_lang_btn = document.getElementById('select-target-langage');
        [select_source_lang_btn,select_target_lang_btn].forEach(function(button){
            button.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
            });
        });
        btn.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            self.active_langage = btn.dataset.name;
            self.langage_index = btn.dataset.index;
            self.current_langage_container = document.getElementById(btn.dataset.container);
            let modal = document.getElementById(btn.dataset.target);
            
            let selection = self.active_langages[self.langage_index].countries;
            
            self.country_selection_list.forEach((c) =>{
                c.classList.toggle('selected', selection.includes(c.dataset.name));
            });
            modal.style.display = "flex";
            if(window){
                $(window).click(function(eventModal){
                    if(eventModal.target == modal){
                        modal.style.display = "none";
                        self.active_langage = undefined;
                        self.current_langage_container = undefined;
                        self.langage_index = undefined;
                        self.country_selection_list.forEach((c) =>{
                            c.classList.remove('selected');
                        });
                    }
                });
            }
        });
        return true;
    }

    DictManager.prototype.find_word = function(){
        let self = this;
        let url = `${API_BASE_URL}/search-word/?word=${self.dict_text.value}`;
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
                self.on_word_exist(self.dict_text, response.words);
            }else{
                console.warn(`word not found. ${response.message}`)
            }
        }, function(reason){
            console.error(reason);
        });
    }

    DictManager.prototype.translate = function(){
        let self = this;
        
        if(!this.dict_text || this.dict_text.value.trim().length == 0 || !this.target_langage){
            this.translation_placeholder.classList.remove('hidden');
            return;
        }
        let sl = "auto";
        if(this.source_langage){
            sl = this.source_langage.slug;
        }
        console.log(`translate text=${this.dict_text.value} from sl=${sl} to tl=${this.target_langage.slug}`);
        this.last_search = this.dict_text.value;
        let url = `${API_BASE_URL}/translate/?sl=${sl}&tl=${this.target_langage.slug}&word=${this.dict_text.value}`;
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
                if(response.found){
                    self.on_translated(self.dict_text, response.translations);
                    self.on_word_exist(self.dict_text,response.words)
                }else if (response.words){
                    self.on_word_exist(self.dict_text,response.words)
                }else{
                    self.clear_definitions();
                }
                self.translation_placeholder.classList.add('hidden');
                self.no_translation.classList.toggle('hidden', response.found);
                
                
            }else{
                console.warn(`translation not found. ${response.message}`)
            }
        }, function(reason){
            console.error(reason);
        });
    }

    DictManager.prototype.on_word_exist = function(tag, words){
        let self = this;
        this.clear_definitions();
        words.forEach(function(word){
            self.dictFactory.create_word(self.dict_text_definitions, word);
        });
    }

    DictManager.prototype.on_translated = function(tag, translations){
        let self = this;
        this.clear_definitions();
        translations.forEach(function(translation){
            self.dictFactory.create_word(self.dict_text_definitions, translation.target_word);
        });
    }

    DictManager.prototype.clear_definitions = function(){
        while(this.dict_text_definitions.firstChild){
            this.dict_text_definitions.removeChild(this.dict_text_definitions.firstChild);
        }
    }


    DictManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.word_form);
        let url = `${API_BASE_URL}/create-word/`;
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
    return DictManager;
});
