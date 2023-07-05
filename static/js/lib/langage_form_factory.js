define(['tag_api'],function(tag_api) {
    'use strict';

    function LangageFormFactory(){
        this.index = -1;
    };
    LangageFormFactory.prototype.init = function(){
        console.log("Langage Form Factory initalised");
    };


    LangageFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        this.index ++;
        let form_index = index || 0;
        let form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = create_api({'element': 'span', 'options':{
            'cls': 'managed-update delete-btn',
            'id': id + '-delete-btn',
            'title': 'Delete this langage',
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-trash icon'}})]
        }});
        let header_label = create_api({'element': 'div', 'options':{
            'children': [create_api({'element': 'span', 'options':{'innerText': 'Langage', 'cls': 'bold'}})]
        }});
        let header_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group managed_update',
            'id': id + '-delete-btn-header',
            'children': [header_label, delete_button]
        }});
        let name = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-name`,
            'name': `${form_prefix}-${form_index}-name`,
            'data-error': `${id}-name-error`,
            'cls': 'managed-update full margin-t',
            'type':'text'
        }});
        let label_name = create_api({'element': 'label', 'options': {
            'innerText': 'Name',
            'cls': 'managed-update',
            'htmlFor': name.id
        }});
        let name_error = create_api({'element': 'span', 'options':{'id': `${id}-name-error` ,'cls': 'managaed-update small margin-v full hidden','innerText': 'Langage already exists'}})
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_name, name_error, name]
        }});

        let div_name_wrapper = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-countries-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [form_group_name]
        }});

        let selected_countries = tag_api.create_tag({'element': 'div','options': {
            'id':`${form_prefix}-${form_index}-countries-selected`,
            'cls': 'selected-options managed-update',
        }});



        let add_country_btn = create_api({'element': 'span', 'options':{
            'cls': 'add-country-btn padding-v',
            'data-container': id,
            'data-target': 'country-selector-dialog',
            'data-name': `${form_prefix}-${form_index}-countries`,
            'data-selected': `${form_prefix}-${form_index}-countries-selected`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'data-index': `langage-index-${this.index}`,
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-plus icon'}}), create_api({'element': 'span', 'options':{'innerText': 'Select Country'}})]
        }});
        let btn_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-add-country-btn-header',
            'children': [add_country_btn, selected_countries]
        }});
        /*

        add_country_btn.addEventListener('click', function(event){
            event.preventDefault();
            event.stopPropagation();
            let open_modal_btn = document.getElementById('close-country-dialog');
            if(open_modal_btn){
                open_modal_btn.click();
            }
        });

        */

        let div_countries_group = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-countries-actions`,
            'cls' : "full managed_update",
            'children': [btn_group]
        }});

        let div_countries_wrapper = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-countries-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [div_countries_group]
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
            'data-selected': `langage-index-${this.index}-countries-selected`,
            'data-index': `langage-index-${this.index}`,
            'children': [hidden_div, header_group, div_name_wrapper, div_countries_wrapper, div_description_wrapper]
        }});

        

        let form_inputs = [name, description, added_by, input_form_id];
        delete_button.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let tag_id = div.id;
            div.remove();
            if(delete_callback){
                delete_callback({'id':tag_id, 'index': `langage-index-${this.index}`});
            }
        });
        return {'tag': div, 'inputs': form_inputs, 'editor': editor, 'add-country-btn': add_country_btn, 'name_input': name,'selection': selected_countries, 'index': `langage-index-${this.index}`};
    }

    return LangageFormFactory;
});
