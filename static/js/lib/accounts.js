define(['ajax_api','exports'], function(ajax_api, exports) {
    'use strict';
    let user = {};
    
    let user_available = false;
    let query_delay = 800;
    let scheduled_query = false;
    let $user_search_result = undefined;
    let $user_search_target = undefined;
    let user_search_target = undefined;
    let $user_search_target_name = undefined;
    let callback;
    let query = "";
    let seller;
    let subscription_seller;
    let subscription_title;
    let csrfmiddlewaretoken;
    let options = {
        url:'/api/current-user/',
        type: 'GET',
        data : {},
        dataType: 'json'
    };
    let search_options = {
        url:'/api/user-search/',
        type: 'GET',
        data : {'search': query},
        dataType: 'json'
    };

    let subscription_options = {
        url:'/api/sellers/subscription/',
        type: 'POST',
        data : {'seller': seller, 'csrfmiddlewaretoken': ""},
        dataType: 'json'
    }

    function activate_editable_inputs(context){
        let $editable_inputs = $('input.js-editable', context);
        $editable_inputs.addClass('editable').prop('disabled', false);
    
    }
    
    function deactivate_editable_inputs(context){
        let $editable_inputs = $('input.js-editable', context);
        $editable_inputs.removeClass('editable').prop('disabled', true);;
    }


    function userSearch(options){

        ajax_api.ajax(options).then(function(response){
            $user_search_result.empty();
            response.forEach(function(user, index){
                let full_name = user.first_name + " " +  user.last_name;
                $('<li>').data('user-id', user.id).data('user-name', full_name).html(full_name + " [" + user.username + "]").
                on('click', function(event){
                    event.stopPropagation();
                    let user_id = $(this).data('user-id');
                    let user_name = $(this).data('user-name');
                    //$user_search_target.val(user_id);
                    user_search_target.value = user_id;
                    user_search_target.dispatchEvent(new Event('change', {'bubbles':true}));
                    //$(".js-user-search").val(user_name);
                    $user_search_target_name.val(user_name);
                    $user_search_result.hide();
                    $user_search_result.empty();
                }).appendTo($user_search_result);
                $user_search_result.show();
            });
    
        }, function(error){
            console.log(error);
        });
    }

    function seller_subscription_fetch(){

        seller = document.querySelector('#seller');
        subscription_title = document.querySelector('#subscription_title');
        csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]');
        let subscription = document.querySelector('#subscription');
        if(!seller || !seller.value || subscription == null){
            return;
        }
        subscription_options.data.seller = seller.value;
        subscription_options.data.csrfmiddlewaretoken = csrfmiddlewaretoken.value;
        ajax_api.ajax(subscription_options).then(function(response){
            if(!response.succeed){
                return;
            }
            subscription.value = response.subscription;
            subscription.checked = true;
            let subscription_label = document.querySelector('#subscription-label');
            subscription_label.innerHTML = response.name;
            subscription_title.value = response.name;
        }, function(error){
            console.log(error);
        });
    }

    function init(){
        $user_search_result = $('#user-search-result');
        $user_search_target = $($user_search_result.data('target'));
        user_search_target = document.querySelector($user_search_result.data('target'));
        $user_search_target_name = $($user_search_result.data('target-name'));
        subscription_seller = document.querySelector('.js-subscription-seller');
        let $editable_inputs = $('input.js-editable');
        $editable_inputs.removeClass('editable').prop('disabled', true);;
        $('#form-controls').hide();
        $('.js-edit-form').on('click', function(event){
            let ctx = $($(this).data('target'));
            $(this).addClass('disabled');
            activate_editable_inputs(ctx);
            $('#form-controls').show();
        });
    
        $('.js-form-edit-cancel').on('click', function(event){
            event.preventDefault();
            let ctx = $($(this).data('target'));
            let hide_el = $($(this).data('hide'));
            hide_el.hide();
            $('.js-edit-form').removeClass('disabled');
            deactivate_editable_inputs(ctx);
        });
        
        if(subscription_seller){
            subscription_seller.addEventListener('change', seller_subscription_fetch);
        }
        
        $('.js-user-search').on('keyup', function(event){
            event.stopPropagation();
            query = $(this).val().trim();
            if(query.length == 0 ){
                return;
            }
            search_options.data.search = query
            if(scheduled_query){
                clearTimeout(scheduled_query);
            }
            scheduled_query = setTimeout(userSearch, query_delay, search_options);
        });
        
    }

    function get_user(){
        return user;
    }

    function get_username(){
            
        return user_available ?  user.username : "";
    }

    function get_last_login(){
        return user_available ?  user.last_login : "";
    }
    return {
        init : init,
        set_callback : function (func) {
            callback = func;
        },
        get_user : get_user,
        get_username : get_username,
        get_last_login : get_last_login,

        get_user_id : function(){
            return user_available ?  user.user_id : -1;
        },
        is_initialised : function(){
            return user_available;
        }
    }
    
});

