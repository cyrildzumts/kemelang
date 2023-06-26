define(["ajax_api", 'tag_api', 'country_form_factory','editor_api'],function(ajax_api, tag_api, CountryFormFactory, Editor_API) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;
    const PREFIX = "country";
    const QUERY_DELAY = 800;
    const API_BASE_URL = "https://api.kemelang.com"


    function CountryManager(){
        
        this.form = document.getElementById('country-form');
        this.country_form = document.getElementById('country-form');
        this.form_container = document.getElementById('country-form-container');
        this.form_management = document.getElementById('form-management');
        this.updatable_attrs = ['id','name','for','data-name','data-id','data-error'];
        this.wrappers = [];
        this.form_is_valid = false;
        this.total_form = 0;
        this.input_max_length = 32;
        this.scheduled_query = undefined;
        this.replace_pattern = /\d+/g;
    };
    CountryManager.prototype.init = function(){
        var self = this;
        if(!this.form_container){
            return;
        }
        this.countryFormFactory = new CountryFormFactory();
        this.countryFormFactory.init();
        let add_form_btn = document.getElementById('add-country-btn');
        let create_country_btn = document.getElementById('create-country-btn');
        if(add_form_btn){
            add_form_btn.addEventListener('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                
                self.add_country_form('country');
            });
        }
        self.create_managed_country_form('country');
        if(this.country_form){
            this.country_form.addEventListener('submit', function(event){
                event.stopPropagation();
                event.preventDefault();
                
                self.submit();
                return false;
            });
        }
        
    };

    CountryManager.prototype.init_for_update = function(){
        var self = this;
        let update_form = document.getElementById("update-country-form");

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
            console.warn("error on parsing json data from description value : %s", value);
            console.error(error);
        }
        return true;
    }

    CountryManager.prototype.create_managed_country_form = function(prefix){
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
        this.form_management.appendChild(this.form_TOTAL_FORMS);
        this.form_management.appendChild(this.form_INITIAL_FORMS);
        this.form_management.appendChild(this.form_MIN_NUM_FORMS);
        this.form_management.appendChild(this.form_MAX_NUM_FORMS);
    }

    CountryManager.prototype.add_country_form = function(prefix){
        let self = this;
        let result = this.countryFormFactory.create_form(this.total_form, prefix, this.remove_country_form.bind(this));
        
        this.form_container.appendChild(result.tag);
        let editor = new Editor_API.EditorWrapper(result.editor.id, {});
        editor.init()
        if(!editor.created){
            console.warn("Editor not created for tag %s", result.editor.id);
            return;
        }
        this.wrappers.push(result.tag);
        
        ['keyup'].forEach(function (e) {
            result.name_input.addEventListener(e, function(event){
                if(!result.name_input || !result.name_input.value || !result.name_input.value.trim().length){
                    result.name_input.value = "";
                    return;
                }
                if(self.scheduled_query){
                    clearTimeout(self.scheduled_query);
                }
                self.scheduled_query = setTimeout(self.find_country.bind(self), QUERY_DELAY, result.name_input);
                //self.find_country(result.name_input);
            });
        });
        this.incremente_management_form();
        
    };


    CountryManager.prototype.remove_country_form = function(element_id){
        
        let element_index = this.wrappers.findIndex((element) => element.id == element_id);
        if(element_index > -1){
            
            this.wrappers.splice(element_index, 1);
            this.decremente_management_form();
            this.updateManagementFormIndex();
            
        }else{
            console.log("Removed country form wrapper  failed:  %s not found", element_id);
        }
        
    };

    CountryManager.prototype.clear = function(){
        this.total_form = 0;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
        this.wrappers.length = 0;
        while(this.form_container.firstChild){
            this.form_container.removeChild(this.form_container.firstChild);
        }
    };

    CountryManager.prototype.find_country = function(tag){
        let self = this;
        let url = `${API_BASE_URL}/find-country/?country=${tag.value}`;
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
                self.on_country_exist(tag, response.found);
            }
        }, function(reason){
            console.error(reason);
        });
    }

    CountryManager.prototype.on_country_exist = function(tag, country_exist){
        let target = document.getElementById(tag.dataset.error);
        target.classList.toggle('hidden', !country_exist);
        target.classList.toggle('warning', country_exist);
        tag.classList.toggle('warning', country_exist);
        this.form_is_valid = !country_exist;
    }


    CountryManager.prototype.updateFormIndex = function(tag, index){
        
        let self = this;
        this.updatable_attrs.forEach(function(attr){
            if(tag.hasAttribute(attr)){
                tag.setAttribute(attr, tag.getAttribute(attr).replace(self.replace_pattern, index));
            }
        });
    }


    CountryManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    CountryManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.form_TOTAL_FORMS.value = this.total_form;
        this.form_MIN_NUM_FORMS.value =this.total_form;
        this.form_MAX_NUM_FORMS.value = this.total_form;
    };

    CountryManager.prototype.updateManagementFormIndex = function(){
        let self = this;
        
        this.wrappers.forEach(function (div, index) {
            
            let managed_update = div.querySelectorAll('.managed-update');
            managed_update.forEach(function(e, i){
                
                self.updateFormIndex(e, index);
            });
            self.updateFormIndex(div, index);
        });
    };

    CountryManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.country_form);
        let url = `${API_BASE_URL}/create-country/`;
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
    return CountryManager;
});
