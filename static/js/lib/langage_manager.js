define(["ajax_api", 'tag_api', 'langage_form_factory','editor_api'],function(ajax_api, tag_api, LangageFormFactory, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;

    function register_modal(btn){
        if(!btn){
            return false;
        }
        btn.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let modal = document.getElementById(btn.dataset.target);
            let container = document.getElementById(btn.dataset.container);
            let selected_countries = container.querySelectorAll(`input:not([name='${btn.dataset.name}'])`);
            //let countries = modal.querySelectorAll('country-selection');
            let countries = Array.from(modal.querySelectorAll('country-selection'));
            let find = null;
            selected_countries.forEach(function(input, index){
                find = countries.find((c) => input.value == c.dataset.id);
                if(find){
                    find.classList.add('selected');
                }
            });
            
            modal.style.display = "flex";
            if(window){
                $(window).click(function(eventModal){
                    if(eventModal.target == modal){
                        modal.style.display = "none";
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
    }

    function LangageManager(){
        
        this.form = document.getElementById('langage-form');
        this.langage_form = document.getElementById('langage-form');
        this.form_container = document.getElementById('langage-form-container');
        this.wrappers = [];
        this.total_form = 0;
        this.input_max_length = 32;
        this.replace_pattern = /\d+/g;
    };
    LangageManager.prototype.init = function(){
        var self = this;
        if(!this.form_container){
            return;
        }
        this.langageFormFactory = new LangageFormFactory();
        this.langageFormFactory.init();
        let add_form_btn = document.getElementById('add-langage-btn');
        let create_langage_btn = document.getElementById('create-langage-btn');
        if(add_form_btn){
            add_form_btn.addEventListener('click', function(even){
                event.stopPropagation();
                event.preventDefault();
                console.log("Click on Add langage Form");
                self.add_langage_form('langage');
            });
        }
        self.create_managed_langage_form('langage');
        if(this.langage_form){
            this.langage_form.addEventListener('submit', function(even){
                event.stopPropagation();
                event.preventDefault();
                console.log("Click on Create langage Btn");
                self.submit();
                return false;
            });
        }
        console.log("langage Manager initialised");
    };

    LangageManager.prototype.create_managed_langage_form = function(prefix){
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

    LangageManager.prototype.add_langage_form = function(prefix){
        let result = this.langageFormFactory.create_form(this.total_form, prefix, this.remove_langage_form.bind(this));
        
        this.form_container.appendChild(result.tag);
        let editor = new Editor_API.EditorWrapper(result.editor.id, {});
        editor.init()
        if(!editor.created){
            console.warn("Editor not created for tag %s", result.editor.id);
            return;
        }
        this.wrappers.push(result.tag);
        let registered_modal = register_modal(result['add-country-btn']);
        if(!registered_modal){
            console.warn("Could not find country source ...");
            this.clear();
            return;
        }
        console.warn("Editor created for tag %s", result.editor.id);
        this.incremente_management_form();
        console.log("Added new langage form %s", result.tag.id);
    };


    LangageManager.prototype.remove_langage_form = function(element_id){
        
        let element_index = this.wrappers.findIndex((element) => element.id == element_id);
        if(element_index > -1){
            console.log("Removing langage form wrapper %s - Size %s", element_id, this.wrappers.length);
            this.wrappers.splice(element_index, 1);
            this.decremente_management_form();
            this.updateManagementFormIndex();
            console.log("Removed langage form wrapper %s - Size %s", element_id, this.wrappers.length);
        }else{
            console.log("Removed langage form wrapper  failed:  %s not found", element_id);
        }
        
    };

    LangageManager.prototype.clear = function(){
        this.total_form = 0;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
        this.wrappers.length = 0;
        while(this.form_container.firstChild){
            this.form_container.removeChild(this.form_container.firstChild);
        }
    };


    LangageManager.prototype.updateFormIndex = function(tag, index){
        console.log("Updating FormIndex for Tag  and index %", index,tag);
        if(tag.hasAttribute('id')){
            console.log()
            tag.setAttribute('id', tag.getAttribute('id').replace(this.replace_pattern, index));
        }
        
        if(tag.hasAttribute('name')){
            tag.setAttribute('name', tag.getAttribute('name').replace(this.replace_pattern, index));
        }
        if(tag.hasAttribute('for')){
            tag.setAttribute('for', tag.getAttribute('for').replace(this.replace_pattern, index));
        }
    }


    LangageManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    LangageManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    LangageManager.prototype.updateManagementFormIndex = function(){
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

    LangageManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.langage_form);
        let url = "http://api.kemelang-local.com/create-langage/";
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
    return LangageManager;
});
