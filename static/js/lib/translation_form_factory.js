define(['tag_api'],function(tag_api) {
    'use strict';

    function TranslationFormFactory(){
        this.index = -1;
    };
    TranslationFormFactory.prototype.init = function(){
        console.log("Translation Form Factory initalised");
    };


    TranslationFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        this.index ++;
        let form_index = index || 0;
        let form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = create_api({'element': 'span', 'options':{
            'cls': 'managed-update delete-btn',
            'id': id + '-delete-btn',
            'title': 'Delete this Translation',
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-trash icon'}})]
        }});
        let header_label = create_api({'element': 'div', 'options':{
            'children': [create_api({'element': 'span', 'options':{'innerText': 'Translation', 'cls': 'bold'}})]
        }});
        let header_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-delete-btn-header',
            'children': [header_label, delete_button]
        }});
        let source_word_internal = create_api({'element': 'input', 'options':{
            'id': `source-word-internal-${this.index}`,
            'name': `${form_prefix}-${form_index}-source_word`,
            'cls': 'managed-update',
            'type':'hidden',

        }});
        let source_langage_internal = create_api({'element': 'input', 'options':{
            'id': `source-langage-internal-${this.index}`,
            'name': `${form_prefix}-${form_index}-source_langage`,
            'cls': 'managed-update',
            'data-lang': '',
            'type':'hidden',

        }});
        let target_langage_internal = create_api({'element': 'input', 'options':{
            'id': `target-langage-internal-${this.index}`,
            'name': `${form_prefix}-${form_index}-target_langage`,
            'data-lang': '',
            'cls': 'managed-update',
            'type':'hidden',

        }});
        let target_word_internal = create_api({'element': 'input', 'options':{
            'id': `target-word-internal-${this.index}`,
            'name': `${form_prefix}-${form_index}-target_word`,
            'cls': 'managed-update',
            'type':'hidden',

        }});
        let source_word = create_api({'element': 'input', 'options':{
            'id': `source-word-${this.index}`,
            'cls':'full',
            'data-error': `${id}-source-word-error`,
            'data-target': `source-word-internal-${this.index}`,
            'data-lang': "",
            'type':'text',
            'placeholer': 'Enter Source word'

        }});
        
        let target_word = create_api({'element': 'input', 'options':{
            'id': `target-word-${this.index}`,
            'cls':'full',
            'data-error': `${id}-target-word-error`,
            'data-target': `target-word-internal-${this.index}`,
            'data-lang': "",
            'type':'text',
            'placeholer': 'Enter Target word'

        }});

        let source_langage = create_api({'element': 'input', 'options':{
            'id': `source-word-${this.index}`,
            'data-error': `${id}-source-word-error`,
            'data-target': `source-word-internal-${this.index}`,
            'type':'text',
            'placeholer': 'Enter Source word'

        }});
        
        let target_langage = create_api({'element': 'input', 'options':{
            'id': `target-word-${this.index}`,
            'data-error': `${id}-target-word-error`,
            'data-target': `target-word-internal-${this.index}`,
            'type':'text',
            'placeholer': 'Enter Target word'

        }});
        let source_word_error = create_api({'element': 'span', 'options':{'id': `${id}-source-word-error` ,'cls': 'managaed-update small hidden','innerText': 'word not found'}})
        let target_word_error = create_api({'element': 'span', 'options':{'id': `${id}-target-word-error` ,'cls': 'managaed-update small hidden','innerText': 'word not found'}})
        
        let label_source_word = create_api({'element': 'label', 'options': {
            'innerText': 'Source Word',
            'cls': 'managed-update',
            'htmlFor': `source-word-${this.index}`
        }});
        let label_target_word = create_api({'element': 'label', 'options': {
            'innerText': 'Destination Word',
            'cls': 'managed-update',
            'htmlFor': `target-word-${this.index}`
        }});

        let label_source_langage = create_api({'element': 'label', 'options': {
            'innerText': 'Source Langage',
            'cls': 'managed-update force-hidden',
            'htmlFor': `source-langage-${this.index}`
        }});
        let label_target_langage = create_api({'element': 'label', 'options': {
            'innerText': 'Destination Langage',
            'cls': 'managed-update force-hidden',
            'htmlFor': `target-langage-${this.index}`
        }});

        let form_group_source_word = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [source_word_internal,label_source_word, source_word,source_word_error]
        }});

        let form_group_target_word = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [target_word_internal, label_target_word,target_word,target_word_error]
        }});

        let form_group_source_langage = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [source_langage_internal,label_source_langage ,source_langage]
        }});

        let form_group_target_langage = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [target_langage_internal,label_target_langage, target_langage]
        }});

        let div_form_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_source_word, form_group_target_word, form_group_source_langage, form_group_target_langage]
        }});

        


        /****** SOURCE WORD *******/
        let selected_source_langage = tag_api.create_tag({'element': 'div','options': {
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
        let add_source_langage_btn = create_api({'element': 'span', 'options':{
            'cls': 'add-langage-btn margin-bottom',
            'data-container': id,
            'data-target': 'langage-selector-dialog',
            'data-selected': `${form_prefix}-${form_index}-source-langage-selected`,
            'data-name': `${form_prefix}-${form_index}-source_langage`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'data-index': `translation-index-${this.index}`,
            'data-destination': 'source-langage',
            'data-selector': 'source',
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-plus icon'}}), create_api({'element': 'span', 'options':{'innerText': 'Select Source Langage'}})]
        }});
        let source_langage_btn_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-add-source-langage-btn-header',
            'children': [add_source_langage_btn,selected_source_langage]
        }});
        let div_source_langage_group = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-source-langage-actions`,
            'cls' : "full managed_update",
            'children': [source_langage_btn_group]
        }});

        let div_source_langage_wrapper = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-source-langage-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [div_source_langage_group, form_group_source_word, source_langage_internal]
        }});
        /****** END OF SOURCE WORD *******/

        /****** TARGET WORD *******/
        let selected_target_langage = tag_api.create_tag({'element': 'div','options': {
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
        let add_target_langage_btn = create_api({'element': 'span', 'options':{
            'cls': 'add-langage-btn margin-bottom',
            'data-container': id,
            'data-target': 'langage-selector-dialog',
            'data-selected': `${form_prefix}-${form_index}-target-langage-selected`,
            'data-name': `${form_prefix}-${form_index}-target_langage`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'data-index': `translation-index-${this.index}`,
            'data-destination': 'target-langage',
            'data-selector': 'target',
            'children': [create_api({'element': 'i', 'options':{'cls': 'fas fa-plus icon'}}), create_api({'element': 'span', 'options':{'innerText': 'Select Target Langage'}})]
        }});
        let target_langage_btn_group = create_api({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-add-target-langage-btn-header',
            'children': [add_target_langage_btn,selected_target_langage]
        }});
        let div_target_langage_group = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-target-langage-actions`,
            'cls' : "full managed_update",
            'children': [target_langage_btn_group]
        }});

        let div_target_langage_wrapper = create_api({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-target-langage-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [div_target_langage_group, form_group_target_word, target_langage_internal]
        }});
        /****** END OF TARGET WORD *******/

        
        let comment = create_api({'element': 'textarea', 'options':{
            'id': `id-${form_index}-comment`,
            'name': `${form_prefix}-${form_index}-comment`,
            'value': '',
            'cls': 'managed-update'
        }});
        let label_comment = create_api({'element': 'label', 'options': {
            'innerText': 'Comment',
            'cls': 'managed-update',
            'htmlFor': comment.id
        }});
        
        let form_group_comment = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_comment, comment ]
        }});

        let div_comment_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_comment]
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
            'data-selected': `translation-index-${this.index}-selected`,
            'data-index': `translation-index-${this.index}`,
            'children': [hidden_div,header_group, div_source_langage_wrapper, div_target_langage_wrapper, div_comment_wrapper]
        }});

        

        let form_inputs = [source_word,target_word, comment, added_by, input_form_id];
        delete_button.addEventListener('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            let tag_id = div.id;
            div.remove();
            if(delete_callback){
                delete_callback({'id':tag_id, 'index': `langage-index-${this.index}`});
            }
        });
        return {
            'tag': div, 'inputs': form_inputs, 'index': `translation-index-${this.index}`,
            'translation': {
                'langages-btn': [add_source_langage_btn, add_target_langage_btn], 
                'source': {'word': source_word,'langage': source_langage_internal, 'selection': selected_source_langage},
                'target': {'word': target_word,'langage': target_langage_internal, 'selection': selected_target_langage},
                'source-word': {'word': source_word, 'selection': selected_source_langage},
                'target-word': {'word': target_word, 'selection': selected_target_langage},
                'source-langage' : {'langage': source_langage_internal, 'selection': selected_source_langage },
                'target-langage' : {'langage': target_langage_internal, 'selection': selected_target_langage },
                'source-langage-selection': selected_source_langage, 
                'target-langage-selection': selected_target_langage
            }
        };
    }
    return TranslationFormFactory;
});
