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
            'cls': 'managed-update',
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


        let form_group_source_word = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_source_word, source_word,source_word_error]
        }});

        let form_group_target_word = create_api({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_target_word,target_word,target_word_error]
        }});


        let div_form_wrapper = create_api({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_source_word, form_group_target_word]
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
        
        
        /****** END OF SOURCE WORD *******/

        /****** TARGET WORD *******/
 
        /****** END OF TARGET WORD *******/

    
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
            'children': [hidden_div,header_group]
        }});

        

        let form_inputs = [source_word,target_word, added_by, input_form_id];
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
                'source': {'word': source_word, 'selection': selected_source_langage},
                'target': {'word': target_word, 'selection': selected_target_langage},
                'source-word': {'word': source_word, 'selection': selected_source_langage},
                'target-word': {'word': target_word, 'selection': selected_target_langage},
            }
        };
    }
    return TranslationFormFactory;
});
