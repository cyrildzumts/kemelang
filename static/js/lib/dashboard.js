define(['ajax_api'], function(ajax_api) {
    'use strict';
    var csrfmiddlewaretoken = undefined;
    var clear_sessions_option = {
        type:'POST',
        method: 'POST',
        dataType: 'json',
        url : '/api/clear-sessions/',
        data : {}
    };
    function clear_sessions(){
        clear_sessions_option.data = {'csrfmiddlewaretoken': csrfmiddlewaretoken.value};
        ajax_api.ajax(clear_sessions_option).then(
            function(response){
                var sessions_warning = document.querySelector('#session-warning');
                if(response.cleared){
                    var sessions_list = document.querySelector('#session-list');
                    sessions_warning.classList.remove('hidden');
                    if(sessions_list){
                        while(sessions_list.firstChild){
                            sessions_list.removeChild(sessions_list.firstChild);
                        }
                    }
                }else{
                    sessions_warning.classList.remove('hidden');
                }
            },
            function(error) {
                
            }
        );
    }

    function attach_click_event(){
        var session_clear_btn = document.querySelector('.js-clear-session-btn');
        if(session_clear_btn){
            console.log("attached click event for clear sessions");
            session_clear_btn.addEventListener('click', clear_sessions);
        }else{
            console.log("could not attached click event for clear sessions");
        }
    }
    var Group = (function(){
        function Group(){
            this.selected_permissions = {};
            this.group_users = {};
            this.add_selected_permissions_btn = {};
            this.add_selected_users_btn = {};
            this.remove_selected_permissions_btn = {};
            this.remove_selected_users_btn = {};
            
        };

        Group.prototype.init = function(){
            $('#add-selected-users').on('click', function(event){
                event.preventDefault();
                var $target = $($(this).data('target'));
                var $source = $($(this).data('source'));
                $('option:selected', $source).appendTo($target);
                $('option', $target).prop('selected', true).addClass('selected');

            });

            $('#add-selected-permissions').on('click', function(){
                var $target = $($(this).data('target'));
                var $source = $($(this).data('source'));
                $('option:selected', $source).appendTo($target);
                $('option', $target).prop('selected', true);

            });

            $('#remove-selected-users').on('click', function(){
                var $target = $($(this).data('target'));
                var $source = $($(this).data('source'));
                $('option:selected', $source).appendTo($target);
                $('option', $target).prop('selected', true).addClass('selected');

            });

            $('#remove-selected-permissions').on('click', function(){
                var $target = $($(this).data('target'));
                var $source = $($(this).data('source'));
                $('option:selected', $source).appendTo($target);
                $('option', $target).prop('selected', true).addClass('selected');

            });
        };
        return Group;
    })();


    var PermissionGroupManager = (function(){
        function PermissionGroupManager(){
            this.selected_permissions = {};
            this.group_users = {};
            this.add_selected_permissions_btn = {};
            this.add_selected_users_btn = {};
            this.remove_selected_permissions_btn = {};
            this.remove_selected_users_btn = {};
            
        };

        PermissionGroupManager.prototype.init = function(){
            /*
            $('#available-permission-list').on('click','li', function(event){
                event.preventDefault();
                var $target = $('#permission-list');
                var self = $(this);
                var $selected_permissions = $('#selected-permission-list');
                $selected_permissions.append($('<option/>', {'value': self.data('value'), 'selected': true, 'text': self.text()}));
                self.appendTo($target);
            });

            $('#permission-list').on('click','li', function(event){
                event.preventDefault();
                var $target = $('#available-permission-list');
                var self = $(this);
                $('#selected-permission-list option').filter(function(){
                    return this.value == self.data('value');
                }).remove();
                self.removeClass('active').appendTo($target);
            });


            $('#available-user-list').on('click','li', function(event){
                event.preventDefault();
                var $target = $('#user-list');
                var self = $(this);
                var $selected_users = $('#selected-user-list');
                $selected_users.append($('<option/>', {'value': self.data('value'), 'selected': true, 'text': self.text()}));
                self.appendTo($target);
            });

            $('#user-list').on('click','li', function(event){
                event.preventDefault();
                var $target = $('#available-user-list');
                var self = $(this);
                $('#selected-user-list option').filter(function(){
                    return this.value == self.data('value');
                }).remove();
                self.removeClass('active').appendTo($target);
            });
            */

        };

        return PermissionGroupManager;
    })();


    var JSFilter = (function(){
        function JSFilter(){
            console.log("creating JSFilter instance");
            this.init();
            console.log("JSFilter instance created");
        };

        JSFilter.prototype.init = function(){
            console.log("JSFilter instance initializing");
            $('.js-jsfilter-input, .js-list-filter').on('keyup', function(event){
                event.stopPropagation();
                var value = this.value.trim().toLowerCase();
                var target_container = this.getAttribute('data-target');
                var el = this.getAttribute('data-element');
                $(target_container + " " +  el).filter(function(){
                    $(this).toggle(this.innerHTML.toLowerCase().includes(value));
                });
            });

            console.log("JSFilter instance initialized");
        };
        return JSFilter;
    })();

    $(document).ready(function(){
        var permissionManager = new PermissionGroupManager();
        var jsfilter = new JSFilter();
        var group = new Group();
        csrfmiddlewaretoken = document.querySelector('input[name="csrfmiddlewaretoken"]');
        permissionManager.init();
        jsfilter.init();
        group.init();
        attach_click_event();
        $('.js-user-selector').on('click', 'li', function(){
            let target = $(this);
            $('#members').append($('<option/>', {'value': target.data('id'), 'selected': true, 'text': target.text()}));
            target.appendTo('#selected-members');
        });
        $('#selected-members').on('click', 'li', function(){
            let target = $(this);
            target.appendTo('.js-user-selector');
            $('#members option').filter(function(){
                return this.value == target.data('id');
            }).remove();
        });    
    });
});