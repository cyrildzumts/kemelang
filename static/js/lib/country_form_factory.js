define(['tag_api'],function(tag_api) {
    'use strict';

    function CountryFormFactory(){
        
    };
    CountryFormFactory.prototype.init = function(){
        console.log("Country Form Factory initalised");
    };


    CountryFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        let form_index = index || 0;
        let form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = create_api({'element': 'span', 'options':{
            'cls': 'managed-update delete-btn',
            'id': id + '-delete-btn',
            'title': 'Delete this country',
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-trash icon'}})]
        }});
        let header_label = create_api({'element': 'div', 'options':{
            'children': [create_api({'element': 'span', 'options':{'innerText': 'Country', 'cls': 'bold'}})]
        }});
        let header_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-delete-btn-header',
            'children': [header_label, delete_button]
        }});
        let name = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-name`,
            'name': `${form_prefix}-${form_index}-name`,
            'data-error': `${id}-name-error`,
            'cls': 'managed-update',
            'type':'text'
        }});
        let name_error = create_api({'element': 'span', 'options':{'id': `${id}-name-error` ,'cls': 'managaed-update small hidden','innerText': 'Country already exists'}})
        let label_name = create_api({'element': 'label', 'options': {
            'innerText': 'Name',
            'cls': 'managed-update',
            'htmlFor': name.id
        }});
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_name, name_error, name]
        }});

        let div_name_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_name]
        }});
        let description = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-description`,
            'name': `${form_prefix}-${form_index}-description`,
            'value': '',
            'cls': 'managed-update',
            'type':'hidden'
        }});
        let label_description = create_api({'element': 'label', 'options': {
            'innerText': 'Description',
            'cls': 'managed-update',
            'htmlFor': description.id
        }});
        let editor = create_api({'element': 'div', 'options': {
            'cls': 'editor editor-box',
            'id': `editor-${form_prefix}-${form_index}-description`,
            'data-target': `id-${form_prefix}-${form_index}-description`

        }});
        let form_group_description = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_description, description, editor]
        }});

        let div_description_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_description]
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
            'cls': 'mat-box editor-box-wrapper',
            'id': id,
            'children': [hidden_div,header_group, div_name_wrapper, div_description_wrapper]
        }});

        

        let form_inputs = [name, description, added_by, input_form_id];
        delete_button.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let tag_id = div.id;
            div.remove();
            if(delete_callback){
                delete_callback(tag_id);
            }
        });
        return {'tag': div, 'inputs': form_inputs, 'editor': editor, 'name_input': name};
    }

    return CountryFormFactory;
});
