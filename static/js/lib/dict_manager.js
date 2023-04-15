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
        this.swap_langage_btn = document.getElementById('swap-langage-btn');
        this.buttons = [this.detect_source_langage, this.select_source_langage, this.select_target_langage];
        this.recent_sources_langages = document.getElementById('recent-source-langages');
        this.recent_target_langages = document.getElementById('recent-target-langages');
        this.no_filter_results = document.getElementById('no-results');
        this.dict_text_definitions = document.getElementById('word-definitions-container');
        this.wrappers = [];
        this.detect_langage_active = true;
        this.source_langage = undefined;
        this.target_langage = undefined;
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
                if(!self.dict_text || !self.dict_text.value || !self.dict_text.value.trim().length){
                    self.dict_text.value = "";
                    if(self.dict_text_definitions.firstChild){
                        self.clear_definitions();
                    }
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.find_word.bind(self), QUERY_DELAY, self.dict_text);
                //self.find_word(self.dict_text);
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
                if(self.selection_type == SELECTION_TYPE_SOURCE){
                    self.source_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
                    self.recent_sources_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                        'cls': 'mat-button active',
                        'data-name': lang.dataset.name,
                        'data-slug': lang.dataset.slug,
                        'data-id': lang.dataset.id
                    }}));
                }else if(self.selection_type){
                    self.target_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
                    self.recent_target_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                        'cls': 'mat-button active',
                        'data-name': lang.dataset.name,
                        'data-slug': lang.dataset.slug,
                        'data-id': lang.dataset.id
                    }}));
                }
            });
        });
        this.buttons.forEach(function(button){
            button.addEventListener('click', function(event){
                event.preventDefault();
                self.selection_type = button.dataset.type;
                button.classList.toggle('active', !button.classList.contains('active'));
                if(button.dataset.type == SELECTION_TYPE_AUTO){
                    
                }else if(button.dataset.type == SELECTION_TYPE_SOURCE){

                }else if(button.dataset.type == SELECTION_TYPE_TARGET){
                    
                }
            });
        });
        
    };

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

    DictManager.prototype.find_word = function(tag){
        let self = this;
        let url = `http://api.kemelang-local.com/search-word/?word=${tag.value}`;
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
                self.on_word_exist(tag, response.words);
            }else{

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

    DictManager.prototype.clear_definitions = function(){
        while(this.dict_text_definitions.firstChild){
            this.dict_text_definitions.removeChild(this.dict_text_definitions.firstChild);
        }
    }


    DictManager.prototype.submit = function(){
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
    return DictManager;
});
