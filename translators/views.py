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
def translator_home(request):
    template_name = "translators/translators.html"
    username = request.user.username
    if not request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_TRANSLATOR_PERM):
        logger.warning("Dashboard : PermissionDenied to user %s for path %s", username, request.path)
        raise PermissionDenied
    page_title = "Translators"
    context = {
            'name'          : username,
            'page_title'    : page_title,
            'content_title' : page_title,
            'word_list': dashboard_service.get_word_missing_translation(),
        }
    #context.update(dashboard_service.create_resources_opened())

    return render(request, template_name, context)