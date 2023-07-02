define(['tag_api', 'constants'],function(tag_api, Constants) {
    'use strict';

    let headers = [null, "h1","h2", "h3", "h4", "h5", "h6"];
    let LIST_TYPE_MAPPING = {
        ordered: 'ol',
        unordered: 'ul',
        checklist: 'ul'

    };
    
    let BLOCK_MAPPING = {
        'header': render_header,
        'paragraph': render_paragraph,
        'table': render_table,
        'list': render_list,
        'linkTool': render_linkTool,
        'checklist': render_checklist,
        'quote': render_quote,
        'image': render_inlineImage,
        'emoji': render_emoji
    };

    function render_emoji(emoji){
        console.log(emoji);
        return emoji.data.text;
    }

    function render_header(header){
        let node = tag_api.create_tag({
            element:headers[header.data.level],
            options : {
                id:header.id,
                innerHTML: header.data.text
            }
        });
        return node;
    }

    function render_linkTool(linkTool){
        let node = tag_api.create_tag({
            element: "a",
            options : {
                id:linkTool.id,
                cls:'mat-button mat-button-text',
                href : linkTool.data.link,
                innerText: linkTool.data.link
            }
        });
        return node;
    }

    function render_inlineImage(inlineImage){
        let node = tag_api.create_tag({
            element: "img",
            options : {
                id:inlineImage.id,
                src: inlineImage.data.url,
                title: inlineImage.data.caption,
                cls:'img-responsive',
            }
        });
        return node;
    }

    function render_paragraph(paragraph){
        let node = tag_api.create_tag({
            element: "p",
            options : {
                id:paragraph.id,
                innerHTML : paragraph.data.text
            }
        });
        return node;
    }

    function render_table(table){
        let items = [];
        let startIndex = 0;
        let content;

        if(table.data.withHeadings){
            
            let ths = [];
            table.data.content[startIndex].forEach((h)=>{
                ths.push(tag_api.create_tag({
                    element:'th',
                    options:{
                        innerHTML:h
                    }
                }));
            });
            let tr = tag_api.create_tag({
                element: 'tr',
                options:{
                    children: ths
                }
            });
            items.push(tag_api.create_tag({
                element: 'thead',
                options:{
                    children: [tr]
                }
            }));

            startIndex = 1;
            content = table.data.content.slice(startIndex);
        }else{
            content = table.data.content;
        }

        let trs = [];
        content.forEach((item)=>{
            let tds = [];
            item.forEach((value) => tds.push(tag_api.create_tag({
                element: "td",
                options : {
                    innerText : value
                }
            })));
            trs.push(tag_api.create_tag({
                element: "tr",
                options : {
                    children : tds
                }
            }));
        });
        items.push(tag_api.create_tag({
            element: "tbody",
            options : {
                children: trs
            }
        }));
        let node = tag_api.create_tag({
            element: table.type,
            options : {
                id:table.id,
                children : items
            }
        });
        return node;
    }

    function render_list(list){
        let items = []
        list.data.items.forEach((item)=>{
            items.push(tag_api.create_tag({
                element: "li",
                options : {
                    innerHTML : item
                }
            })
            );
        });
        let node = tag_api.create_tag({
            element: LIST_TYPE_MAPPING[list.data.style],
            options : {
                id:list.id,
                children : items
            }
        });
        return node;
    }

    function render_checklist(checklist){
        let items = []
        checklist.data.items.forEach((item)=>{
            let input = tag_api.create_tag({
                element : "input",
                options : {
                    'type': 'checkbox',
                    'checked': item.checked
                }
            });
            let span = tag_api.create_tag({
                element: "span",
                options : {
                    innerHTML : item.text
                }
            });
            let div = tag_api.create_tag({
                element: "div",
                options : {
                    children : [input, span]
                }
            });
            items.push(tag_api.create_tag({
                element: "li",
                options : {
                    children : [div]
                }
            })
            );
        });
        let node = tag_api.create_tag({
            element: LIST_TYPE_MAPPING[checklist.type],
            options : {
                id:checklist.id,
                children : items
            }
        });
        return node;
    }

    function render_quote(quote){
        let span = tag_api.create_tag({
            element: "span",
            options : {
                innerHTML : quote.data.text
            }
        });
        let cite = tag_api.create_tag({
            element: "cite",
            options : {
                innerHTML : quote.data.caption
            }
        });
        let node = tag_api.create_tag({
            element: "blockquote",
            options : {
                id:quote.id,
                innerHTML : quote.data.text,
                children: [cite]
            }
        });
        return node;
    }

    function render_content(blocks){
        let elements = [];
        blocks.forEach((block)=>{
            elements.push(BLOCK_MAPPING[block.type](block));
        });
        return elements;
    }

    function show_editor_content(data){
        if(editor_content_target  && data){
            let html_elements = render_content(data['blocks']);
            html_elements.forEach((el)=>{
                editor_content_target.appendChild(el);
            });
        }
    }

    function DictFactory(){
        
    };
    DictFactory.prototype.init = function(){
        console.log("Word Form Factory initalised");
    };

    DictFactory.prototype.create_word = function(container, word){
        let word_tag = tag_api.create_tag({'element': 'span','options': {
            'cls': 'bold full',
            'innerText': `${word.word},${word.transliteration},[${word.langage.name}],`

        }});
        let definition = undefined;
        if(word.definition){
            definition = tag_api.create_tag({'element': 'span','options': {
                'cls': 'padding-b full',
                'innerText': word.definition
    
            }});
        }else{
            definition = tag_api.create_tag({'element': 'div','options': {
                'cls': 'padding-b',
                'children': render_content(word.description['blocks'])
    
            }});
        }

        let a_tag = tag_api.create_tag({'element': 'a','options': {
            'cls': 'bold',
            'href': `${Constants.SITE_HOST}${word.url}`,
            'innerText': 'Details'

        }});
        let word_header = tag_api.create_tag({'element': 'div','options': {
            'cls': 'flex flex-left full padding-b',
            'children': [word_tag, a_tag]

        }});

        let word_group = tag_api.create_tag({'element': 'div','options': {
            'cls': 'flex flex-left flex-wrap full padding-b',
            'children': [word_header, definition]

        }});
        /*
        let link = tag_api.create_tag({'element': 'div','options': {
            'cls': 'padding-b',
            'children': [tag_api.create_tag({'element': 'a','options': {
                'cls': 'padding-b',
                'href': `${Constants.SITE_HOST}${word.url}`,
                'innerText': 'Details'
    
            }})]

        }});
        */
        /*
        let details = tag_api.create_tag({'element': 'div','options': {
            'cls': 'padding-b',
            'children': render_content(word.definition['blocks'])

        }});*/
        let word_div = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'padding',
            'children': [word_group, definition]
        }});
        container.appendChild(word_div);
        return word_div;
    }

    DictFactory.prototype.create_form = function(index, prefix, delete_callback){
        let self = this;
        let form_index = index || 0;
        let form_prefix = prefix || 'form';
        let create_api = tag_api.create_tag;
        let id = `${form_prefix}-${form_index}`;
        let delete_button = tag_api.create_tag({'element': 'span', 'options':{
            'cls': 'managed-update',
            'id': id + '-delete-btn',
            'title': 'Delete this word',
            'children': [tag_api.create_tag({'element': 'i', 'options':{'cls': 'fas fa-trash icon'}})]
        }});
        let header_label = tag_api.create_tag({'element': 'div', 'options':{
            'children': [tag_api.create_tag({'element': 'span', 'options':{'innerText': 'Word', 'cls': 'bold'}})]
        }});
        let header_group = tag_api.create_tag({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-delete-btn-header',
            'children': [header_label, delete_button]
        }});
        let word = tag_api.create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-word`,
            'name': `${form_prefix}-${form_index}-word`,
            'data-error': `${id}-word-error`,
            'cls': 'managed-update',
            'type':'text'
        }});
        let word_error = tag_api.create_tag({'element': 'span', 'options':{'id': `${id}-word-error` ,'cls': 'managaed-update small hidden','innerText': 'word already exists'}})
        let label_word = tag_api.create_tag({'element': 'label', 'options': {
            'innerText': 'Word',
            'cls': 'managed-update',
            'htmlFor': word.id
        }});
        let form_group_name = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_word, word_error, word]
        }});

        let div_name_wrapper = tag_api.create_tag({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_name]
        }});

        let langage = tag_api.create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-langage`,
            'name': `${form_prefix}-${form_index}-langage`,
            'data-error': `${id}-word-error`,
            'cls': 'managed-update',
            'type':'hidden'
        }});
        let add_langage_btn = tag_api.create_tag({'element': 'span', 'options':{
            'cls': 'add-langage-btn',
            'data-container': id,
            'data-target': 'langage-selector-dialog',
            'data-name': `${form_prefix}-${form_index}-langage`,
            'data-open': 'fas fa-plus',
            'data-close': 'fas fa-times',
            'children': [tag_api.create_tag({'element': 'i', 'options':{'cls': 'fas fa-plus icon'}}), tag_api.create_tag({'element': 'span', 'options':{'innerText': 'Add Langage'}})]
        }});
        let btn_group = tag_api.create_tag({'element': 'div', 'options':{
            'cls': 'header-group',
            'id': id + '-delete-btn-header',
            'children': [add_langage_btn]
        }});
        let div_langage_group = tag_api.create_tag({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-langage-actions`,
            'cls' : "full managed_update",
            'children': [btn_group]
        }});

        let div_langage_wrapper = tag_api.create_tag({'element': 'div', 'options': {
            'id': `${form_prefix}-${form_index}-langage-wrapper`,
            'cls' : "form-group-wrapper managed_update",
            'children': [langage, div_langage_group]
        }});
        let description = tag_api.create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-description`,
            'name': `${form_prefix}-${form_index}-description`,
            'value': '',
            'cls': 'managed-update',
            'type':'hidden'
        }});
        let label_description = tag_api.create_tag({'element': 'label', 'options': {
            'innerText': 'Description',
            'cls': 'managed-update',
            'htmlFor': description.id
        }});
        let editor = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'editor editor-box',
            'id': `editor-${form_prefix}-${form_index}-description`,
            'data-target': `id-${form_prefix}-${form_index}-description`

        }});
        let form_group_description = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'form-group',
            'children': [label_description, description, editor]
        }});

        let div_description_wrapper = tag_api.create_tag({'element': 'div', 'options': {
            'cls' : "form-group-wrapper",
            'children': [form_group_description]
        }});
        let added_by = tag_api.create_tag({'element': 'input', 'options':{
            'id': `id-${form_prefix}-${form_index}-added_by`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-added_by`,
            'type':'hidden'
        }});
        let input_form_id = tag_api.create_tag({'element': 'input', 'options':{
            'id':`id-${form_prefix}-${form_index}-id`,
            'cls': 'managed-update',
            'name': `${form_prefix}-${form_index}-id`,
            'type':'hidden'
        }});

        let hidden_div = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'hidden',
            'children': [added_by, input_form_id]
        }});

        
        let div = tag_api.create_tag({'element': 'div', 'options': {
            'cls': 'mat-box editor-box-wrapper',
            'id': id,
            'children': [hidden_div,header_group, div_name_wrapper, div_langage_wrapper, div_description_wrapper]
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
        return {'tag': div, 'inputs': form_inputs, 'editor': editor,'add-langage-btn': add_langage_btn, 'word_input': word};
    }

    return DictFactory;
});
