define(['ajax_api', 'tag_api', 'vendor/js.cookie', 'filters'], 
function(ajax_api, tag_api,Cookies, Filter) {
    'use strict';
    const FETCH_PRODUCT_IMAGE_URL = "/api/fetch-images/";
    const FETCH_BRANDS_URL = "/api/fetch-brands/";
    const FETCH_CATEGORIES_URL = "/api/fetch-categories/";
    const FETCH_PRODUCT_TYPES_URL = "/api/fetch-product-types/";
    const HTTP_URL_REGEX = RegExp('^(http:|https:|www\.)*');
    const IMAGE_FILE_INPUT_NAME = "images";
    const CAMPAIGN_IMAGE_FILE_INPUT_NAME = "image";
    let fileUpload;
    let productManager;
    let campaignManager;
    let mailcampaignManager;
    let highlightManager;
    let offlineOrderManager;
    let AVAILABILITY_ON_DEMAND = 1;
    let CAMPAIGN_TYPE_REPEAT_WEEKLY = 0, CAMPAIGN_TYPE_REPEAT_MONTHLY = 1,  CAMPAIGN_TYPE_REPEAT_ONCE = 2;
    
    let order_status_container;
    let order_payment_option_container;
    let order_status = [];
    let filter_form;

    function is_http_url(url){
        return HTTP_URL_REGEX.test(url);
    }
    function update_product_images_links(img_container){
        if(!img_container){
            return;
        }
        let selected_images = img_container.querySelectorAll("img.selected");
        let input_links_container = document.getElementById("product-image-links");
        while(input_links_container.firstChild){
            input_links_container.removeChild(input_links_container.firstChild);
        }
        selected_images.forEach(function(img, index){
            input_links_container.appendChild(tag_api.create_tag({'element': 'input', 'options':{
                'type': 'hidden',
                'name': "image_links",
                'value': img.src
            }}));
        });

    }
    function on_images_fetched(response){
        console.log("images Url response ready : ", response);
        let img_results = document.getElementById("fetch-img-results");
        let input_links_container = document.getElementById("product-image-links");
        while(img_results.firstChild){
            img_results.removeChild(img_results.firstChild);
        }
        if(response.links){
            let tag;
            response.links.forEach((link) =>{
                tag = tag_api.create_tag({'element': 'img', 'options':{
                    'src': link,
                    'cls': "img-responsive"
                }});
                tag.addEventListener("click", function(event){
                    event.stopPropagation();
                    this.classList.toggle("selected");
                    update_product_images_links(img_results);
                });
                img_results.appendChild(tag);
            });
        }
        
    }

    function toggle_fetch_img_btn(toggle){
        let btn = document.getElementById("fetch-img-btn");
        btn.disabled = toggle;
        btn.classList.toggle('disabled', toggle);
    }
    function activate_fetch_image_btn(){
        let btn = document.getElementById("fetch-img-btn");
        btn.disabled = false;
        btn.classList.remove('disabled');
    }
    function on_images_fetch_finished(){
       activate_fetch_image_btn();
    }

    function image_fetch(data, callback){
        let options = {
            url : FETCH_PRODUCT_IMAGE_URL,
            type: 'POST',
            data : data,
            dataType : 'json',
            processData : false,
            cache : false,
            //headers:{'X-CSRFToken': data.csrfmiddlewaretoken},
            contentType : false
        };
        ajax_api.ajax(options)
        .then(response => {
            if (typeof callback == "function"){
                callback(response);
            }
        }).catch(error =>{
            console.error("Error on image_fetch : ", error);
            
        }).finally(()=>{
            on_images_fetch_finished();
        });
    }
    
    function toggle_order_status(element){
        let value = element.data('value');
        let added = false;
        let status_input = $('#order-status-input');
        let current_value = status_input.val();
        let values = ""
        element.toggleClass('chips-selected', !element.hasClass('chips-selected'));
        let selected_chips = $('.order-status-chips.chips-selected');
        selected_chips.each(function(index, element){
            let chips = $(this);
            if(index < selected_chips.length - 1){
                values += chips.data('value') + ",";
            }else{
                values += chips.data('value');
            }
            added = true;
        });
        status_input.val(values);
        return added;
    }
    
    function toggle_playment_option(element){
        let value = element.data('value');
        let added = false;
        let input = $('#order-payment-option-input');
        let current_value = input.val();
        let values = ""
        element.toggleClass('chips-selected', !element.hasClass('chips-selected'));
        let selected_chips = $('.order-payment-option-chips.chips-selected');
        selected_chips.each(function(index, element){
            let chips = $(this);
            if(index < selected_chips.length - 1){
                values += chips.data('value') + ",";
            }else{
                values += chips.data('value');
            }
            added = true;
        });
        input.val(values);
        return added;
    }
    
    
    function toggle_amount_option(element){
        let input = $('#amount-filter');
        let filter_action = element.data('value');
        let added = false;
        if(input.val() == filter_action){
            //element.removeClass('chips-selected').siblings().removeClass('chips-selected');
            input.val('');
        }else{
            input.val(filter_action);
            added = true;
            //element.addClass('chips-selected').siblings().removeClass('chips-selected');
        }
        $(".amount-filter-chips .chips").removeClass('chips-selected');
        return added;
    }
    
    function toggle_date_filter(element){
        let input = $('#filter-action');
        let filter_action = element.data('filter-action');
        if(input.val() == filter_action){
            element.removeClass('chips-selected').siblings().removeClass('chips-selected');;
            input.val('');
        }else{
            input.val(filter_action);
            element.addClass('chips-selected').siblings().removeClass('chips-selected');
        }
    }


    function clear_uploaded_files(){
        let files_container = document.querySelector('.file-list');
        let input_files = document.querySelector('#files');
        input_files.value = null;
        while(files_container.firstChild){
            files_container.removeChild(files_container.firstChild);
        }
        $('.js-uploaded-files-clear').hide();
    }
    function show_preview(files) {
        let files_container = document.querySelector('.file-list');
        let li;
        let img;
        while(files_container.firstChild){
            files_container.removeChild(files_container.firstChild);
        }
        console.log("files : ", files);
        let f;
        for(let i = 0; i < files.length; i++){
            f = files[i];
            li = document.createElement('li');
            img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.height = 60;
            files_container.appendChild(li);
            img.onload = function(){
                URL.revokeObjectURL(img.src);
            };
            li.classList.add('file-entry');
            li.appendChild(img);
            const info = document.createElement('span');
            info.innerHTML = f.name + " : " + f.size + ' bytes';
            li.appendChild(info);
        }
    }

    function onDragInit(){
        let droppedFiles;
        let dragarea = document.querySelector('.drag-area');
        if(!dragarea){
            console.log("no drag-area could be found");
            return;
        }
        let $form = $('#' + dragarea.dataset.form);
        $('.drag-area').on('drag dragstart dragend dragover dragenter drop', function(e){
            e.preventDefault();
            e.stopPropagation();
        }).on('dragover dragenter', function(){
            dragarea.classList.add('on-drag');
        }).on('dragleave dragend drop', function(){
            dragarea.classList.remove('on-drag');
        }).on('drop', function(e){
            droppedFiles = e.originalEvent.dataTransfer.files;
            let input_files = document.querySelector('#files');
            console.log("Droped file : ", droppedFiles);
            console.log("Input file : ", input_files.files);
            input_files.files = droppedFiles;
            console.log("Input file 2 : ", input_files.files);
            show_preview(droppedFiles);
            $('.js-uploaded-files-clear').show();
            console.log("Files dropped : %s", droppedFiles.length);

        });
        $('.js-uploaded-files-clear').on('click', clear_uploaded_files);
    }

    function onDropHandler(event){
        event.preventDefault();
        let files = [];
        event.dataTransfer = event.originalEvent.dataTransfer;
        if(event.dataTransfer.items){
            let items = event.dataTransfer.items;
            for(let i = 0; i < items.length; i++){
                if(items[i].kind === 'file'){
                    let file = items[i].getAsFile();
                    fileUpload.addFile(file);
                }
            }
        }else{
            let files = event.dataTransfer.files;
            //fileUpload.setFiles(files);
            for(let i = 0; i < files.length; i++){
                //let file = files[i]
                fileUpload.addFile(files[i]);
            }
        }
        $('.drag-area').removeClass('on-drag');
    }


    function onDragOverHandler(event){
        event.preventDefault();
    }

    function onDragStartHandler(event) {
        $('.drag-area').addClass('on-drag');
        
    }
    function onDragEndHandler(event) {
        $('.drag-area').removeClass('on-drag');
        
    }

    function uploadFiles(form, files) {
        let formData = new FormData(form);
        files.forEach(function(file, index){
            formData.append("file_" + index, file, file.name);
        });
        $(form).serializeArray().forEach(function(input, index){
            formData.append(input.name, input.value);
        });
        let options = {
            url : $(form).attr('action'),
            type: 'POST',
            enctype : 'multipart/form-data',
            data : formData,
            processData : false,
            cache : false,
            contentType : false
        };
        ajax_api.ajax(options, false).then(function(response){

        }, function(reason){

        });
        
    }

    function removeChildren(element){
        if(!element){
            return;
        }
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    function populate_catergories(data){
        let element = document.getElementById('category');
        if (!element || !data || !data.entries) {
            return;
        }
        removeChildren(element);
        let entries = data.entries;
        entries.forEach((e,i) =>{
            element.appendChild(tag_api.create_tag({'element':'option','options':{
                'value': e.id,
                'innerText': e.name + '-' + e.display_name
            }}));
        });
    }
    function populate_brands(data){
        let element = document.getElementById('brand');
        if (!element || !data || !data.entries) {
            return;
        }
        removeChildren(element)
        let entries = data.entries;
        entries.forEach((e,i) =>{
            element.appendChild(tag_api.create_tag({'element':'option','options':{
                'value': e.id,
                'innerText': e.display_name
            }}));
        });
    }
    function populate_product_types(data){
        let element = document.getElementById('product-type');
        if (!element || !data || !data.entries) {
            return;
        }
        removeChildren(element);
        let entries = data.entries;
        entries.forEach((e,i) =>{
            let input = tag_api.create_tag({'element': 'input','options':{
                'cls': 'product-type-input',
                'type': 'radio',
                'name': 'product_type',
                'value': e.id,
                'data-type-uuid': e.type_uuid,
                'id': 'p_type-' + e.id
            }});
            input.addEventListener('change', update_attrs_from_type);
            let label = tag_api.create_tag({'element': 'label', 'options': {
                'htmlFor': 'p_type-' + e.id,
                'innerText': e.display_name
            }});
            element.appendChild(tag_api.create_tag({'element': 'span', 'options':{
                'cls': 'padding',
                'children': [input, label]
            }}));
        });
    }
    let ImageManager = (function(){
        function ImageManager(form, drag_area_selector){
            this.form = form;
            this.supported_formats = ['jpg', 'jpeg', 'png', 'webp'];
            this.input_files;
            this.droppedFiles = [];
            this.drag_area_selector = drag_area_selector;
        }
        ImageManager.prototype.init = function(){
            let self = this;
            let drag_area_selector = this.drag_area_selector || ".drag-area";
            this.drag_areas = document.querySelectorAll(this.drag_area_selector);
            if(!this.drag_areas){
                return;
            }
            this.input_files = document.querySelectorAll('.files-upload-input');
            if(!this.input_files){
                return;
            }
            $(drag_area_selector).on('drag dragstart dragend dragover dragenter drop', function(e){
                e.preventDefault();
                e.stopPropagation();
            }).on('dragover dragenter', function(){
                this.classList.add('on-drag');
            }).on('dragleave dragend drop', function(){
                this.classList.remove('on-drag');
            }).on('drop', function(e){
                let file_input = document.getElementById(this.dataset.input);
                if(file_input){
                    let dtFiles = e.originalEvent.dataTransfer.files;
                    for(const file of dtFiles){
                        if(self.find(file) != undefined){
                            console.log("File already present ...");
                        }else{
                            self.droppedFiles.push(file);
                        }
                    }
                    file_input.files = dtFiles;
                    this.classList.add('active');
                    self.imagesPreview(this);
                }
            });
            $('.files-upload-input').on('change', function(e){
                let drag_area = document.getElementById(this.dataset.dragarea);
                if(this.files){
                    drag_area.classList.remove('active');
                }
                self.imagesPreview(drag_area);
            });
            $('.js-uploaded-files-clear').on('click', function(event){
                let files_container = document.getElementById(this.dataset.target);
                
                while(files_container.firstChild){
                    files_container.removeChild(files_container.firstChild);
                }
                let input = document.getElementById(files_container.dataset.input);
                let drag_area = document.getElementById(this.dataset.dragarea);
                input.files = null;
                let entry = document.createElement('div');
                let span = document.createElement('span');
                span.innerText = "No images";
                entry.appendChild(span);
                files_container.appendChild(entry);
                drag_area.classList.remove('active');
                self.droppedFiles.length = 0;
            });
        }
        ImageManager.prototype.find = function(file){
            return this.droppedFiles.find(f => f.name == file.name);
        }
        ImageManager.prototype.getDroppedFiles = function(){
            return this.droppedFiles;
        }
        ImageManager.prototype.imagesPreview = function(drag_area){
            let entry;
            let img;
            let input = document.getElementById(drag_area.dataset.input);
            let files_container = drag_area.querySelector('.file-list');
            while(files_container.firstChild){
                files_container.removeChild(files_container.firstChild);
            }
            let f;
            for(let i = 0; i < this.droppedFiles.length; i++){
                f = this.droppedFiles[i];
                entry = document.createElement('div');
                img = document.createElement('img');
                img.src = URL.createObjectURL(f);
                img.classList.add('img-responsive');
                img.onload = function(){
                    URL.revokeObjectURL(img.src);
                };
                entry.classList.add('file-entry','col-m-2','col-2');
                entry.appendChild(img);
                const info = document.createElement('span');
                info.innerHTML = f.name + " : " + Math.ceil(f.size/1024) + ' KB';
                info.classList.add('padding');
                //entry.appendChild(info);
                files_container.appendChild(entry);
            }
            $('.js-uploaded-files-clear', drag_area).show();
        };

        ImageManager.prototype.clearImages = function(drag_area){
            let files_container = document.querySelector('.file-list', drag_area);
            if(!files_container){
                return;
            }
            while(files_container.firstChild){
                files_container.removeChild(files_container.firstChild);
            }
            let input_file = document.getElementById(drag_area.dataset.input);
            input_file.files = null;
            let entry = document.createElement('div');
            let span = document.createElement('span');
            span.innerText = "No images";
            entry.appendChild(span);
            files_container.appendChild(entry);
            drag_area.classList.remove('active');
        };
        ImageManager.prototype.clear = function(){
            if(this.input_files){
                this.input_files.forEach(function(v,i){
                    v.files = null;
                });
            }
            this.droppedFiles.length = 0;
        }

        return ImageManager;
    })();

    let CampaignManager = (function(){
        function CampaignManager() {
            this.images = [];
            this.form = undefined;
            this.formData = undefined;
            this.input_file = undefined;
            this.input_files;
            this.drag_area = undefined;
            this.files_container = undefined;
            this.send_btn = undefined;
            this.clear_uploaded_files_btn = undefined;
            this.campaign_container = undefined;
            this.campaign_link = undefined;
            this.supported_formats = ['jpg', 'jpeg', 'png', 'webp'];
            
        };
        CampaignManager.prototype.init = function(){
            let self = this;
            this.form = document.querySelector('#campaign-upload-form') || document.querySelector('#campaign-update-form');
            if(this.form == null ){
                console.warn("No campaign form found");
                return;
            }
            this.imageManager = new ImageManager(this.form);
            this.imageManager.init();
            this.campaign_container = document.querySelector('#created-producted-link');
            this.campaign_link = document.querySelector('#created-producted-link a');

            $('.js-input-campaign-type').on('change', this.onCampaignTpyeChanged);
            this.validators = [];
            
            $(this.form).on('submit', function(e){
                e.preventDefault();
                e.stopPropagation();
                self.formData = new FormData(self.form);
                self.upload();
            });

            console.log("Campaign initialized");

        };

        CampaignManager.prototype.clear = function(){
            document.querySelector('#description-counter').innerText = '0';
            this.imageManager.clear();
            this.campaign_link.href = '';
            this.campaign_link.innerText = '';
            this.campaign_container.style.display = 'none';
        }

        CampaignManager.prototype.is_update_form = function(){
            return this.form != null ? this.form.id == 'campaign-update-form' : false;
        }



        CampaignManager.prototype.onUploadResponse = function(data){
            if(!data.success){
                
                return;
            }
            this.clear();
            this.campaign_link.href = data.url;
            this.campaign_link.innerText = data.url_text + " : " + data.name;
            this.campaign_container.style.display = 'flex';
        };

        CampaignManager.prototype.upload = function(){
            let self = this;
            let form_is_valid = this.validate();
            if(!form_is_valid){
                console.log("Campaign form is invalid");
                return;
            }

            let url = this.is_update_form() ? '/api/update-campaign/' + this.form.dataset.campaign + '/' : '/api/create-campaign/';

            let options = {
                url : url,
                type: 'POST',
                enctype : 'multipart/form-data',
                data : this.formData,
                dataType : 'json',
                processData : false,
                cache : false,
                contentType : false
            };
            ajax_api.ajax(options).then(function(response){
                let msg = {
                    content : response.message,
                    level : response.created
                }
                notify(msg);
                self.onUploadResponse(response);
                

            }, function(reason){
                console.error("Files could not be uploaded.");
                console.error(reason);
            });
        };

        CampaignManager.prototype.onCampaignTpyeChanged = function(){
            let c_type = document.querySelector('.js-input-campaign-type:checked');
            let c_type_entries = document.querySelectorAll('.campaign-type');
            let c_type_value = parseInt(c_type.value);
            c_type_entries.forEach((e)=>{
                if((parseInt(e.dataset.campaignType) == c_type_value) || (parseInt(e.dataset.campaignAltType) == c_type_value)){
                    e.style.display = 'block';
                }else{
                    e.style.display = 'block';
                }

            });
            

        };


        CampaignManager.prototype.validate = function(){
            let name = document.querySelector('#name');
            let title = document.querySelector('#title');
            let description = document.querySelector('#description');
            let c_type = document.querySelector('.js-input-campaign-type:checked');
            let c_type_entries = document.querySelectorAll('.campaign-type');
            let c_type_value = c_type != null ? parseInt(c_type.value) : null;
            let is_valid = true;

            if(name == null || title == null || description == null){
                is_valid = false;
            }
            if(name.value == ""){
                name.classList.add('warn');
                is_valid = false;
            }else{
                name.classList.remove('warn');
            }
            if(title.value == ""){
                title.classList.add('warn');
                is_valid = false;
            }else{
                title.classList.remove('warn');
            }
            if(description.value == ""){
                description.classList.add('warn');
                is_valid = false;
            }else{
                description.classList.remove('warn');
            }
            if(c_type_value == null){
                is_valid = false;
            }
            let start_at = document.querySelector('#start_at');
            let end_at = document.querySelector('#end_at');
            let repeat_day = document.querySelector('#repeat_day');
            if(c_type_value == CAMPAIGN_TYPE_REPEAT_ONCE){
                if(start_at == null || end_at == null){
                    is_valid = false;
                }
                if( (start_at != null &&  start_at.value.length == 0)){
                    start_at.classList.add('warn');
                }
                if( (end_at != null &&  end_at.value.length == 0)){
                    end_at.classList.add('warn');
                }
                let start_date = new Date(start_at.value);
                let end_date = new Date(end_at.value);
                let today = new Date();
                today.setHours(0,0,0,0);
                if((start_date < today && !this.is_update_form()) || (end_date < today)){
                    start_at.classList.add('warn');
                    end_at.classList.add('warn');
                    is_valid = false;
                }else{
                    start_at.classList.remove('warn');
                    end_at.classList.remove('warn');
                }
            }
            if(c_type_value == CAMPAIGN_TYPE_REPEAT_WEEKLY || c_type_value == CAMPAIGN_TYPE_REPEAT_MONTHLY){
                if(repeat_day == null || isNaN(parseInt(repeat_day.value))){
                    c_type.classList.add('warn');
                    repeat_day.classList.add('warn');
                    is_valid = false;
                }else{
                    c_type.classList.remove('warn');
                    repeat_day.classList.remove('warn');
                }
            }
            
            /*
            if((this.images == null || this.images.length == 0) && !this.is_update_form()){
                return false;
            }*/
            return is_valid;
        };

        return CampaignManager;

    })();


    let MailCampaignManager = (function(){
        function MailCampaignManager() {
            this.images = [];
            this.form = undefined;
            this.formData = undefined;
            this.input_file = undefined;
            this.input_files;
            this.drag_area = undefined;
            this.files_container = undefined;
            this.send_btn = undefined;
            this.clear_uploaded_files_btn = undefined;
            this.campaign_container = undefined;
            this.campaign_link = undefined;
            this.supported_formats = ['jpg', 'jpeg', 'png', 'webp'];
            
        };
        MailCampaignManager.prototype.init = function(){
            let self = this;
            this.form = document.querySelector('#mail-campaign-upload-form') || document.querySelector('#mail-campaign-update-form');
            if(this.form == null ){
                console.warn("No campaign form found");
                return;
            }
            this.imageManager = new ImageManager(this.form);
            this.imageManager.init();
            this.campaign_container = document.querySelector('#created-producted-link');
            this.campaign_link = document.querySelector('#created-producted-link a');

            this.validators = [];
            
            $(this.form).on('submit', function(e){
                e.preventDefault();
                e.stopPropagation();
                self.formData = new FormData(self.form);
                let productImages = self.imageManager.getDroppedFiles();
                if(productImages.length == 0 && !self.is_update_form()){
                    notify({'content': "No images", 'level': 'warn'});
                    return;
                }
                self.formData = new FormData(self.form);
                productImages.forEach(f =>{
                    self.formData.append(CAMPAIGN_IMAGE_FILE_INPUT_NAME, f);
                });
                
                self.upload();
            });

            console.log("Campaign initialized");

        };

        MailCampaignManager.prototype.clear = function(){
            document.querySelector('#description-counter').innerText = '0';
            this.imageManager.clear();
            this.campaign_link.href = '';
            this.campaign_link.innerText = '';
            this.campaign_container.style.display = 'none';
        }

        MailCampaignManager.prototype.is_update_form = function(){
            return this.form != null ? this.form.id == 'mail-campaign-update-form' : false;
        }



        MailCampaignManager.prototype.onUploadResponse = function(data){
            if(!data.success){
                
                return;
            }
            this.clear();
            this.campaign_link.href = data.url;
            this.campaign_link.innerText = data.url_text + " : " + data.name;
            this.campaign_container.style.display = 'flex';
        };

        MailCampaignManager.prototype.upload = function(){
            let self = this;
            let form_is_valid = this.validate();
            if(!form_is_valid){
                console.log("Campaign form is invalid");
                return;
            }

            let url = this.is_update_form() ? '/api/mailing/update-mail-campaign/' + this.form.dataset.campaign + '/' : '/api/mailing/create-mail-campaign/';

            let options = {
                url : url,
                type: 'POST',
                enctype : 'multipart/form-data',
                data : this.formData,
                dataType : 'json',
                processData : false,
                cache : false,
                contentType : false
            };
            ajax_api.ajax(options).then(function(response){
                let msg = {
                    content : response.message,
                    level : response.created
                }
                notify(msg);
                self.onUploadResponse(response);
                

            }, function(reason){
                console.error("Files could not be uploaded.");
                console.error(reason);
            });
        };


        MailCampaignManager.prototype.validate = function(){
            let name = document.querySelector('#name');
            let key = document.querySelector('#key');
            let cta = document.querySelector('#cta');
            let target_link = document.querySelector('#target_link');
            let headerText = document.querySelector('#headerText');
            let bodyText = document.querySelector('#bodyText');
            let description = document.querySelector('#description');

            let fields = [name, key, cta, target_link, headerText, bodyText, description];
            
            let is_valid = true;

            is_valid = fields.every((f) => f != null);
            if(!fields.every((f) => f != null)){
                return false;
            }

            fields.forEach(f =>{
                if(f.value == ""){
                    is_valid = false;
                    f.classList.add('warn');

                }else{
                    f.classList.remove('warn');
                }
            });
            return is_valid;
        };

        return MailCampaignManager;

    })();


    let HighlightManager = (function(){
        function HighlightManager() {
            this.images = null;
            this.form = undefined;
            this.formData = undefined;
            this.input_file = undefined;
            this.drag_area = undefined;
            this.files_container = undefined;
            this.send_btn = undefined;
            this.clear_uploaded_files_btn = undefined;
            this.highlight_container = undefined;
            this.highlight_link = undefined;
            this.supported_formats = ['jpg', 'jpeg', 'png', 'webp'];
        };
        HighlightManager.prototype.init = function(){
            let self = this;
            this.form = document.querySelector('#highlight-upload-form') || document.querySelector('#highlight-update-form');
            if(this.form == null ){
                console.warn("No highlight form found");
                return;
            }
            this.imageManager = new ImageManager(this.form);
            this.imageManager.init();
            this.highlight_container = document.querySelector('#created-producted-link');
            this.highlight_link = document.querySelector('#created-producted-link a');
            this.files_container = document.querySelector('.file-list');
            this.validators = [];
            
            $(this.form).on('submit', function(e){
                e.preventDefault();
                e.stopPropagation();
                self.formData = new FormData(self.form);
                self.upload();
            });

        };

        HighlightManager.prototype.clear = function(){
            this.imageManager.clear();
            //this.campaign_link.href = '';
            //this.campaign_link.innerText = '';
            //this.campaign_container.style.display = 'none';
        }

        HighlightManager.prototype.is_update_form = function(){
            return this.form != null ? this.form.id == 'highlight-update-form' : false;
        }
        HighlightManager.prototype.onUploadResponse = function(data){
            if(!data.success){
                
                return;
            }
            this.clear();
            //this.campaign_link.href = data.url;
            //this.campaign_link.innerText = data.url_text + " : " + data.name;
            //this.campaign_container.style.display = 'flex';
        };

        HighlightManager.prototype.upload = function(){
            let self = this;
            let form_is_valid = this.validate();
            if(!form_is_valid){
                console.log("Highlight form is invalid");
                return;
            }

            let url = this.is_update_form() ? '/api/update-highlight/' + this.form.dataset.highlight + '/' : '/api/create-highlight/';

            let options = {
                url : url,
                type: 'POST',
                enctype : 'multipart/form-data',
                data : this.formData,
                dataType : 'json',
                processData : false,
                cache : false,
                contentType : false
            };
            ajax_api.ajax(options).then(function(response){
                let msg = {
                    content : response.message,
                    level : response.created
                }
                notify(msg);
                self.onUploadResponse(response);
                

            }, function(reason){
                console.error("Files could not be uploaded.");
                console.error(reason);
            });
        };

        HighlightManager.prototype.validate = function(){
            let name = document.querySelector('#name');
            let display_name = document.querySelector('#display_name');
            let description = document.querySelector('#description');

            let is_valid = true;

            if(name == null || display_name == null || description == null){
                is_valid = false;
            }
            if(name.value == ""){
                name.classList.add('warn');
                is_valid = false;
            }else{
                name.classList.remove('warn');
            }
            if(display_name.value == ""){
                display_name.classList.add('warn');
                is_valid = false;
            }else{
                display_name.classList.remove('warn');
            }
            if(description.value == ""){
                description.classList.add('warn');
                is_valid = false;
            }else{
                description.classList.remove('warn');
            }
            return is_valid;
        };

        return HighlightManager;

    })();



    let ProductManager = (function(){
        function ProductManager() {
            this.images = null;
            this.form = undefined;
            this.formData = undefined;
            this.input_file = undefined;
            this.drag_area = undefined;
            this.files_container = undefined;
            this.send_btn = undefined;
            this.clear_uploaded_files_btn = undefined;
            this.created_product_container = undefined;
            this.created_product_link = undefined;
            this.on_demand_url = undefined;
            this.supported_formats = ['jpg', 'jpeg', 'png', 'webp'];
        };
        ProductManager.prototype.init = function(){
            let self = this;
            this.form = document.querySelector('#product-upload-form') || document.querySelector('#product-update-form');
            
            this.csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]');
            if(this.form == null || this.csrfmiddlewaretoken == null){
                return;
            }
            this.imageManager = new ImageManager(this.form);
            this.imageManager.init();
            this.created_product_container = document.querySelector('#created-product-link');
            this.created_product_link = document.querySelector('#created-product-link a');
            this.files_container = document.querySelector('.file-list');
            this.on_demand_url = document.querySelector('#on-demand-url');
            let scheduled_at = document.getElementById('scheduled_at');
            let schedules = document.querySelectorAll('.schedule');
            schedules.forEach(function(schedule){
                ["input","keyup","change"].forEach(function(eventName){
                    schedule.addEventListener(eventName,function(event){
                        self.validateSchedule(schedule);
                    });
                });
            });
            $("#product_url").on('change keyup',function(event){
                toggle_fetch_img_btn(!is_http_url(this.value));
            });

            $('#fetch-img-btn').on('click', function(event){
                event.stopPropagation();
                event.preventDefault();
                this.disabled = true;
                let product_url = document.getElementById("product_url").value;
                let alt_filter = document.getElementById("alt_filter").value;
                let csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
                let csrftoken = Cookies.get("csrftoken");
                let formData = new FormData();
                formData.append("product_url", product_url);
                formData.append('alt_filter', alt_filter);
                formData.append("csrfmiddlewaretoken", csrfmiddlewaretoken);
                image_fetch(formData, on_images_fetched);

            });
            
            $('.js-input-availability').on('change', function(e){
                try {
                    self.on_demand_url.classList.toggle('hidden', !(parseInt(this.value) == AVAILABILITY_ON_DEMAND));
                } catch (error) {
                    
                }
            });
            $('input.product-type-input').on('change', update_attrs_from_type);
            this.validators = [this.validateAvailability, this.validateBrand, this.validateCategory, 
                                this.validateDescriptions, this.validateGender, this.validateName, 
                                this.validateProductType, this.validateVariants, this.validateImages];
            

            
            $(this.form).on('submit', function(e){
                e.preventDefault();
                e.stopPropagation();
                let productImages = self.imageManager.getDroppedFiles();
                if(productImages.length == 0 && !self.is_update_form()){
                    notify({'content': "No images", 'level': 'warn'});
                    return;
                }
                self.formData = new FormData(self.form);
                productImages.forEach(f =>{
                    self.formData.append(IMAGE_FILE_INPUT_NAME, f);
                }); 
                // console.log("FormData Dumps")
                // for(const pair of self.formData.entries()){
                //     console.log(`${pair[0]}, ${pair[1]}`);
                // }
                // console.log("FormData Dumps End")
                //return;
                self.upload();
            });
            document.querySelectorAll('.fetch-btn').forEach((e,i)=>{
                e.addEventListener('click', function(event){
                    event.stopPropagation();
                    event.preventDefault();
                    if(this.dataset.target == "brand"){
                        self.onPropertiesFetch(FETCH_BRANDS_URL, populate_brands);
                    }else if(this.dataset.target == "category"){
                        self.onPropertiesFetch(FETCH_CATEGORIES_URL, populate_catergories);
                    }else if(this.dataset.target == "product-type"){
                        self.onPropertiesFetch(FETCH_PRODUCT_TYPES_URL, populate_product_types);
                    }
                });
            });


            console.log("ProductManager initialized");

        };

        ProductManager.prototype.clear = function(){
            
            this.imageManager.clear();
        }

        ProductManager.prototype.is_update_form = function(){
            return this.form != null ? this.form.id == 'product-update-form' : false;
        }

        ProductManager.prototype.validate = function(){
            // if(this.validators){
            //     return this.validators.every((f)=>f());
            // }
            return true;
        };

        ProductManager.prototype.validateSchedule = function(scheduled_el){
            let is_valid = true;
            if(scheduled_el && scheduled_el.value.length){
                let NOW = Date.now()
                let scheduled_at_Date = new Date(scheduled_el.value);
                if(scheduled_at_Date < NOW){
                    scheduled_el.classList.add("error");
                    is_valid = false;
                }else{
                    scheduled_el.classList.remove("error");
                }
            }
            return is_valid;
        };

        ProductManager.prototype.validateName = function(){
            let name = document.querySelector('#name');
            let display_name = document.querySelector('#display-name');
            // if(!name || !display_name || !name.value.lenght || !display_name.value.length){
            //     console.log("name & display name errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateGender = function(){
            let gender = document.querySelector('#gender');
            // if(!gender  || !gender.value.length){
            //     console.log("error errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateAvailability = function(){
            let availability = document.querySelector('#availability');
            // if(!availability  || !availability.value.length){
            //     console.log("availability errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateCategory = function(){
            let category = document.querySelector('#category');
            // if(!category  || !category.value.length){
            //     console.log("category errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateBrand = function(){
            let brand = document.querySelector('#brand');
            // if(!brand  || !brand.value.length){
            //     console.log("brand errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateProductType = function(){
            let product_type = document.querySelector('#product-type');
            // if(!product_type  || !product_type.value.length){
            //     console.log("product type errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validatePrices = function(){
            let price = document.querySelector('#price');
            // if(!price  || !price.value.length){
            //     console.log("price errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateVariants = function(){
            let variants = document.querySelector('#variants');
            // if(!variants  || !variants.value.length){
            //     console.log(" variants errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.validateDescriptions = function(){
            let description = document.querySelector('#description');
            // if(!description  || !description.value.length){
            //     console.log(" description errors");
            //     return false;
            // }
            return true;
        };

        ProductManager.prototype.onImagesChanged = function(){
            this.drag_area.classList.toggle('active', this.images && (this.images.length > 0));
        };

        ProductManager.prototype.validateImages = function(){
            let images = this.imageManager.getDroppedFiles();
            if(!images  || !images.length){
                console.log(" images errors");
                return false;
            }
            return true;
        };

        ProductManager.prototype.onUploadResponse = function(data){
            
            if(!data.success){
                console.log("responseData : ", data);
                console.warn(data.errors);
                for(const [k,v] of Object.entries(data.errors)){
                    if(k == "__all__"){
                        let __all__ = document.getElementById(k);
                        __all__.classList.remove("hidden");
                        let items = [];
                        v.forEach((e)=>{
                            items.push(tag_api.create_tag({
                                element: "li",
                                options:{
                                    innerText: e
                                }
                            }));
                        });
                        let ul = tag_api.create_tag({
                            element: "ul",
                            options:{
                                cls:"errorlist",
                                children: items
                            }
                        });
                        __all__.appendChild(ul);
                        
                    }else{
                        document.querySelector("." + k).classList.add("error");
                    }
                }
                return;
            }
            this.created_product_link.href = data.url;
            this.created_product_link.innerText = data.name;
            this.created_product_container.style.display = 'flex';
            if(!this.is_update_form()){
                this.clear();
            }
        };

        ProductManager.prototype.onPropertiesFetch = function(url, callback){
            let self = this;
            let csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]');
            let formData = new FormData();
            formData.append('csrfmiddlewaretoken', csrfmiddlewaretoken.value);
            let options = {
                url : url,
                type: 'POST',
                dataType : 'json',
                data : formData,
                processData : false,
                cache : false,
                contentType : false
            };
            ajax_api.ajax(options).then(function(response){
                let msg = {
                    content : response.message,
                    level : response.success
                }
                notify(msg);
                callback(response);

            }, function(reason){
                console.error("Error on category fetch.");
                console.error(reason);
            });
        }

        ProductManager.prototype.upload = function(){
            let self = this;
            let form_is_valid = this.validate();
            if(!form_is_valid){
                console.log("Product form is invalid");
                return;
            }
            let url = this.is_update_form() ? '/api/update-product/' + this.form.dataset.product + '/' : '/api/create-product/';
            
            let options = {
                url : url,
                type: 'POST',
                enctype : 'multipart/form-data',
                data : this.formData,
                dataType : 'json',
                processData : false,
                cache : false,
                contentType : false
            };
            ajax_api.ajax(options).then(function(response){
                let msg = {
                    content : response.message,
                    level : response.success
                }
                notify(msg);
                self.onUploadResponse(response);
                
                

            }, function(reason){
                console.error("Files could not be uploaded.");
                console.error(reason);
            });
        };

        return ProductManager;

    })();

    let OfflineManager = (function (){
        function OfflineManager(){
            this.attrs_inputs = [];
            this.total_form = 0;
            this.input_max_length = 32;
            this.replace_pattern = /\d+/g;
            this.form_TOTAL_FORMS = 0;
            this.form_INITIAL_FORMS = 0;
            this.form_MIN_NUM_FORMS = 0;
            this.form_MAX_NUM_FORMS = 0;
            this.form = null;
        }
        //this.form = $('#form-attrs-management');
        
        OfflineManager.prototype.init = function(){
        let self = this;
        this.form = document.getElementById("offline-order-form");
        if(! this.form){
            return;
        }
        let total = document.getElementById('total');
        let amount = document.getElementById('amount');
        let solded_price = document.getElementById('solded_price');
        let shipping_price = document.getElementById('shipping_price');
        $('#amount,#solded_price,#shipping_price').on('keyup change', function(event){
            try {
                total.value = parseFloat(amount.value) + parseFloat(solded_price.value) + parseFloat(shipping_price.value);
                total.classList.remove('error');
            } catch (error) {
                total.value = 0;
                total.classList.add('error');
            }
        });

        this.form.addEventListener("submit",function(event){
            event.stopPropagation();
            event.preventDefault();
            let formData = self.prepareFormData();
            if(formData != null){
                self.create_order(formData);
            }
        });
        console.log("OfflineOrderManaher installed");
    };
    
    OfflineManager.prototype.prepareFormData = function(){
        let that = this;
        let variant_inputs = document.querySelectorAll('input.js-offline-item');
        variant_inputs = Array.from(variant_inputs).filter(input => input.value != "");
        
        let formData = new FormData(this.form);
        let form_prefix;
        let total_price = 0;
        let total_form = 0;
        if(variant_inputs.length == 0){
            notify({'level':'warning', 'content': "No Product added for this order"});
            return formData;
        }
        variant_inputs.forEach(function(input,index, parent){
            form_prefix = `form-${total_form}-`;
            total_price = input.value * input.dataset.price;
            formData.append(form_prefix+"product",input.dataset.product);
            formData.append(form_prefix+"quantity",input.value);
            formData.append(form_prefix+"available_quantity",input.dataset.available_quantity);
            formData.append(form_prefix+"price",input.dataset.price);
            formData.append(form_prefix+"promotion_price",input.dataset.promotion_price);
            formData.append(form_prefix+"total_price", parseInt(input.value) * parseInt(input.dataset.price));
            total_form++;
        });
        formData.append("form-TOTAL_FORMS", total_form);
        formData.append("form-INITIAL_FORMS", total_form);
        formData.append("form-MIN_NUM_FORMS", total_form);
        formData.append("form-MAX_NUM_FORMS", total_form);

        return formData;
    };

    OfflineManager.prototype.clear = function(){
        this.total_form = 0;
        let variant_inputs = document.querySelectorAll("input.js-offline-item:not([value=''])");
        variant_inputs.forEach(function(input,index, parent){
            input.value = "";
        });
    };

    OfflineManager.prototype.create_order = function(formData){
        let self = this;
        let options = {
            url : "/api/create-offline-order/",
            type: 'POST',
            enctype : 'multipart/form-data',
            data : formData,
            dataType : 'json',
            processData : false,
            cache : false,
            contentType : false
        };
        ajax_api.ajax(options).then(function(response){
            let msg = {
                content : response.message,
                level : response.created
            }
            notify(msg);
            let link = document.querySelector("a#order-link");
            link.href = response.url;
            link.classList.toggle('hidden');
            self.clear();

        }, function(reason){
            console.error("Files could not be uploaded.");
            console.error(reason);
            notify({level:"error", content: reason.message});
        });
    };

    OfflineManager.prototype.incremente_management_form = function(){
        this.total_form = this.total_form + 1;
        this.form_TOTAL_FORMS = this.total_form;
        this.form_MIN_NUM_FORMS  = this.total_form;
        this.form_MAX_NUM_FORMS = this.total_form;
    };

    OfflineManager.prototype.decremente_management_form = function(){
        this.total_form = this.total_form - 1;
        this.form_TOTAL_FORMS = this.total_form;
        this.form_MIN_NUM_FORMS  = this.total_form;
        this.form_MAX_NUM_FORMS = this.total_form;
    };

    return OfflineManager;
})();

    let FileUpload = (function(){
        function FileUpload(){
            this.files = [];
            this.form = undefined;
            this.formData = undefined;
            this.clean = true;
            this.drag_area = $('.drag-area');
            this.file_list_container = $('.file-list');
            this.file_entries = {};
            this.empty_element = $('.no-data', this.file_list_container);
            this.send_btn = $('.js-send-file-upload-btn');
            this.clear_btn = $('.js-file-list-clear-btn');
            //this.init();
        };

        FileUpload.prototype.init = function(){
            let that = this;
            this.clear_btn.on('click', this.clear.bind(this));

            $('.drag-area')
                .on('drop', onDropHandler)
                .on('dragover', onDragOverHandler)
                .on('dragenter', onDragStartHandler)
                .on('dragleave', onDragEndHandler)
        };

        FileUpload.prototype.clear = function() {
            this.files = [];
            this.formData = undefined;
            this.form = undefined;
            this.clean = true;
            //$('.file-entry', this.file_list_container).remove();
            this.file_list_container.empty().append(this.empty_element);
            this.drag_area.removeClass('non-empty');
            this.send_btn.addClass('disabled').prop('disabled',true);
            this.clear_btn.addClass('hidden');
        };

        FileUpload.prototype.isClean = function() {
            return this.clean;
        };

        FileUpload.prototype.setForm = function(form){
            this.form = form;
            this.clean = false;
            return this;
        };

        FileUpload.prototype.setFiles = function(files){
            this.files = files;
            this.clean = false;
            return this;
        };

        FileUpload.prototype.addFile = function(file){
            if(this.files.some(f => f.name == file.name)){
                console.warn("A file with the same name already exists.")
                return this;
            }
            let that = this;
            this.files.push(file);
            let li = $('<li />',{
                id:"file-" + that.files.length,
                'class' : 'file-entry',
                'title': file.name,
            });
            let entry_text = $('<span />', {
                text: file.name
            });
            let entry_remove_btn = $('<button />', {
                class: 'mat-button mat-button-text',
                type: 'button'
            }).append($('<i />', {
                class: 'fas fa-times icon'
            }));
            entry_remove_btn.on('click', function(event){
                event.preventDefault();
                event.stopPropagation();
                that.removeFile([file.name]);
                li.remove();
            });
            li.append(entry_text, entry_remove_btn).appendTo(that.file_list_container);
            $('.no-data', that.file_list_container).remove();
            this.drag_area.addClass('non-empty');
            this.send_btn.removeClass('disabled').prop('disabled',false);
            this.clear_btn.removeClass('hidden');
            this.clean = false;
            return this;
        };

        FileUpload.prototype.removeFile = function(fileNames){
            let old_length = this.files.length;
            this.files = this.files.filter(f => !fileNames.includes(f.name));
            if(this.files.length != old_length && this.files.length < old_length){

                if(this.files.length == 0){
                    this.file_list_container.append(this.empty_element);
                    this.drag_area.removeClass('non-empty');
                    this.send_btn.addClass('disabled').prop('disabled',true);
                    this.clear_btn.addClass('hidden');
                }
                this.clean = false;
            }else{
                console.log("files : %s not removed", fileNames);
                
            }
            
            return this;
        };
        FileUpload.prototype.update = function(){
            if(this.isClean()){
                console.warn("FileUpload can not be updated. formData is already clean.");
                return;
            }
            if(!this.form || !this.files || this.files.length == 0){
                console.warn("FileUpload can not be updated. form or files are missing.");
                return;
            }
            this.formData = new FormData(this.form);
            let that = this;
            this.files.forEach(function(file, index){
                that.formData.append("file_" + index, file, file.name);
            });
            this.clean = true;
            /*
            $(form).serializeArray().forEach(function(input, index){
                formData.append(input.name, input.value);
            });
            */
        };

        FileUpload.prototype.canSend = function(){
            let formValid = typeof this.form != 'undefined';
            let filesValid = typeof this.files != 'undefined';

            return formValid && filesValid && this.files.length > 0;
        };

        FileUpload.prototype.getForm = function() {
            return this.form;
        };

        FileUpload.prototype.getFiles = function() {
            return this.files;
        }

        FileUpload.prototype.getFormDate = function() {
            return this.formData;
        }

        FileUpload.prototype.upload = function(){
            if(!this.canSend()){
                console.error("Files can not be sent. Please check your files form. Files or form are missing.");
                return;
            }
            if(typeof ajax_api.ajax === 'undefined'){
                let errorMsg = "can not upload files. ajax funtion is not defined";
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
            let that = this;
            let options = {
                url : $(this.form).attr('action'),
                type: 'POST',
                enctype : 'multipart/form-data',
                data : this.formData,
                processData : false,
                cache : false,
                contentType : false
            };
            ajax_api.ajax(options).then(function(response){
                let msg = {
                    content : response.message,
                    level : response.status === 'OK'
                }
                notify(msg);
                fileUpload.clear();
                

            }, function(reason){
                console.error("Files could not be uploaded.");
                console.error(reason);
                fileUpload.clear();
            });

        };

        return FileUpload;
    })();

    


    function regroupe_attrs(attribute_list){
        let keySet = new Set();
        let attrs_map = {};
        attribute_list.forEach((o)=>{
            keySet.add(o.name);
        });
        keySet.forEach((name)=>{
            attrs_map[name] = attribute_list.filter(o => o.name == name).sort((first, second) =>{
                if (first.value < second.value) {
                    return -1
                }
                if(first.value > second.value){
                    return 1;
                }
                return 0;
            });
        });
        return attrs_map;
    }

    function update_attrs(attrs_mapping){
        let attributes_container = document.querySelector('#attributes-container');
        while(attributes_container.firstChild){
            attributes_container.removeChild(attributes_container.firstChild);
        }
        let i = 0;
        for(const [key,value] of Object.entries(attrs_mapping)){
            let div = document.createElement('div');
            let span = document.createElement('span');
            let tmp_span = document.createElement('span');
            let ul;
            let label = document.createElement('label');
            let tmp_label;
            let tmp_input;
            let select = document.createElement('select');
            let opt = document.createElement('option');
            let li = document.createElement('li');
            let li_tags = [];
            tmp_span.innerText = `Select a ${key}`;
            opt.innerText = `Select a ${key}`;
            li.appendChild(tmp_span);
            li_tags.push(li);
            //ul.appendChild(li);
            select.appendChild(opt);
            value.forEach((o)=>{
                li = document.createElement('li');
                tmp_label = tag_api.create_tag({'element': 'label','options':{
                    'htmlFor': 'attributes-' + i + "-" + o.id,
                    'innerText': o.value
                }});
                tmp_input = tag_api.create_tag({'element': 'input', 'options': {
                    'type': 'checkbox',
                    'name': 'attributes',
                    'value': o.id,
                    'id': 'attributes-' + i + "-" + o.id
                }});
                tmp_span = tag_api.create_tag({'element': 'span','options':{
                    'cls': 'padding',
                    'children': [tmp_input, tmp_label]
                }});
                li = tag_api.create_tag({'element': 'li','options':{
                    'children': [tmp_span]
                }});
                li_tags.push(tag_api.create_tag({'element': 'li','options':{
                    'children': [tmp_span]
                }}));
                //ul.appendChild(li);
                //opt = document.createElement('option');
                //opt.value = o.id;
                //opt.innerText = o.value;
                //select.appendChild(opt);
            });
            //select.name = 'attributes';
            //select.id = select.name + "-" + i;
            //select.multiple = true;
            //label.htmlFor = select.id;
            //label.innerText = key.toUpperCase();
            i++;
            ul = tag_api.create_tag({'element': 'ul', 'options':{
                'cls': 'attr-list',
                'children': li_tags
            }});
            div.appendChild(label);
            div.appendChild(ul);
            //div.appendChild(select);
            div.classList.add('attr-list-container');
            attributes_container.appendChild(div);
            
        }

    }

    function update_attrs_from_type(){
        let input = document.querySelector('input.product-type-input:checked');
        let option = {
            type:'GET',
            method: 'GET',
            dataType: 'json',
            url : '/api/attrs-from-type/' + input.dataset.typeUuid + '/'
        }
        ajax_api.ajax(option).then(function(response){
            let attributes = response.attributes;
            let attrs_mapping = regroupe_attrs(attributes);
            update_attrs(attrs_mapping);
        }, function(reason){
            console.error(reason);
        });
    }

    function input_check_max_limit(input){
        let $input = $(input);
        let limit = input.dataset['max-length']
        //let max_len = parseInt($input.data('max-length'));
        //let len = $input.val().length;
        let char_counter = document.getElementById(input.dataset.target);
        let target = $($input.data('target'));
        let max_len_reached = input.value.length > limit;
        input.classList.toggle('warning', max_len_reached);
        char_counter.classList.toggle('danger', max_len_reached);
        char_counter.innerText = input.value.length;
        //$input.toggleClass("warning", max_len_reached);
        //target.toggleClass("danger", max_len_reached).text(len);
    }


    $(document).ready(function(){
        fileUpload = new FileUpload();
        campaignManager = new CampaignManager();
        mailcampaignManager = new MailCampaignManager();
        productManager = new ProductManager();
        highlightManager = new HighlightManager();
        offlineOrderManager = new OfflineManager();
        offlineOrderManager.init();
        productManager.init();
        campaignManager.init();
        mailcampaignManager.init();
        highlightManager.init();

        $('#file-upload-form').on('submit', function(event){
            event.preventDefault();
            event.stopPropagation();
            fileUpload.setForm(this);
            fileUpload.update();
            fileUpload.upload();
            //return false;
        });
        
    });

});