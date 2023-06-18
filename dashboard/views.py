from django.shortcuts import render
from django.shortcuts import get_object_or_404, redirect
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import PermissionDenied, SuspiciousOperation, ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group, Permission
from django.contrib import messages
from dashboard.models import Settings
from dashboard import dashboard_service
from kemelang import settings, utils

import logging

logger = logging.getLogger(__name__)


# Create your views here.

@login_required
def dashboard(request):
    template_name = "dashboard/dashboard.html"
    username = request.user.username

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

    logger.info(f"Authorized Access : User {username} has requested the Dashboard Page")

    return render(request, template_name, context)


@login_required
def create_settings (request):
    template_name = 'dashboard/create_settings.html'
    username = request.user.username
    
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
    context = {
        'content_title' : "Settings"
    }

    page_title = _("Settings") + " - " + settings.SITE_NAME

    context['page_title'] = page_title
    context['setting'] = dashboard_service.get_setting()
    return render(request,template_name, context)