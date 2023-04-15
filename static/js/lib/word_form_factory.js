define(['tag_api'],function(tag_api) {
    'use strict';

    function WordFormFactory(){
        this.index = -1;
    };
    WordFormFactory.prototype.init = function(){
        console.log("Word Form Factory initalised");
    };


    WordFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        this.index ++;
        let form_index = index || 0;
        let form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = create_api({'element': 'span', 'options':{
            'cls': 'managed-update',
            'id': id + '-delete-btn',
            'title': 'Delete this word',
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-trash icon'}})]
        }});
        let header_label = create_api({'element': 'div', 'options':{
            'children': [create_api({'element': 'span', 'options':{'innerText': 'Word', 'cls': 'bold'}})]
        }});
        let header_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-delete-btn-header',
            'children': [header_label, delete_button]
        }});
        let word = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-word`,
            'name': `${form_prefix}-${form_index}-word`,
            'data-error': `${id}-word-error`,
            'cls': 'managed-update',
            'type':'text'
        }});
        let word_error = create_api({'element': 'span', 'options':{'id': `${id}-word-error` ,'cls': 'managaed-update small hidden','innerText': 'word already exists'}})
        let label_word = create_api({'element': 'label', 'options': {
            'innerText': 'Word',
            'cls': 'managed-update',
            'htmlFor': word.id
        }});
        let form_group_name = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_word, word_error, word]
        }});

        let div_name_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_name]
        }});

        let langage = create_api({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-langage`,
            'name': `${form_prefix}-${form_index}-langage`,
            'data-error': `${id}-word-error`,
            'cls': 'managed-update',
            'type':'hidden'
        }});
        let selected_langage = tag_api.create_tag({'element': 'div','options': {
            'id':`${form_prefix}-${form_index}-langage-selected`,
            'cls': 'selected-options managed-update',
        }});
        /*
        let selected_langage = tag_api.create_tag({'element': 'span','options': {
            'id':`${form_prefix}-${form_index}-langage-selected`,
            'cls': 'chips bold hidden managed-update langage',
            'innerText': ''

        }});
        */
        let add_langage_btn = create_api({'element': 'span', 'options':{
            'cls': 'add-langage-btn',
            'data-container': id,
            'data-target': 'langage-selector-dialog',
            'data-selected': `${form_prefix}-${form_index}-langage-selected`,
            'data-name': `${form_prefix}-${form_index}-langage`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'data-index': `word-index-${this.index}`,
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-plus icon'}}), create_api({'element': 'span', 'options':{'innerText': 'Select Langage'}})]
        }});
        let btn_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-add-langage-btn-header',
            'children': [add_langage_btn,selected_langage]
        }});
        let div_langage_group = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-langage-actions`,
            'cls' : "full managed_update",
            'children': [btn_group]
        }});

        let div_langage_wrapper = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-langage-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [langage, div_langage_group]
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
            'data-selected': `word-index-${this.index}-countries-selected`,
            'data-index': `word-index-${this.index}`,
            'children': [hidden_div,header_group, div_name_wrapper, div_langage_wrapper, div_description_wrapper]
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
        return {'tag': div, 'inputs': form_inputs, 'editor': editor,'add-langage-btn': add_langage_btn, 'word_input': word, 'selection': selected_langage, 'index': `word-index-${this.index}`};
    }

    return WordFormFactory;
});
