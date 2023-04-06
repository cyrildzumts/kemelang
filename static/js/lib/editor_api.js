define(['ajax_api','tag_api','editor/editor', 
'editor/plugins/header.min','editor/plugins/list.min',
'editor/plugins/checklist.min'], 
function(ajax_api,tag_api, EditorJS) {
    'use strict';

    const SAVE_DRAFT_INTERVAL = 10000; // 10s
    const EDITOR_CHANGE_TIMEOUT = 1000; // 1s
    let AUTO_SAVE_TIMER;
    let editor;
    let editor_content;
    let editor_content_target;
    let editor_json_target = null;


    const Header = require('editor/plugins/header.min');
    const List = require('editor/plugins/list.min');
    const Checklist = require('editor/plugins/checklist.min');

    let headers = [null, "h1","h2", "h3", "h4", "h5", "h6"];
    let LIST_TYPE_MAPPING = {
        ordered: 'ol',
        unordered: 'ul',
        checklist: 'ul'

    };
    let BLOCK_MAPPING = {
        'header': render_header,
        'paragraph': render_paragraph,
        'list': render_list,
        'checklist': render_checklist,
    };

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

    function editor_content_clear(container){
        let editor_content_target = container || document.querySelector('#editor-content');
        if (editor_content_target){
            while(editor_content_target.firstChild){
                editor_content_target.removeChild(editor_content_target.firstChild);
            }
        }
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

    function on_editor_save(saved_data){
        editor_content = saved_data;
        if(editor_content['blocks'].length > 0){
            editor_json_target.value = JSON.stringify(editor_content);
        }else{
            editor_json_target.value = "";
        }
        
    }

    function on_editor_change(api, event){
        api.saver.save().then(on_editor_save).catch((error)=>{
            console.log("Error on saving editor content after changes : ", error);
        });
    }
    
    function editor_init(data){
        let init_data = data || {};
        if(editor_json_target.value.length){   
            try {
                init_data = JSON.parse(editor_json_target.value);
            } catch (error) {
                console.warn("error on parsing json data from description_json value : %s", editor_json_target.value);
                console.error(error);
                init_data = {};
            }
        }
        let editor_tag = document.getElementById('editor');

        editor = new EditorJS({
            holder:'editor',
            tools: {
                header : {
                    class : Header,
                    inlineToolbar : true
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                checklist: {
                    class:Checklist,
                    inlineToolbar:true
                }
            },
            data: init_data,
            placeholder: editor_tag.dataset.placeholder,
            onReady: function(){
                console.log("Editor is ready");
            },
            onChange: (api, event) =>{
                if(AUTO_SAVE_TIMER){
                    clearTimeout(AUTO_SAVE_TIMER);
                }
                AUTO_SAVE_TIMER = setTimeout(on_editor_change, EDITOR_CHANGE_TIMEOUT, api, event);
            }
        });
        /*
        $(".js-save-btn").on('click', function(event){
            editor.save().then(on_editor_save).catch((error)=>{
                console.log("Error on saving editor content : ", error);
            });
        });
        */
       /*
        $(".js-clear-btn").on('click', (event)=>{
            console.log("Clearing editor content not implemented yet ");
        });
        */
        console.log("Editor loaded", editor);

        return editor;
    }


    function create_editor(){
        let editor_tag = document.getElementById('editor');
        editor_json_target = document.getElementById('description_json');
        if( !editor_tag){
            return;
        }
        if(!editor_json_target){
            return;
        }
        //editor_content_target = document.getElementById('editor-content');
        /*
        if('product' in editor_json_target.dataset){
            let product_uuid = editor_json_target.dataset['product'];
            let url = '/api/product-description-json/' + product_uuid + '/';
            //let formData = new FormData();
            //formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken.value);
            let fetch_options = {
                method : 'GET'
            };
            ajax_api.fetch_api(url, fetch_options).then((response)=>{
                console.log("got response : ", response);
                editor_init(response);
            }, function(reason){
                console.error("Error on fetching json description.");
                console.error(reason);
                
            });

        }else{
            editor_init();
        }
        */
        editor_init();
    }
    create_editor();
});