from django.shortcuts import render, HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist
from django.contrib import auth
from django.templatetags.static import static
from django.shortcuts import render, get_object_or_404, redirect, reverse
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from django.contrib.sitemaps import Sitemap
from django.contrib.auth.forms import UserCreationForm
from dashboard import dashboard_service
from kemelang import settings
from dictionary import dictionary_service
from core.resources import ui_strings as CORE_UI_STRINGS
from django.utils import timezone
import datetime

import logging

logger = logging.getLogger(__name__)

def page_not_found(request):
    template_name = '404.html'
    context={
        'page_title': CORE_UI_STRINGS.UI_404_TITLE
    }
    return render(request, template_name, context)


def server_error(request):
    template_name = '500.html'
    context={
        'page_title': CORE_UI_STRINGS.UI_500_TITLE
    }
    return render(request, template_name, context)

def permission_denied(request):
    template_name = '403.html'
    context={
        'page_title': CORE_UI_STRINGS.UI_403_TITLE
    }
    return render(request, template_name, context)

def bad_request(request):
    template_name = '400.html'
    context={
        'page_title': CORE_UI_STRINGS.UI_400_TITLE
    }
    return render(request, template_name, context)


def home(request):
    setting = dashboard_service.get_setting()
    if setting is None or not setting.maintenance_mode:
        template_name = "maintenance/home.html"
        page_title = CORE_UI_STRINGS.UI_HOME_MAINTENANCE_PAGE
        context = {
            'page_title': page_title,
            'user_is_authenticated' : request.user.is_authenticated,
            'OG_TITLE' : page_title,
            'OG_DESCRIPTION': "",
            'OG_URL': request.build_absolute_uri(),
        }
    else:
        template_name = "dictionary/dict.html"
        page_title = CORE_UI_STRINGS.UI_HOME_PAGE
        context = {
            'page_title': page_title,
            'user_is_authenticated' : request.user.is_authenticated,
            'OG_TITLE' : page_title,
            'OG_DESCRIPTION': "",
            'OG_URL': request.build_absolute_uri(),
            'countrie_list': dictionary_service.get_countries(),
            'langage_list': dictionary_service.get_langages()
        }
    return render(request, template_name,context)


def about(request):
    """
    This function serves the About Page.
    By default the About html page is saved
    on the root template folder.
    """
    template_name = "about.html"
    page_title = 'About' + ' - ' + settings.SITE_NAME
    
    
    context = {
        'page_title': page_title,
    }
    return render(request, template_name,context)



def faq(request):
    template_name = "faq.html"
    page_title = "FAQ" + ' - ' + settings.SITE_NAME
    context = {
        'page_title': page_title,
    }
    return render(request, template_name,context)


def usage(request):
    template_name = "usage.html"
    page_title =  "Usage" + ' - ' + settings.SITE_NAME
    context = {
        'page_title': page_title
    }
    return render(request, template_name,context)


