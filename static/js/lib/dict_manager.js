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
        this.langage_selection_list = Array.from(document.querySelectorAll('.langage-selection'));
        this.dict_text = document.getElementById('dict-text');
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
        ['keyup'].forEach(function (e) {
            self.dict_text.addEventListener(e, function(event){
                if(!self.dict_text || !self.dict_text.value || !self.dict_text.value.trim().length){
                    self.dict_text.value = "";
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.find_word.bind(self), QUERY_DELAY, self.dict_text);
                //self.find_word(self.dict_text);
            });
        });
        
        console.log("DictManager initialised");
    };

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
