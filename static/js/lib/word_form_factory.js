define(['tag_api','keyboard'],function(tag_api, Keyboard) {
    'use strict';

    function WordFormFactory(){
        this.index = -1;
        this.WORD_TYPES = null;
    };

    WordFormFactory.prototype.init = function(){
        console.log("Word Form Factory initalised with WORD TYPE : ", this.WORD_TYPES);
    };
    WordFormFactory.prototype.set_word_types = function(wt){
        this.WORD_TYPES = wt;
    };

    WordFormFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        this.index ++;
        let form_index = index || 0;
        let form_prefix = prefix || 'form';
        let create_tag = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = create_tag({'element': 'span', 'options':{
            'cls': 'managed-update',
            'id': id + '-delete-btn',
            'title': 'Delete this word',
            'children': [create_tag({'element': 'i', 'options':{'cls': 'fas fa-trash icon'}})]
        }});
        let virtual_keyboard_button = create_tag({'element': 'span', 'options':{
            'cls': 'managed-update keyboard-btn',
            'id': id + '-keyboard-btn',
            'title': 'Open the virtual keyboard',
            'data-keyboard': "keyboard",
            'data-target': `id-${form_prefix}-${form_index}-word`,
            'children': [create_tag({'element': 'i', 'options':{'cls': 'fas fa-keyboard icon'}})]
        }});
        let header_btn_group = create_tag({'element': 'div', 'options':{
            'cls': 'flex',
            'children': [virtual_keyboard_button, delete_button]
        }});
        
        let header_label = create_tag({'element': 'div', 'options':{
            'children': [create_tag({'element': 'span', 'options':{'innerText': 'Word', 'cls': 'bold'}})]
        }});
        let header_group = create_tag({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-delete-btn-header',
            'children': [header_label,header_btn_group]
        }});
        let word = create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-word`,
            'name': `${form_prefix}-${form_index}-word`,
            'data-error': `${id}-word-error`,
            'data-lang': '',
            'cls': 'managed-update',
            'type':'text',
            'placeholder': 'Enter word'

        }});
        let transliteration = create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-transliteration`,
            'name': `${form_prefix}-${form_index}-transliteration`,
            'data-error': `${id}-transliteration-error`,
            'data-lang': '',
            'cls': 'managed-update',
            'type':'text',
            'placeholder': 'Enter transliteration'

        }});
        let word_error = create_tag({'element': 'span', 'options':{'id': `${id}-word-error` ,'cls': 'managaed-update small hidden','innerText': 'word already exists'}})
        let label_word = create_tag({'element': 'label', 'options': {
            'innerText': 'Word',
            'cls': 'managed-update force-hidden',
            'htmlFor': word.id
        }});
        let label_transliteration = create_tag({'element': 'label', 'options': {
            'innerText': 'Transliteration',
            'cls': 'managed-update force-hidden',
            'htmlFor': transliteration.id
        }});
        
        let form_group_name = create_tag({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_word, word_error, word, label_transliteration, transliteration]
        }});
        let label_word_type = create_tag({'element': 'span', 'options': {
            'innerText': 'Word Type :',
            'cls': 'margin-r',
        }});

        let word_types = [label_word_type];
        for(const [key,value] of Object.entries(this.WORD_TYPES)){
            let label = create_tag({'element': 'label', 'options': {
                'innerText': value,
                'cls': 'margin-r',
                'htmlFor': `id-${form_prefix}-${form_index}-word_type`
            }});
            let input = create_tag({'element': 'input','options': {
                'id': `id-${form_prefix}-${form_index}-word_type`,
                'name': `${form_prefix}-${form_index}-word_type`,
                'type': 'radio',
                'value': key,
                'checked': key == 0
            }})
            word_types.push(create_tag({'element': 'div','options': {
                'cls': 'margin-h',
                'children': [label, input]
            }}));
        }
        let word_type_inputs = create_tag({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': word_types
        }});
        let form_group_type = create_tag({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [word_type_inputs]
        }});

        let div_name_wrapper = create_tag({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_name, form_group_type]
        }});

        /****** */
        let audio = create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-audio`,
            'name': `${form_prefix}-${form_index}-audio`,
            'data-error': `${id}-word-error`,
            'data-index': `word-index-${this.index}`,
            'cls': 'managed-update hidden',
            'type':'file'
        }});
        let audio_player = create_tag({'element': 'audio', 'options':{
            'id': `audio-player-${this.index}`,
            'cls': 'hidden',
        }});
        let start_record_btn = create_tag({'element': 'span', 'options':{
            'cls': 'start-record-btn managed_update',
            'id': `start-record-btn-${this.index}`,
            'data-container': id,
            'data-target': `id-${form_prefix}-${form_index}-audio`,
            'data-name': `${form_prefix}-${form_index}-audio`,
            'data-play': `play-record-btn-${this.index}`,
            'data-close': 'fas fa-times',
            'data-player': `audio-player-${this.index}`,
            'data-index': `word-index-${this.index}`,
            'children': [create_tag({'element': 'i', 'options':{'cls': 'fa-solid fa-microphone'}}), create_tag({'element': 'span', 'options':{'cls':'','innerText': 'Record'}})]
        }});
        let stop_record_btn = create_tag({'element': 'span', 'options':{
            'cls': 'stop-record-btn managed_update hidden',
            'id': `stop-record-btn-${this.index}`,
            'data-container': id,
            'data-target': `id-${form_prefix}-${form_index}-audio`,
            'data-name': `${form_prefix}-${form_index}-audio`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'data-index': `word-index-${this.index}`,
            'children': [create_tag({'element': 'i', 'options':{'cls': 'fa-solid fa-stop'}}), create_tag({'element': 'span', 'options':{'cls':'','innerText': 'Stop'}})]
        }});
        let play_record_btn = create_tag({'element': 'span', 'options':{
            'cls': 'play-record-btn hidden',
            'id': `play-record-btn-${this.index}`,
            'data-container': id,
            'data-target': `audio-player-${this.index}`,
            'data-player': `audio-player-${this.index}`,
            'data-index': `word-index-${this.index}`,
            'children': [create_tag({'element': 'i', 'options':{'cls': 'fa-solid fa-play'}}), create_tag({'element': 'span', 'options':{'innerText': 'Play'}})]
        }});
        let audio_btn_group = create_tag({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-add-audio-btn-header',
            'children': [start_record_btn,stop_record_btn, play_record_btn]
        }});
        let div_audio_group = create_tag({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-audio-actions`,
            'cls' : "full managed_update",
            'children': [audio, audio_player ,audio_btn_group]
        }});

        let div_audio_wrapper = create_tag({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-audio-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [div_audio_group]
        }});


        /****** */

        let langage = create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-langage`,
            'name': `${form_prefix}-${form_index}-langage`,
            'data-error': `${id}-word-error`,
            'data-slug': '',
            'data-name': '',
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
        let add_langage_btn = create_tag({'element': 'span', 'options':{
            'cls': 'add-langage-btn margin-bottom',
            'data-container': id,
            'data-target': 'langage-selector-dialog',
            'data-selected': `${form_prefix}-${form_index}-langage-selected`,
            'data-name': `${form_prefix}-${form_index}-langage`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'data-index': `word-index-${this.index}`,
            'children': [create_tag({'element': 'i', 'options':{'cls': 'fas fa-plus icon'}}), create_tag({'element': 'span', 'options':{'innerText': 'Select Langage'}})]
        }});
        let btn_group = create_tag({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-add-langage-btn-header',
            'children': [add_langage_btn,selected_langage]
        }});
        let div_langage_group = create_tag({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-langage-actions`,
            'cls' : "full managed_update",
            'children': [btn_group]
        }});

        let div_langage_wrapper = create_tag({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-langage-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [div_langage_group]
        }});
        let description = create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-description`,
            'name': `${form_prefix}-${form_index}-description`,
            'value': '',
            'cls': 'managed-update',
            'type':'hidden'
        }});
        let label_description = create_tag({'element': 'label', 'options': {
            'innerText': 'Description',
            'cls': 'managed-update',
            'htmlFor': description.id
        }});
        let editor = create_tag({'element': 'div', 'options': {
            'cls': 'editor editor-box',
            'id': `editor-${form_prefix}-${form_index}-description`,
            'data-target': `id-${form_prefix}-${form_index}-description`

        }});
        let form_group_description = create_tag({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_description, description, editor]
        }});

        let div_description_wrapper = create_tag({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_description]
        }});
        let added_by = create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-added_by`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-added_by`,
            'type':'hidden'
        }});
        let input_form_id = create_tag({'element': 'input', 'options':{
            'id':`id-${form_prefix}-${form_index}-id`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-id`,
            'type':'hidden'
        }});

        let hidden_div = create_tag({'element': 'div', 'options': {
            'cls': 'hidden',
            'children': [added_by, input_form_id]
        }});

        
        let div = create_tag({'element': 'div', 'options': {
            'cls': 'mat-box editor-box-wrapper',
            'id': id,
            'data-selected': `word-index-${this.index}-countries-selected`,
            'data-index': `word-index-${this.index}`,
            'children': [hidden_div,header_group, div_name_wrapper, div_audio_wrapper, div_langage_wrapper, div_description_wrapper]
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
        //Keyboard.register_keyboard(virtual_keyboard_button);
        return {'tag': div, 'inputs': form_inputs,
                'audio':{'start_btn': start_record_btn,'stop_btn': stop_record_btn,'play_btn': play_record_btn ,'player': audio_player, 'input': audio},
                'editor': editor,'add-langage-btn': add_langage_btn, 
                'word_input': word, 'selection': selected_langage, 'index': `word-index-${this.index}`,
                'keyboard-btn': virtual_keyboard_button
        };
    }

    return WordFormFactory;
});
