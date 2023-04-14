define(["ajax_api", 'tag_api', 'langage_form_factory','editor_api'],function(ajax_api, tag_api, LangageFormFactory, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "langage";
    const QUERY_DELAY = 800;

    function register_modal(btn){
        if(!btn){
            return false;
        }
        btn.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let modal = document.getElementById(btn.dataset.target);
            let container = document.getElementById(btn.dataset.container);
            let selected_countries = container.querySelectorAll(`input([name='${btn.dataset.name}'])`);
            //let countries = modal.querySelectorAll('country-selection');
            let countries = Array.from(modal.querySelectorAll('.country-selection'));
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
        return true;
    }

    function LangageManager(){
        
        this.form = document.getElementById('langage-form');
        this.langage_form = document.getElementById('langage-form');
        this.form_container = document.getElementById('langage-form-container');
        this.country_selection_list = Array.from(document.querySelectorAll('.country-selection'));
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.active_langage = undefined;
        this.active_langages = {};
        this.langage_index = undefined;
        this.current_langage_container = undefined;
        this.wrappers = [];
        this.form_is_valid = false;
        this.total_form = 0;
        this.scheduled_query = undefined;
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
                self.add_langage_form('langage');
            });
        }
        self.create_managed_langage_form('langage');
        if(this.langage_form){
            this.langage_form.addEventListener('submit', function(even){
                event.stopPropagation();
                event.preventDefault();
                self.submit();
                return false;
            });
        }
        this.country_selection_list.forEach(function(c){
            c.addEventListener('click', function(event){
                event.stopPropagation();
                self.on_country_selection_clicked(c);
            });
        });
        
    };


    LangageManager.prototype.register_modal = function(btn){
        if(!btn){
            return false;
        }
        let self = this;
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
        let self = this;
        let result = this.langageFormFactory.create_form(this.total_form, prefix, this.remove_langage_form.bind(this));
        
        this.form_container.appendChild(result.tag);
        let editor = new Editor_API.EditorWrapper(result.editor.id, {});
        editor.init()
        if(!editor.created){
            console.warn("Editor not created for tag %s", result.editor.id);
            return;
        }
        this.wrappers.push(result.tag);

        //lang[result.index] = {'countries': [], 'selection': result.selection};
        this.active_langages[result.index] = {'countries': [], 'selection': result.selection};
        let registered_modal = this.register_modal(result['add-country-btn']);
        if(!registered_modal){
            console.warn("Could not find country source ...");
            this.clear();
            return;
        }
        ['keyup'].forEach(function (e) {
            result.name_input.addEventListener(e, function(event){
                if(!result.name_input || !result.name_input.value || !result.name_input.value.trim().length){
                    result.name_input.value = "";
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.find_langage.bind(self), QUERY_DELAY, result.name_input);
                //self.find_langage(result.name_input);
            });
        });
        
        this.incremente_management_form();
    };

    LangageManager.prototype.find_langage = function(tag){
        let self = this;
        let url = `http://api.kemelang-local.com/find-langage/?langage=${tag.value}`;
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
                self.on_langage_exist(tag, response.found);
            }
        }, function(reason){
            console.error(reason);
        });
    }

    LangageManager.prototype.on_langage_exist = function(tag, lang_exist){
        let target = document.getElementById(tag.dataset.error);
        target.classList.toggle('hidden', !lang_exist);
        target.classList.toggle('warning', lang_exist);
        tag.classList.toggle('warning', lang_exist);
        this.form_is_valid = !lang_exist;
    }


    LangageManager.prototype.on_country_selection_clicked = function(country_tag){
        if(!country_tag){
            return;
        }
        let selected = country_tag.classList.contains('selected');
        let lang = this.active_langages[this.langage_index];
        let selection = lang['selection'];
        let country_name = country_tag.dataset.name;
        if(selected){
            // remove country
            let selected_country = document.querySelector(`input[name='${this.active_langage}'][value='${country_tag.dataset.id}']`);
            if(selected_country){
                selected_country.remove();
                let list = lang['countries'];
                let i = list.findIndex((c) => c == country_name);
                list.splice(i, 1);
                selection.removeChild(document.getElementById(country_name));
                
            }
            
        }else{
            // add country.
            let input = tag_api.create_tag({'element': 'input', 'options': {
                'name': this.active_langage,
                'value': country_tag.dataset.id,
                'type': 'hidden'
            }});
            lang['countries'].push(country_name);
            selection.appendChild(tag_api.create_tag({'element':'span','options':{
                'cls': 'chips small',
                'innerText': country_name,
                'id': country_name
            }}));
            this.current_langage_container.appendChild(input);
        }
        country_tag.classList.toggle('selected');
        //selection.classList.toggle('hidden', lang.countries.length == 0);

    }


    LangageManager.prototype.remove_langage_form = function(tag){
        let index = tag['index'];
        let element_index = this.wrappers.findIndex((element) => element.id == tag['id']);
        if(element_index > -1){
            
            this.wrappers.splice(element_index, 1);
            delete this.active_langages[index];
            this.decremente_management_form();
            this.updateManagementFormIndex();
        
        }else{
            console.log("Removed langage form wrapper  failed:  %s not found", tag['id']);
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
        let self = this;
        this.updatable_attrs.forEach(function(attr){
            if(tag.hasAttribute(attr)){
                tag.setAttribute(attr, tag.getAttribute(attr).replace(self.replace_pattern, index));
            }
        });
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
        
        this.wrappers.forEach(function (div, index) {
            
            let managed_update = div.querySelectorAll('.managed-update');
            managed_update.forEach(function(e, i){
                
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
