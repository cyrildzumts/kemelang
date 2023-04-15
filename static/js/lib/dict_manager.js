define(["ajax_api", 'tag_api', 'dict_factory','editor_api'],function(ajax_api, tag_api, DictFactory, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "word";
    const QUERY_DELAY = 800;


    function DictManager(){
        
        this.form = document.getElementById('dict-form');
        this.word_form = document.getElementById('dict-form');
        this.form_container = document.getElementById('dict-form-container');
        this.form_def_container = document.getElementById('dict-def-container');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.langage_selection_list = Array.from(document.querySelectorAll('.dict-langage-selection'));
        this.dict_text = document.getElementById('dict-text');
        this.no_filter_results = document.getElementById('no-results');
        this.dict_text_definitions = document.getElementById('word-definitions-container');
        this.wrappers = [];
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
        
        
    };

    DictManager.prototype.filter_langage = function(value){
        let selft = this;
        let found_any = false;
        if(value || value.trim() == ''){
            return;
        }
        this.langage_selection_list.forEach(function(lang){
            let contained = lang.dataset.slug.includes(value) || lang.dataset.name.includes(value);
            found_any = found_any || contained;
            lang.classList.toggle('hidden', !contained);
        });
        this.no_filter_results.classList.toggle('hidden', !found_any);
        
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
