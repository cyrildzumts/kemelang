define(["ajax_api", 'tag_api', 'country_form_factory'],function(ajax_api, tag_api, CountryFormFactory) {
    'use strict';
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;


    function CountryManager(){
        
        this.form = document.getElementById('country-managed-form');
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
        CountryFormFactory.init();
        let add_form_btn = document.getElementById('add-country-btn');
        if(add_form_btn){
            add_form_btn.addEventListener('click', (even) => self.create_managed_country_form('country'));
        }
    };

    CountryManager.prototype.create_managed_country_form = function(prefix){
        const FORM_PREFIX = prefix || 'form';
        let create_tag = tag_api.create_tag;
        this.form_TOTAL_FORMS = create_tag({
            'element': 'input', 
            'options': {
                'id': `id_${FORM_PREFIX}-${TOTAL_FORMS}`,
                'value': 1,
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
    }

    CountryManager.prototype.add_country_form = function(){
        let country_form_wrapper = CountryFormFactory.create_form('country', this.total_form, this.remove_country_form);
        this.wrappers.push(country_form_wrapper);
        this.form_container.appendChild(country_form_wrapper);
        this.incremente_management_form();
        console.log("Added new country form %s", country_form_wrapper.id);
    };


    CountryManager.prototype.remove_country_form = function(element_id){
        console.log("Removing country form wrapper %s", element_id);
        let element_index = this.wrappers.findIndex((element) => element.id == element_id);
        if(element_index > -1){
            this.wrappers.slice(element_index, 1);
            this.decremente_management_form();
            this.updateManagementFormIndex();
        }
        console.log("Removed country form wrapper %s", element_id);
    };

    CountryManager.prototype.clear = function(){
        this.total_form = 0;
        this.updateManagementForm();
    };


    CountryManager.prototype.updateFormIndex = function(tag, index){
        if(Object.hasOwn(tag, 'id')){
            tag.setAttribute('id', tag.getAttribute('id').replace(this.replace_pattern, index));
        }
        
        if(Object.hasOwn(tag, 'name')){
            tag.setAttribute('name', tag.getAttribute('name').replace(this.replace_pattern, index));
        }
        if(Object.hasOwn(tag, 'htmlFor')){
            tag.setAttribute('htmlFor', tag.getAttribute('htmlFor').replace(this.replace_pattern, index));
        }
    }


    CountryManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.form_TOTAL_FORMS.val(this.total_form);
        this.form_MIN_NUM_FORMS.val(this.total_form);
        this.form_MAX_NUM_FORMS.val(this.total_form);
    };

    CountryManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.form_TOTAL_FORMS.val(this.total_form);
        this.form_MIN_NUM_FORMS.val(this.total_form);
        this.form_MAX_NUM_FORMS.val(this.total_form);
    };

    CountryManager.prototype.updateManagementFormIndex = function(){
        var self = this;
        this.wrappers.forEach(function (div, index) {
            let managed_update = document.querySelectorAll('.managed-update', div);
            managed_update.forEach(function(e, i){
                self.updateFormIndex(e, index);
            });
            self.updateFormIndex(div, index);
        });
    };
    return CountryManager;
});
