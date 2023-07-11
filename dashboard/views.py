from django.http import Http404
from django.shortcuts import render
from django.shortcuts import get_object_or_404, redirect
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import PermissionDenied, SuspiciousOperation, ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group, Permission
from django.contrib import messages
from django.db.models import Q, Count, F, TextField
from rest_framework.authtoken.models import Token
from accounts import constants as Account_Constants
from accounts.forms import AccountCreationForm, UserCreationForm
from accounts import account_services
from dashboard.forms import (AccountForm, GroupFormCreation, TokenForm)
from dashboard.models import Settings
from dashboard import dashboard_service, constants as DASHBOARD_CONSTANTS
from core import permissions as PERMISSIONS
from core.resources import ui_strings as CORE_UI_STRINGS
from core.tasks import send_mail_task
from dictionary import dictionary_service
from kemelang import settings, utils

import logging

logger = logging.getLogger(__name__)


# Create your views here.

@login_required
def dashboard(request):
    template_name = "dashboard/dashboard.html"
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_DASHBOARD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    page_title = "Dashboard"
    #settings_set = Settings.objects.all()[:utils.TOP_VIEWS_MAX]
    recent_users = User.objects.all().order_by('-date_joined')[:utils.MAX_RECENTS]
    context = {
            'name'          : username,
            'page_title'    : page_title,
            #'content_title' : UI_STRINGS.DASHBOARD_DASHBOARD_TITLE,
            'user_list': recent_users,
            'setting': dashboard_service.get_setting()
        }
    context.update(dashboard_service.create_resources_opened())
    logger.info(f"Authorized Access : User {username} has requested the Dashboard Page")

    return render(request, template_name, context)


@login_required
def create_settings (request):
    template_name = 'dashboard/create_settings.html'
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_DASHBOARD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    if request.method == 'POST':
        setting = dashboard_service.create_setting(utils.get_postdata(request))
        if setting:
            messages.success(request,_('New Setting created'))
            logger.info(f'[ OK ]New Setting  added by user {request.user.username}' )
            return redirect('dashboard:settings')
        else:
            messages.error(request,_('Error when creating new setting'))
            logger.error(f'[ NOT OK ] Error on adding New Setting by user {request.user.username}.' )

    page_title = _('New Setting')
    context = {
        'page_title': page_title,
        'content_title' : _('New Setting'),        
    }
    return render(request,template_name, context)


@login_required
def update_settings (request, setting_uuid):
    template_name = 'dashboard/update_settings.html'
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_DASHBOARD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    setting = get_object_or_404(Settings, setting_uuid=setting_uuid)
    if request.method == 'POST':
        setting = dashboard_service.update_setting(utils.get_postdata(request), setting)
        if setting:
            messages.success(request,_('Setting updated'))
            logger.info(f'[ OK ]Setting  updated by user {request.user.username}' )
            return redirect('dashboard:settings')
        else:
            messages.error(request,_('Error when updateing setting'))
            logger.error(f'[ NOT OK ] Error on updating Setting by user {request.user.username}.' )

    page_title = _('Update Setting')
    context = {
        'page_title': page_title,
        'content_title' : _('Update Setting'),      
        'setting'  : setting
    }
    return render(request,template_name, context)


@login_required
def dashboard_settings(request):
    template_name = "dashboard/settings.html"
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_DASHBOARD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    context = {
        'content_title' : "Settings"
    }

    page_title = _("Settings") + " - " + settings.SITE_NAME

    context['page_title'] = page_title
    context['setting'] = dashboard_service.get_setting()
    return render(request,template_name, context)




@login_required
def users(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.USER_VIEW_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = {}
    queryset = User.objects.order_by('-date_joined')
    template_name = "dashboard/user_list.html"
    page_title = _("Dashboard Users") + " - " + settings.SITE_NAME
    page = request.GET.get('page', 1)
    paginator = Paginator(queryset, utils.PAGINATED_BY)
    try:
        list_set = paginator.page(page)
    except PageNotAnInteger:
        list_set = paginator.page(1)
    except EmptyPage:
        list_set = None
    context['page_title'] = page_title
    context['users'] = list_set
    context['content_title'] = CORE_UI_STRINGS.LABEL_USERS_PLURAL
    return render(request,template_name, context)




@login_required
def user_details(request, pk=None):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.USER_VIEW_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    
    context = {}

    user = get_object_or_404(User, pk=pk)
    template_name = "dashboard/user_detail.html"
    page_title = "User Details - " + settings.SITE_NAME
    context['page_title'] = page_title
    context['user_instance'] = user
    context['ACCOUNT_TYPE'] = Account_Constants.ACCOUNT_TYPE
    context['content_title'] = f"{CORE_UI_STRINGS.LABEL_USER} - {user.get_full_name()}"
    return render(request,template_name, context)


@login_required
def users_delete(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.USER_DELETE_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    

    if request.method != "POST":
        raise SuspiciousOperation('Bad request. Expected POST request but received a GET')
    
    postdata = utils.get_postdata(request)
    id_list = postdata.getlist('users')

    if len(id_list):
        user_list = list(map(int, id_list))
        User.objects.filter(id__in=user_list).delete()
        messages.success(request, f"Users \"{id_list}\" deleted")
        logger.info(f"Users \"{id_list}\" deleted by user {username}")
        
    else:
        messages.error(request, f"Users \"\" could not be deleted")
        logger.error(f"ID list invalid. Error : {id_list}")
    return redirect('dashboard:users')

@login_required
def user_delete(request, pk=None):
    username = request.user.username
    if request.user.has_perm(PERMISSIONS.USER_DELETE_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    
    try:
        user = User.objects.get(pk=pk)
        User.objects.filter(id=pk).delete()
        messages.success(request, f"Users \"{pk}\" deleted")
        logger.info(f"Users \"{user.username}\" deleted by user {username}")
    except ObjectDoesNotExist:
        messages.warning(request, f"Users \"{pk}\" not deleted. User could not be found")
        logger.warn(f"User \"{pk}\" could not be found. User not deleted. Action request by {username}")
    return redirect('dashboard:users')



@login_required
def groups(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.GROUP_VIEW_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = {}
    group_list = Group.objects.extra(select={'iname':'lower(name)'}).order_by('iname')
    template_name = "dashboard/group_list.html"
    page_title = "Groups" + " - " + settings.SITE_NAME
    page = request.GET.get('page', 1)
    paginator = Paginator(group_list, utils.PAGINATED_BY)
    try:
        group_set = paginator.page(page)
    except PageNotAnInteger:
        group_set = paginator.page(1)
    except EmptyPage:
        group_set = None
    context['page_title'] = page_title
    context['groups'] = group_set
    context['content_title'] = CORE_UI_STRINGS.DASHBOARD_GROUPS_TITLE
    context.update(DASHBOARD_CONSTANTS.DASHBOARD_GROUP_CONTEXT)
    return render(request,template_name, context)

@login_required
def group_detail(request, pk=None):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.GROUP_VIEW_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = {}
    group = get_object_or_404(Group, pk=pk)
    template_name = "dashboard/group_detail.html"
    page_title = "Group Detail" + " - " + settings.SITE_NAME
    context['page_title'] = page_title
    context['group'] = group
    context['content_title'] = CORE_UI_STRINGS.DASHBOARD_GROUP_TITLE
    context.update(DASHBOARD_CONSTANTS.DASHBOARD_GROUP_CONTEXT)
    return render(request,template_name, context)


@login_required
def group_update(request, pk=None):
    
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.GROUP_CHANGE_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = None
    page_title = 'Group Update'
    template_name = 'dashboard/group_update.html'
    group = get_object_or_404(Group, pk=pk)
    form = GroupFormCreation(instance=group)
    group_users = group.user_set.all()
    available_users = User.objects.exclude(pk__in=group_users.values_list('pk'))
    permissions = group.permissions.all()
    available_permissions = Permission.objects.exclude(pk__in=permissions.values_list('pk'))
    if request.method == 'POST':
        form = GroupFormCreation(request.POST, instance=group)
        users = request.POST.getlist('users')
        if form.is_valid() :
            logger.debug("Group form for update is valid")
            if form.has_changed():
                logger.debug("Group has changed")
            group = form.save()
            if users:
                logger.debug("adding %s users [%s] into the group", len(users), users)
                group.user_set.set(users)
            logger.debug("Saved users into the group %s",users)
            return redirect('dashboard:groups')
        else :
            logger.error("Error on editing the group. The form is invalid")
    
    context = {
            'page_title' : page_title,
            'form': form,
            'group': group,
            'users' : group_users,
            'available_users' : available_users,
            'permissions': permissions,
            'available_permissions' : available_permissions,
            'content_title' : CORE_UI_STRINGS.DASHBOARD_GROUP_UPDATE_TITLE
    }
    context.update(DASHBOARD_CONSTANTS.DASHBOARD_GROUP_CONTEXT)
    return render(request, template_name, context)


@login_required
def group_create(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.GROUP_ADD_PERM):
        logger.warning("PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = None
    page_title = 'Group Creation'
    template_name = 'dashboard/group_create.html'
    available_permissions = Permission.objects.all()
    available_users = User.objects.all()
    form = GroupFormCreation()
    if request.method == 'POST':
        form = GroupFormCreation(request.POST)
        users = request.POST.getlist('users')
        if form.is_valid():
            logger.debug("Group Create : Form is Valid")
            group_name = form.cleaned_data.get('name', None)
            logger.debug('Creating a Group with the name {}'.format(group_name))
            if not Group.objects.filter(name=group_name).exists():
                group = form.save()
                messages.success(request, "The Group has been succesfully created")
                if users:
                    group.user_set.set(users)
                    logger.debug("Added users into the group %s",users)
                else :
                    logger.debug("Group %s created without users", group_name)

                return redirect('dashboard:groups')
            else:
                msg = "A Group with the given name {} already exists".format(group_name)
                messages.error(request, msg)
                logger.error(msg)
            
        else :
            messages.error(request, "The Group could not be created. Please correct the form")
            logger.error("Error on creating new Group Errors : %s", form.errors)
    
    context = {
            'page_title' : page_title,
            'form': form,
            'available_users' : available_users,
            'available_permissions': available_permissions,
            'content_title' : CORE_UI_STRINGS.DASHBOARD_GROUP_CREATE_TITLE
    }
    context.update(DASHBOARD_CONSTANTS.DASHBOARD_GROUP_CONTEXT)
    return render(request, template_name, context)


@login_required
def group_delete(request, pk=None):
    username = request.user.usernam
    if not request.user.has_perm(PERMISSIONS.GROUP_DELETE_PERM):
        logger.warning("PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    try:
        group = Group.objects.get(pk=pk)
        name = group.name
        messages.add_message(request, messages.SUCCESS, 'Group {} has been deleted'.format(name))
        group.delete()
        logger.debug("Group {} deleted by User {}", name, request.user.username)
        
    except Group.DoesNotExist:
        messages.add_message(request, messages.ERROR, 'Group could not be found. Group not deleted')
        logger.error("Group Delete : Group not found. Action requested by User {}",request.user.username)
        
    return redirect('dashboard:groups')


@login_required
def groups_delete(request):
    username = request.user.username

    if not request.user.has_perm(PERMISSIONS.GROUP_DELETE_PERM):
        logger.warning("PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    if request.method != "POST":
        raise SuspiciousOperation('Bad request. Expected POST request but received a GET')
    
    postdata = utils.get_postdata(request)
    id_list = postdata.getlist('groups')

    if len(id_list):
        instance_list = list(map(int, id_list))
        Group.objects.filter(id__in=instance_list).delete()
        messages.success(request, f"Groups \"{instance_list}\" deleted")
        logger.info(f"Groups \"{instance_list}\" deleted by user {username}")
        
    else:
        messages.error(request, f"Groups could not be deleted")
        logger.error(f"ID list invalid. Error : {id_list}")
    return redirect('dashboard:groups')


#######################################################
########            Permissions 

@login_required
def permissions(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.PERMISSION_VIEW_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied


    context = {}
    permission_list = Permission.objects.all()
    template_name = "dashboard/permission_list.html"
    page_title = "Permissions" + " - " + settings.SITE_NAME
    page = request.GET.get('page', 1)
    paginator = Paginator(permission_list, utils.PAGINATED_BY)
    try:
        permission_set = paginator.page(page)
    except PageNotAnInteger:
        permission_set = paginator.page(1)
    except EmptyPage:
        permission_set = None
    context['page_title'] = page_title
    context['permissions'] = permission_set

    return render(request,template_name, context)

@login_required
def permission_detail(request, pk=None):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.PERMISSION_VIEW_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = {}
    permission = get_object_or_404(Permission, pk=pk)
    template_name = "dashboard/permission_detail.html"
    page_title = "Permission Detail" + " - " + settings.SITE_NAME
    context['page_title'] = page_title
    context['permission'] = permission

    return render(request,template_name, context)


@login_required
def permission_update(request, pk=None):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.PERMISSION_CHANGE_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = None
    page_title = 'Permission Update'
    template_name = 'dashboard/permission_update.html'
    permission = get_object_or_404(Permission, pk=pk)
    form = GroupFormCreation(instance=permission)
    permission_users = permission.user_set.all()
    available_users = User.objects.exclude(pk__in=permission_users.values_list('pk'))

    if request.method == 'POST':
        form = GroupFormCreation(request.POST, instance=permission)
        users = request.POST.getlist('users')
        if form.is_valid() :
            logger.debug("Permission form for update is valid")
            if form.has_changed():
                logger.debug("Permission has changed")
            permission = form.save()
            if users:
                logger.debug("adding %s users [%s] into the permission", len(users), users)
                permission.user_set.set(users)
            logger.debug("Added permissions to users %s",users)
            return redirect('dashboard:permissions')
        else :
            logger.error("Error on editing the perssion. The form is invalid")
    
    context = {
            'page_title' : page_title,
            'form': form,
            'users' : permission_users,
            'available_users' : available_users,
            'permission': permission
    }

    return render(request, template_name, context)


@login_required
def permission_create(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.PERMISSION_ADD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    context = None
    page_title = 'Permission Creation'
    template_name = 'dashboard/permission_create.html'
    available_groups = Group.objects.all()
    available_users = User.objects.all()
    form = GroupFormCreation()
    if request.method == 'POST':
        form = GroupFormCreation(request.POST)
        users = request.POST.getlist('users')
        if form.is_valid():
            logger.debug("Permission Create : Form is Valid")
            perm_name = form.cleaned_data.get('name', None)
            perm_codename = form.cleaned_data.get('codename', None)
            logger.debug('Creating a Permission with the name {}'.format(perm_name))
            if not Permission.objects.filter(Q(name=perm_name) | Q(codename=perm_codename)).exists():
                perm = form.save()
                messages.add_message(request, messages.SUCCESS, "The Permission has been succesfully created")
                if users:
                    perm.user_set.set(users)
                    logger.debug("Permission %s given to users  %s",perm_name, users)
                else :
                    logger.debug("Permission %s created without users", perm_name)

                return redirect('dashboard:permissions')
            else:
                msg = "A Permission with the given name {} already exists".format(perm_name)
                messages.add_message(request, messages.ERROR, msg)
                logger.error(msg)
            
        else :
            messages.add_message(request, messages.ERROR, "The Permission could not be created. Please correct the form")
            logger.error("Error on creating new Permission : %s", form.errors)
    
    context = {
            'page_title' : page_title,
            'form': form,
            'available_users' : available_users,
            'available_groups': available_groups
    }

    return render(request, template_name, context)


@login_required
def permission_delete(request, pk=None):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.PERMISSION_DELETE_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    try:
        perm = Permission.objects.get(pk=pk)
        name = perm.name
        messages.add_message(request, messages.SUCCESS, 'Permission {} has been deleted'.format(name))
        perm.delete()
        logger.debug("Permission {} deleted by User {}", name, request.user.username)
        
    except Permission.DoesNotExist:
        messages.add_message(request, messages.ERROR, 'Permission could not be found. Permission not deleted')
        logger.error("Permission Delete : Permission not found. Action requested by User {}",request.user.username)
        raise Http404('Permission does not exist')
        
    return redirect('dashboard:permissions')


@login_required
def create_account(request):
    username = request.user.username
    context = {
        'page_title':_('New User') + ' - ' + settings.SITE_NAME,
        'ACCOUNT_TYPE' : Account_Constants.ACCOUNT_TYPE,
    }
    template_name = 'dashboard/new_user.html'
    if not request.user.has_perm(PERMISSIONS.USER_ADD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied

    if request.method == 'POST':
        name = request.POST['username']
        result =account_services.AccountService.process_registration_request(request)
        if result['user_created']:
            messages.success(request, _(f"User {name} created"))
            return redirect('dashboard:users')
        else:
            user_form = UserCreationForm(request.POST)
            account_form = AccountCreationForm(request.POST)
            user_form.is_valid()
            account_form.is_valid()
    else:
        user_form = UserCreationForm()
        account_form = AccountCreationForm()
        
    context['user_form'] = user_form
    context['account_form'] = account_form
    context['content_title'] = CORE_UI_STRINGS.LABEL_USER_CREATE
    return render(request, template_name, context)



@login_required
def send_welcome_mail(request, pk):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_DASHBOARD_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    user = get_object_or_404(User, pk=pk)
    mail_title = CORE_UI_STRINGS.UI_WELCOME_MAIL_TITLE % {'site_name': settings.SITE_NAME}
    email_context = {
            'use_template': True,
            'template_name': settings.DJANGO_WELCOME_EMAIL_TEMPLATE,
            'title': mail_title,
            'recipient_email': user.email,
            'context':{
                'SITE_NAME': settings.SITE_NAME,
                'SITE_HOST': settings.SITE_HOST,
                'FULL_NAME': user.get_full_name()
            }
    }
    send_mail_task.apply_async(
        args=[email_context],
        queue=settings.CELERY_OUTGOING_MAIL_QUEUE,
        routing_key=settings.CELERY_OUTGOING_MAIL_ROUTING_KEY
    )

    return redirect('dashboard:user-detail', pk=pk)



@login_required
def tokens(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_DASHBOARD_PERM):
        logger.warning(f"Dashboard : PermissionDenied to user {username} for path {request.path}")
        raise PermissionDenied
    

    context = {}
    queryset = Token.objects.all()
    template_name = "dashboard/token_list.html"
    page_title = CORE_UI_STRINGS.LABEL_TOKEN_PLURAL
    page = request.GET.get('page', 1)
    paginator = Paginator(queryset, utils.PAGINATED_BY)
    try:
        list_set = paginator.page(page)
    except PageNotAnInteger:
        list_set = paginator.page(1)
    except EmptyPage:
        list_set = None
    context['page_title'] = page_title
    context['token_list'] = list_set
    context['content_title'] =  page_title
    return render(request,template_name, context)


@login_required
def generate_token(request):
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_CREATE_TOKEN_PERM) :
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    

    template_name = "dashboard/token_generate.html"
    context = {
        'page_title' : CORE_UI_STRINGS.LABEL_TOKEN_CREATE,
        'content_title' : CORE_UI_STRINGS.LABEL_TOKEN_CREATE
    }
    if request.method == 'POST':
            form = TokenForm(utils.get_postdata(request))
            if form.is_valid():
                user_id = form.cleaned_data.get('user')
                user = User.objects.get(pk=user_id)
                t = Token.objects.get_or_create(user=user)
                context['generated_token'] = t
                logger.info("user \"%s\" create a token for user \"%s\"", request.user.username, user.username )
                messages.add_message(request, messages.SUCCESS, _(f'Token successfully generated for user {username}') )
                return redirect('dashboard:home')
            else :
                logger.error("TokenForm is invalid : %s\n%s", form.errors, form.non_field_errors)
                messages.add_message(request, messages.ERROR, _('The submitted form is not valid') )
    else :
            context['form'] = TokenForm()
        
    return render(request, template_name, context)



def search_users(request):
    if request.method != 'GET':
        raise SuspiciousOperation
    context = {}
    search_query = utils.get_request_data(request).get('q')
    template_name = "dashboard/user_search_results.html"
    page_title = (search_query or "Error") + " - " + settings.SITE_NAME
    user_list = dictionary_service.search_users(search_query)
    user_not_found = user_list is None or not user_list.exists()
    context['page_title'] = page_title + " | " + settings.SITE_NAME
    context['user_list'] = user_list
    context['search'] = search_query
    context['NO_SEARCH_RESULTS'] = user_not_found
    return render(request,template_name, context)