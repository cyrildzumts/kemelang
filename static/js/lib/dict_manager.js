define(["ajax_api", 'tag_api', 'dict_factory','editor_api', 'constants'],function(ajax_api, tag_api, DictFactory, Editor_API, Constants) {
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
    const API_BASE_URL = Constants.API_BASE_URL;


    function remove_children(tag){
        while(tag.firstChild){
            tag.removeChild(tag.firstChild);
        }
    }


    function DictManager(){
        
        this.form = document.getElementById('dict-form');
        this.word_form = document.getElementById('dict-form');
        this.form_container = document.getElementById('dict-form-container');
        this.form_def_container = document.getElementById('dict-def-container');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.langage_selection_list = Array.from(document.querySelectorAll('.dict-langage-selection'));
        this.dict_text = document.getElementById('dict-text');
        this.detect_source_langage = document.getElementById('select-detect-langage');
        this.auto_detect_source_langage = document.getElementById('auto-select-detect-langage');
        this.select_source_langage = document.getElementById('select-source-langage');
        this.select_target_langage = document.getElementById('select-target-langage');
        this.translation_placeholder = document.getElementById('translation-placeholder');
        this.no_translation = document.getElementById('no-translation');
        this.swap_langage_btn = document.getElementById('swap-langage-btn');
        this.buttons = [this.select_source_langage, this.select_target_langage];
        this.recent_sources_langages = document.getElementById('recent-source-langages');
        this.recent_target_langages = document.getElementById('recent-target-langages');
        this.no_filter_results = document.getElementById('no-results');
        this.dict_text_definitions = document.getElementById('word-definitions-container');
        this.dict_translation_container = document.getElementById('word-translations-container');
        this.word_suggestion_container = document.getElementById('word-suggestion-container');
        this.word_container = document.getElementById("word-container");
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
                    self.clear_definitions();
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
                switch (parseInt(self.selection_type)) {
                    case SELECTION_TYPE_AUTO:
                        self.update_auto_detect(lang);
                        break;
                    case SELECTION_TYPE_SOURCE:
                        self.update_source_lang(lang);
                        break;
                    case SELECTION_TYPE_TARGET:
                        self.update_target_lang(lang);
                        break;
                    default:
                        break;
                }
                self.translate();
            });
        });
        this.buttons.forEach(function(button){
            button.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                self.selection_type = button.dataset.type;
                self.auto_detect_source_langage.classList.toggle('hidden', button.dataset.type == SELECTION_TYPE_TARGET);
            });
        });

        this.swap_langage_btn.addEventListener('click', function(event){
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
        this.init_default_lang();
        console.log("Dict Manager ready");
        
    };

    DictManager.prototype.update_source_lang = function(lang){
            
        this.source_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
        remove_children(this.recent_sources_langages);
        this.recent_sources_langages.appendChild(tag_api.create_tag({'element':'button','options':{
            'cls': 'mat-button selected',
            'data-name': lang.dataset.name,
            'data-slug': lang.dataset.slug,
            'data-id': lang.dataset.id,
            'innerText': lang.dataset.name
        }}));
        this.detect_source_langage.classList.remove('selected');
        this.auto_detect_source_langage.classList.remove('selected');
        this.swap_langage_btn.disabled = (this.source_langage && this.target_langage) == undefined;
    }

    DictManager.prototype.update_target_lang = function(lang){
        if(this.selection_type == SELECTION_TYPE_TARGET && lang.dataset.slug == "auto"){
            return;
        }
        this.target_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
        remove_children(this.recent_target_langages);
        this.recent_target_langages.appendChild(tag_api.create_tag({'element':'button','options':{
            'cls': 'mat-button selected',
            'data-name': lang.dataset.name,
            'data-slug': lang.dataset.slug,
            'data-id': lang.dataset.id,
            'innerText': lang.dataset.name
        }}));
        this.swap_langage_btn.disabled = (this.source_langage && this.target_langage) == undefined;
    }

    DictManager.prototype.update_auto_detect = function(lang){
            
        this.source_langage = {'id': lang.dataset.id ,'name': lang.dataset.name,  'slug': lang.dataset.slug};
        remove_children(this.recent_sources_langages);
        this.recent_sources_langages.appendChild(tag_api.create_tag({'element':'button','options':{
            'cls': 'mat-button selected',
            'data-name': lang.dataset.name,
            'data-slug': lang.dataset.slug,
            'data-id': lang.dataset.id,
            'innerText': lang.dataset.name
        }}));
        this.detect_source_langage.classList.add('selected');
        this.auto_detect_source_langage.classList.add('selected');
        this.swap_langage_btn.disabled = true;
    }

    DictManager.prototype.init_default_lang = function(){
        try {
           this.source_langage = {
                'id': this.select_source_langage.dataset.defaultLanguageId,
                'name': this.select_source_langage.dataset.defaultLanguageName,
                'slug': this.select_source_langage.dataset.defaultLanguageSlug
           };
           this.target_langage = {
                'id': this.select_target_langage.dataset.defaultLanguageId,
                'name': this.select_target_langage.dataset.defaultLanguageName,
                'slug': this.select_target_langage.dataset.defaultLanguageSlug
            };
            this.update_recent_langages(false);
            console.info("Default languages set");
        } catch (error) {
            console.error("Error on initializing default language", error);
        }
    };

    DictManager.prototype.update_recent_langages = function(auto_detect){
        this.clear_recent_langages();
        if(auto_detect){
            this.recent_sources_langages.appendChild(tag_api.create_tag({'element':'button','options':{
                'cls': 'mat-button selected',
                'data-name': "auto-detect",
                'data-slug': "auto-detect",
                'data-id': "auto-detect",
                'innerText': "Auto Detect"
            }}));
        }else if(this.source_langage){
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
        let url = `${Constants.API_BASE_URL}/search-word/?word=${self.dict_text.value}`;
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
        if(this.source_langage == undefined && this.selection_type != SELECTION_TYPE_AUTO){
            this.translation_placeholder.classList.remove('hidden');
            return;
        }
        let sl = "auto";
        if(this.source_langage){
            sl = this.source_langage.slug;
        }
        console.log(`translate text=${this.dict_text.value} from sl=${sl} to tl=${this.target_langage.slug}`);
        this.last_search = this.dict_text.value;
        let url = `${Constants.API_BASE_URL}/translate/?sl=${sl}&tl=${this.target_langage.slug}&word=${this.dict_text.value}`;
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
                self.clear_definitions();
                if(response.found){
                    self.on_translated(self.dict_text, response.translations);
                    self.on_word_exist(self.dict_text,response.word,response.words);
                }else if (response.word && response.words){
                    self.on_word_exist(self.dict_text,response.word,response.words);
                }else if (response.suggestions){
                    self.on_suggestion_found(self.dict_text, response.suggestions);
                }
                self.translation_placeholder.classList.add('hidden');
                self.no_translation.classList.toggle('hidden', response.found);
            }else{
                console.warn(`translation not found. ${response.message}`);
            }
        }, function(reason){
            console.error(reason);
        });
    }

    DictManager.prototype.on_word_exist = function(tag, word ,words){
        let self = this;
        self.dictFactory.create_word(self.word_container, word);
    }

    DictManager.prototype.on_translated = function(tag, translations){
        let self = this;
        translations.forEach(function(translation){
            let word = self.dictFactory.create_word(self.dict_translation_container, translation);
            word.classList.add('word-input-wrapper');
        });
        console.log("Translations : ", translations);
    }

    DictManager.prototype.on_suggestion_found = function(tag, suggestions){
        let self = this;
        
        suggestions.forEach(function(word){
            let word = self.dictFactory.create_word(self.word_translation_container, word);
            word.classList.add('word-input-wrapper');
        });
        console.log("Suggestions : ", suggestions);
    }

    DictManager.prototype.clear_definitions = function(){
        remove_children(this.dict_translation_container);
        remove_children(this.dict_text_definitions);
        remove_children(this.word_container);
        remove_children(this.dict_translation_container);
        remove_children(this.word_suggestion_container);
    }


    DictManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.word_form);
        let url = `${Constants.API_BASE_URL}/create-word/`;
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
