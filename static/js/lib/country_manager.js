define(["ajax_api", 'tag_api', 'country_form_factory'],function(ajax_api, tag_api, CountryFormFactory) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;


    function CountryManager(){
        
        this.form = document.getElementById('country-form');
        this.country_form = document.getElementById('country-form');
        this.form_container = document.getElementById('country-form-container');
        this.wrappers = [];
        this.total_form = 0;
        this.input_max_length = 32;
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
            add_form_btn.addEventListener('click', function(even){
                event.stopPropagation();
                event.preventDefault();
                console.log("Click on Add Country Form");
                self.add_country_form('country');
            });
        }
        self.create_managed_country_form('country');
        if(this.country_form){
            this.country_form.addEventListener('submit', function(even){
                event.stopPropagation();
                event.preventDefault();
                console.log("Click on Create Country Btn");
                self.submit();
                return false;
            });
        }
        console.log("Country Manager initialised");
    };

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
        this.form_container.appendChild(this.form_TOTAL_FORMS);
        this.form_container.appendChild(this.form_INITIAL_FORMS);
        this.form_container.appendChild(this.form_MIN_NUM_FORMS);
        this.form_container.appendChild(this.form_MAX_NUM_FORMS);
    }

    CountryManager.prototype.add_country_form = function(prefix){
        let result = this.countryFormFactory.create_form(this.total_form, prefix, this.remove_country_form.bind(this));
        this.wrappers.push(result.tag);
        this.form_container.appendChild(result.tag);
        this.incremente_management_form();
        console.log("Added new country form %s", result.tag.id);
    };


    CountryManager.prototype.remove_country_form = function(element_id){
        
        let element_index = this.wrappers.findIndex((element) => element.id == element_id);
        if(element_index > -1){
            console.log("Removing country form wrapper %s - Size %s", element_id, this.wrappers.length);
            this.wrappers.splice(element_index, 1);
            this.decremente_management_form();
            this.updateManagementFormIndex();
            console.log("Removed country form wrapper %s - Size %s", element_id, this.wrappers.length);
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


    CountryManager.prototype.updateFormIndex = function(tag, index){
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

    CountryManager.prototype.submit = function(){
        let self = this;
        let formData = new FormData(this.country_form);
        let url = "http://api.kemelang-local.com/create-country/";
        let option = {
            type:'POST',
            method: 'POST',
            dataType: 'json',
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
