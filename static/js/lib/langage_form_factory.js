define(['tag_api'],function(tag_api) {
    'use strict';

    function LangageFormFactory(){
        
    };
    LangageFormFactory.prototype.init = function(){
        console.log("Langage Form Factory initalised");
    };


    LangageFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        var self = this;
        form_index = index || 0;
        form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        var id = `${form_prefix}-${form_index}`;
        var delete_button = create_api({'element': 'button', 'options':{
            'cls': 'mat-button mat-button-default managed-update',
            'id': id + '-delete-btn',
            'type': 'button',
            'data-target': id,
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-backspace icon'}}),create_api({'element': 'span', 'options':{'innerText': 'Delete'}})]
        }});
        let input_name = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-name`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-name`,
            'type':'text'
        }});
        let label_name = create_api({'element': 'label', 'options': {
            'innerText': 'Name',
            'htmlFor': input_name.id
        }});
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_name, input_name]
        }});
        let countries = create_api({'element': 'select', 'options':{
            'id': `id-${form_prefix}-${form_index}-countries`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-countries`,
            'multiple':true
        }});
        let label_countries = create_api({'element': 'label', 'options': {
            'innerText': 'Countries',
            'htmlFor': countries.id
        }});
        let form_group_countries = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_countries, countries]
        }});
        let description = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-description`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-description`,
            'type':'text'
        }});
        let label_description = create_api({'element': 'label', 'options': {
            'innerText': 'Description',
            'htmlFor': description.id
        }});
        let form_group_description = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_description, description]
        }});

        let added_by = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-added_by`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-added_by`,
            'type':'hidden'
        }});
        let input_form_id = create_api({'element': 'input', 'options':{
            'id':`id-${form_prefix}-${form_index}-id`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-id`,
            'type':'hidden'
        }});

        
        var div = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'mat-box flex flex-left full flex-wrap managed-update',
            'id': id,
            'children': [form_group_name, form_group_countries,form_group_description, added_by, input_form_id, delete_button]
        }});
        this.form_attr_container.append(div);
        self.attrs_inputs.push([input_name, input_display_name, input_value, select_value_type, input_primary, input_form_id]);
        delete_button.addEventListener('click', function(){
            div.remove();
            if(delete_callback){
                delete_callback();
            }
        });
        return div;
    }

    return LangageFormFactory;
});
