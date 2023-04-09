define(["ajax_api", 'tag_api', 'country_form_factory', 'langage_form_factory'],function(ajax_api, tag_api, CountryFormFactory, LangageFormFactory) {
    'use strict';
    var attr_template;
    const TOTAL_FORMS   = "TOTAL_FORMS";
    const INITIAL_FORMS = "INITIAL_FORMS";
    const MIN_NUM_FORMS = "MIN_NUM_FORMS";
    const MAX_NUM_FORMS     = "MAX_NUM_FORMS";
    const MAX_SUBMITTED_FORMS = 100;




    




    function FormManager(){
        
        //this.form = $('#form-attrs-management');
        this.form = document.getElementById('managed-form');

        this.langage_form = document.getElementById('langage-form');
        this.form_container = $('#form-container', this.form);
        this.attrs_inputs = [];
        this.total_form = 0;
        this.total_country_form = 0;
        this.total_langage_form = 0;
        this.input_max_length = 32;
        this.replace_pattern = /\d+/g;
    };
    FormManager.prototype.init = function(){
        var self = this;
        CountryFormFactory.init();
        LangageFormFactory.init();
        
    };

    FormManager.prototype.create_managed_langage_form = function(prefix){
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

    FormManager.add_country_form = function(){
        let country_form_wrapper = CountryFormFactory.create_form('country', this.total_country_form);
        this.total_country_form ++;
        this.total_form ++;
    };
    FormManager.add_langage_form = function(){
        let langage_form_wrapper = LangageFormFactory.create_form('langage', this.total_langage_form);
        this.total_langage_form ++;
        this.total_form ++;
    };

    FormManager.prototype.clear = function(){
        this.total_form = 0;
        this.total_langage_form = 0;
        this.updateManagementForm();
    };

    FormManager.prototype.updateFormInputIndex = function(){
        var name;
        var id;
        var self = this;
        this.attrs_inputs.forEach(function (arr_input, index) {
            arr_input.forEach(function(e, i){
                self.updateInputIndex(e, index);
            });
        });
    };

    FormManager.prototype.updateInputIndex = function(input, index){
        var name = input.getAttribute('name');
        var id = input.getAttribute('id');
        input.setAttribute('id', id.replace(this.replace_pattern, index));
        input.setAttribute('name', name.replace(this.replace_pattern, index));
    }



    

    FormManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.id_form_TOTAL_FORMS.val(this.total_form);
        this.id_form_MIN_NUM_FORMS.val(this.total_form);
        this.id_form_MAX_NUM_FORMS.val(this.total_form);
    };

    FormManager.prototype.updateManagementForm = function(){
        var self = this;
        this.attrs_inputs.forEach(function (arr_input, index) {
            arr_input.forEach(function(e, i){
                self.updateInputIndex(e, index);
            });
        });
    };

    FormManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.id_form_TOTAL_FORMS.val(this.total_form);
        this.id_form_MIN_NUM_FORMS.val(this.total_form);
        this.id_form_MAX_NUM_FORMS.val(this.total_form);
    };

    return FormManager;
});
