define(["ajax_api", 'tag_api'],function(ajax_api, tag_api) {
    'use strict';
    var attr_template;
    function FormManager(){
        
        //this.form = $('#form-attrs-management');
        this.form =$('#form-add-attributes');
        this.form_attributes = $('#form-add-attributes');
        this.form_attr_container = $('#form-attr-container', this.form);
        this.attrs_container = $('#form-attr-container', this.form);
        this.attrs_inputs = [];
        this.total_form = 0;
        this.input_max_length = 32;
        this.replace_pattern = /\d+/g;
        this.id_form_TOTAL_FORMS = $("#id_form-TOTAL_FORMS", this.form);
        this.id_form_INITIAL_FORMS = $("#id_form-INITIAL_FORMS", this.form);
        this.id_form_MIN_NUM_FORMS = $("#id_form-MIN_NUM_FORMS", this.form);
        this.id_form_MAX_NUM_FORMS = $("#id_form-MAX_MIN_FORMS", this.form);
    };
    AttributManager.prototype.init = function(){
        var self = this;
        
        
        if(this.form.length == 0){
            return;
        }
        $('.js-add-new-attribute').on('click', function(){
            //var target = $($(this).data('target'));
            //var form_container = $($(this).data('form'));
            let data_type = $(this).data('type');
            if( data_type == 'subscription'){
                self.create_subscription_attribute();
            }else{
                self.create_attribute();
            }
            
        });
        var option = {
            type:'GET',
            method: 'GET',
            dataType: 'json',
            url : '/api/attribute-types/'
        }
        ajax_api.ajax(option).then(function(response){
            attr_template = response;
        }, function(reason){
            console.error(reason);
        });
        
    };


    AttributManager.prototype.clear = function(){
        this.total_form = 0;
        this.updateManagementForm();
    };

    AttributManager.prototype.updateFormInputIndex = function(){
        var name;
        var id;
        var self = this;
        this.attrs_inputs.forEach(function (arr_input, index) {
            arr_input.forEach(function(e, i){
                self.updateInputIndex(e, index);
            });
        });
    };

    AttributManager.prototype.updateInputIndex = function(input, index){
        var name = input.getAttribute('name');
        var id = input.getAttribute('id');
        input.setAttribute('id', id.replace(this.replace_pattern, index));
        input.setAttribute('name', name.replace(this.replace_pattern, index));
    }

    AttributManager.prototype.create_subscription_attribute = function(){
        var self = this;
        let create_api = tag_api.create_tag;
        var id = `attr-form-${this.total_form}`;
        var delete_button = create_api({'element': 'button', 'options':{
            'cls': 'mat-button mat-button-outline',
            'id': id + '-delete-btn',
            'type': 'button',
            'data-target': '#' + id,
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-backspace icon'}}),create_api({'element': 'span', 'options':{'innerText': 'Delete'}})]
        }});
        let input_name = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-name`,
            'name': `form-${this.total_form}-name`,
            'maxlength': self.input_max_length,
            'type':'text'
        }});
        let label_name = create_api({'element': 'label', 'options': {
            'innerText': attr_template.name,
            'htmlFor': input_name.id
        }});
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_name, input_name]
        }});
        let input_display_name = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-display_name`,
            'name': `form-${this.total_form}-display_name`,
            'maxlength': self.input_max_length,
            'type':'text'
        }});
        let label_display_name = create_api({'element': 'label', 'options': {
            'innerText': attr_template.display_name,
            'htmlFor': input_display_name.id
        }});
        let form_group_display_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_display_name, input_display_name]
        }});

        let input_value = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-value`,
            'name': `form-${this.total_form}-value`,
            'maxlength': self.input_max_length,
            'type':'text'
        }});
        let label_value = create_api({'element': 'label', 'options': {
            'innerText': attr_template.value,
            'htmlFor': input_value.id
        }});
        let form_group_value = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_value, input_value]
        }});

        let input_description = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-description`,
            'name': `form-${this.total_form}-description`,
            'type':'text'
        }});
        let label_description = create_api({'element': 'label', 'options': {
            'innerText': 'Description',
            'htmlFor': input_description.id
        }});
        let form_group_description = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_description, input_description]
        }});
        
        let default_opt = create_api({'element': 'option', 'options': {
            'text': 'Select a type',
            'selected': true,
            'value': undefined
        }});
        let select_options = [default_opt];
        attr_template.value_types.forEach(function(el, index){
            select_options.push(create_api({'element': 'option', 'options': {
                'value': el.key,
                'text': el.value
            }}));
        });
        let select_value_type = create_api({'element': 'select', 'options':{
            'id': `id-form-${this.total_form}-value_type`,
            'name': `form-${this.total_form}-value_type`,
            'children': select_options
        }});
        let label_value_type = create_api({'element': 'label', 'options': {
            'innerText': attr_template.value_type,
            'htmlFor': select_value_type.id
        }});
        let form_group_value_type = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_value_type, select_value_type]
        }});
        let input_form_id = create_api({'element': 'input', 'options':{
            'id':`id-form-${this.total_form}-id`,
            'name': `form-${this.total_form}-id`,
            'type':'hidden'
        }});
        var div = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'mat-box form-group-wrapper full',
            'id': id,
            'children': [form_group_name, form_group_display_name, form_group_value, form_group_value_type, form_group_description, input_form_id, delete_button]
        }});
        this.form_attr_container.append(div);
        self.incremente_management_form();
        self.attrs_inputs.push([input_name, input_display_name, input_value, select_value_type, input_description, input_form_id]);
        delete_button.addEventListener('click', function(){
            div.remove();
            self.decremente_management_form();
            self.updateFormInputIndex();
        });
        return div;
    }


    AttributManager.prototype.create_attribute = function(){
        var self = this;
        let create_api = tag_api.create_tag;
        var id = `attr-form-${this.total_form}`;
        var delete_button = create_api({'element': 'button', 'options':{
            'cls': 'mat-button mat-button-default',
            'id': id + '-delete-btn',
            'type': 'button',
            'data-target': '#' + id,
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-backspace icon'}}),create_api({'element': 'span', 'options':{'innerText': 'Delete'}})]
        }});
        let input_name = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-name`,
            'name': `form-${this.total_form}-name`,
            'maxlength': self.input_max_length,
            'type':'text'
        }});
        let label_name = create_api({'element': 'label', 'options': {
            'innerText': attr_template.name,
            'htmlFor': input_name.id
        }});
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_name, input_name]
        }});
        let input_display_name = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-display_name`,
            'name': `form-${this.total_form}-display_name`,
            'maxlength': self.input_max_length,
            'type':'text'
        }});
        let label_display_name = create_api({'element': 'label', 'options': {
            'innerText': attr_template.display_name,
            'htmlFor': input_display_name.id
        }});
        let form_group_display_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_display_name, input_display_name]
        }});

        let input_value = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-value`,
            'name': `form-${this.total_form}-value`,
            'maxlength': self.input_max_length,
            'type':'text'
        }});
        let label_value = create_api({'element': 'label', 'options': {
            'innerText': attr_template.value,
            'htmlFor': input_value.id
        }});
        let form_group_value = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_value, input_value]
        }});

        let input_primary = create_api({'element': 'input', 'options':{
            'id': `id-form-${this.total_form}-primary`,
            'name': `form-${this.total_form}-is_primary`,
            'type':'checkbox'
        }});
        let label_primary = create_api({'element': 'label', 'options': {
            'innerText': attr_template.is_primary,
            'htmlFor': input_primary.id
        }});
        let form_group_primary = create_api({'element': 'div', 'options': {
            'cls': 'flex flex-left',
            'children': [label_primary, input_primary]
        }});
        
        let default_opt = create_api({'element': 'option', 'options': {
            'text': 'Select a type',
            'selected': true,
            'value': undefined
        }});
        let select_options = [default_opt];
        attr_template.value_types.forEach(function(el, index){
            select_options.push(create_api({'element': 'option', 'options': {
                'value': el.key,
                'text': el.value
            }}));
        });
        let select_value_type = create_api({'element': 'select', 'options':{
            'id': `id-form-${this.total_form}-value_type`,
            'name': `form-${this.total_form}-value_type`,
            'children': select_options
        }});
        let label_value_type = create_api({'element': 'label', 'options': {
            'innerText': attr_template.value_type,
            'htmlFor': select_value_type.id
        }});
        let form_group_value_type = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_value_type, select_value_type]
        }});
        let input_form_id = create_api({'element': 'input', 'options':{
            'id':`id-form-${this.total_form}-id`,
            'name': `form-${this.total_form}-id`,
            'type':'hidden'
        }});
        var div = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'mat-box flex flex-left full flex-wrap',
            'id': id,
            'children': [form_group_name, form_group_display_name, form_group_value, form_group_value_type, form_group_primary, input_form_id, delete_button]
        }});
        this.form_attr_container.append(div);
        self.incremente_management_form();
        self.attrs_inputs.push([input_name, input_display_name, input_value, select_value_type, input_primary, input_form_id]);
        delete_button.addEventListener('click', function(){
            div.remove();
            self.decremente_management_form();
            self.updateFormInputIndex();
        });
        return div;
    }

    AttributManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.id_form_TOTAL_FORMS.val(this.total_form);
        this.id_form_MIN_NUM_FORMS.val(this.total_form);
        this.id_form_MAX_NUM_FORMS.val(this.total_form);
    };

    AttributManager.prototype.updateManagementForm = function(){
        var self = this;
        this.attrs_inputs.forEach(function (arr_input, index) {
            arr_input.forEach(function(e, i){
                self.updateInputIndex(e, index);
            });
        });
    };

    AttributManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.id_form_TOTAL_FORMS.val(this.total_form);
        this.id_form_MIN_NUM_FORMS.val(this.total_form);
        this.id_form_MAX_NUM_FORMS.val(this.total_form);
    };

    return AttributManager;
});
