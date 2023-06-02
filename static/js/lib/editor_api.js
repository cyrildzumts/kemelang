define(['require','ajax_api', 'tag_api', /*'editor/editor',*/ 'editor/editorjs.umd',
'editor/plugins/header.min','editor/plugins/list.min', 'editor/plugins/link.min',
'editor/plugins/checklist.min', 'editor/plugins/quote.min', 'editor/plugins/table.min',
'editor/plugins/inline-image','editor/plugins/editor-emoji.min',
'editor/plugins/code.min','editor/plugins/inline-code.min',
'editor/plugins/marker.min'
], 
function(require, ajax_api, tag_api, EditorJS) {
    'use strict';

    const SAVE_DRAFT_INTERVAL = 10000; // 10s
    const EDITOR_CHANGE_TIMEOUT = 1000; // 1s
    let AUTO_SAVE_TIMER;
    let editor;
    let editor_content;
    let editor_content_target;
    let editor_target = null;


    const Header = require('editor/plugins/header.min');
    const List = require('editor/plugins/list.min');
    const Link = require('editor/plugins/link.min');
    const Code = require('editor/plugins/code.min');
    const Marker = require('editor/plugins/marker.min');
    const InlineCode = require('editor/plugins/inline-code.min');
    const Checklist = require('editor/plugins/checklist.min');
    const Quote = require('editor/plugins/quote.min');
    const Emoji = require('editor/plugins/editor-emoji.min');
    const Table = require('editor/plugins/table.min');
    const InlineImage = require('editor/plugins/inline-image');

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
            editor_target.value = JSON.stringify(editor_content);
        }else{
            editor_target.value = "";
        }
        
    }

    function on_editor_change(api, event){
        api.saver.save().then(on_editor_save).catch((error)=>{
            console.log("Error on saving editor content after changes : ", error);
        });
    }
    
    function editor_init(data, editor_holder){
        let init_data = data || {};
        if(editor_target.value.length){   
            try {
                init_data = JSON.parse(editor_target.value);
            } catch (error) {
                console.warn("error on parsing json data from description_json value : %s", editor_target.value);
                console.error(error);
                init_data = {};
            }
        }
        let holder = editor_holder || 'editor';
        let editor_tag = document.getElementById(holder);

        editor = new EditorJS({
            holder: holder,
            tools: {
                header : {
                    class : Header,
                    inlineToolbar : true
                },
                image: {
                    class : InlineImage,
                    inlineToolbar : true,
                    config: {
                        embed : {
                            display: true
                        }
                    }
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                linkTool: {
                    class: Link,
                    inlineToolbar: true,
                    config:{
                        endpoint:"/api/fetchUrl/",
                    }
                },
                code: Code,
                emoji: {
                    class:Emoji,
                    inlineToolbar: true
                },
                checklist: {
                    class:Checklist,
                    inlineToolbar:true
                },
                quote: {
                    class:Quote,
                    inlineToolbar:true,
                    shortcut: 'CMD+SHIFT+Q',
                    config: {
                        quotePlaceholder: editor_tag.dataset.quotePlaceholder,
                        captionPlaceholder: editor_tag.dataset.captionPlaceholder,
                    },
                },
                Marker:{
                    class:Marker,
                    shortcut: 'CMD+SHIFT+M',
                },
                table: {
                    class: Table,
                    inlineToolbar: true,
                    config: {
                      rows: 2,
                      cols: 3,
                    },
                  },
            },
            data: init_data,
            autofocus: true,
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

        return editor;
    }

    var EditorWrapper = (function(){
        function EditorWrapper(holder, initial_data){

            this.editor = undefined;
            this.editor_data = {};
            this.initial_data = initial_data || {};
            this.target = undefined;
            this.holder_id = holder || 'editor';
            this.created = false;
            this.holder = document.getElementById(this.holder_id);

        }

        EditorWrapper.prototype.init = function(){
            if(!this.holder){
                console.warn("EditorWrapper called but no holder could be found.");
                return;
            }
            this.target = document.getElementById(this.holder.dataset.target);
            if(!this.target){
                console.warn("EditorWrapper called but no target could be found.");
                return;
            }
            if(!this.initial_data && this.target.value.trim().length > 0 ){
                try {
                    this.initial_data = JSON.parse(this.target.value);
                } catch (error) {
                    console.error(error);
                }
                
            }
            this.create_editor();
            this.created = true;
        }

        EditorWrapper.prototype.create_editor = function(){
            let self = this;
            this.editor = new EditorJS({
                holder: this.holder.id,
                tools: {
                    header : {
                        class : Header,
                        inlineToolbar : true
                    },
                    image: {
                        class : InlineImage,
                        inlineToolbar : true,
                        config: {
                            embed : {
                                display: true
                            }
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true
                    },
                    linkTool: {
                        class: Link,
                        inlineToolbar: true,
                        config:{
                            endpoint:"/api/fetchUrl/",
                        }
                    },
                    code: Code,
                    emoji: {
                        class:Emoji,
                        inlineToolbar: true
                    },
                    checklist: {
                        class:Checklist,
                        inlineToolbar:true
                    },
                    quote: {
                        class:Quote,
                        inlineToolbar:true,
                        shortcut: 'CMD+SHIFT+Q',
                        config: {
                            quotePlaceholder: this.holder.dataset.quotePlaceholder,
                            captionPlaceholder: this.holder.dataset.captionPlaceholder,
                        },
                    },
                    Marker:{
                        class:Marker,
                        shortcut: 'CMD+SHIFT+M',
                    },
                    table: {
                        class: Table,
                        inlineToolbar: true,
                        config: {
                          rows: 2,
                          cols: 3,
                        },
                      },
                },
                data: this.initial_data,
                autofocus: true,
                placeholder: this.holder.dataset.placeholder,
                onReady: function(){
                    console.log("Editor is ready");
                },
                onChange: (api, event) =>{
                    if(AUTO_SAVE_TIMER){
                        clearTimeout(AUTO_SAVE_TIMER);
                    }
                    AUTO_SAVE_TIMER = setTimeout(self.on_editor_change.bind(self), EDITOR_CHANGE_TIMEOUT, api, event);
                }
            });
        }

        EditorWrapper.prototype.clear = function(){
            this.target.value = "";
            this.editor_data = {};
            this.editor.clear();

        }

        EditorWrapper.prototype.on_editor_change = function(api, event){
            this.editor.save().then(this.on_editor_save.bind(this)).catch((error)=>{
                console.log("Error on saving editor content after changes : ", error);
            });

        }

        EditorWrapper.prototype.on_editor_save = function(saved_data){
            this.editor_data = saved_data;
            if(this.editor_data['blocks'].length > 0){
                this.target.value = JSON.stringify(saved_data);
            }else{
                this.target.value = "";
            }
            
        }


        return EditorWrapper;
    })();


    function create_editor(){
        let editor_tag = document.getElementById('editor');
        if( !editor_tag){
            return;
        }
        editor_target = document.getElementById(editor_tag.dataset.target);
        if(!editor_target){
            console.warn("Editor target not found. %s", editor_target);
            return;
        }
        editor_init();
    }
    return {
        'create_editor': create_editor,
        'EditorWrapper': EditorWrapper
    }
});