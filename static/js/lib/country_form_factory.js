define(['tag_api'],function(tag_api) {
    'use strict';

    function CountryFormFactory(){
        
    };
    CountryFormFactory.prototype.init = function(){
        console.log("Country Form Factory initalised");
    };


    CountryFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        form_index = index || 0;
        form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = create_api({'element': 'button', 'options':{
            'cls': 'mat-button mat-button-default managed-update',
            'id': id + '-delete-btn',
            'type': 'button',
            'data-target': id,
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-backspace icon'}}),create_api({'element': 'span', 'options':{'innerText': 'Delete'}})]
        }});
        let name = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-name`,
            'name': `${form_prefix}-${form_index}-name`,
            'cls': 'managed-update',
            'type':'text'
        }});
        let label_name = create_api({'element': 'label', 'options': {
            'innerText': 'Name',
            'cls': 'managed-update',
            'htmlFor': input_name.id
        }});
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_name, input_name]
        }});

        let div_name_col = create_api({'element': 'div', 'options': {
            'cls' : "col-m-12 col-5",
            'children': [form_group_name]
        }});
        let div_name_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [div_name_col]
        }});
        let description = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-description`,
            'name': `${form_prefix}-${form_index}-description`,
            'cls': 'managed-update',
            'type':'text'
        }});
        let label_description = create_api({'element': 'label', 'options': {
            'innerText': 'Description',
            'cls': 'managed-update',
            'htmlFor': description.id
        }});
        let form_group_description = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_description, description]
        }});

        let div_description_col = create_api({'element': 'div', 'options': {
            'cls' : "col-m-12 col-5",
            'children': [form_group_description]
        }});
        let div_description_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [div_description_col]
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

        let hidden_div = create_api({'element': 'div', 'options': {
            'cls': 'hidden',
            'children': [added_by, input_form_id]
        }});

        
        let div = create_api({'element': 'div', 'options': {
            'cls': 'mat-box',
            'id': id,
            'children': [hidden_div,delete_button, div_name_wrapper, div_description_wrapper]
        }});

        

        let form_inputs = [name, description, added_by, input_form_id];
        delete_button.addEventListener('click', function(){
            div.remove();
            if(delete_callback){
                delete_callback(id);
            }
        });
        return {'tag': div, 'inputs': form_inputs};
    }

    return CountryFormFactory;
});
