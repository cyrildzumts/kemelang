from kemelang import settings
from django.contrib.auth.models import User
from dictionary import constants

import logging

logger = logging.getLogger(__name__)

def site_context(request):

    context = {
        'site_name' : settings.SITE_NAME,
        'SITE_NAME' : settings.SITE_NAME,
        'SITE_HOST' : settings.SITE_HOST,
        'redirect_to' : '/',
        'dev_mode' : settings.DEV_MODE,
        'next_url' : request.path,
        'TEMPLATE_CACHE_TIMEOUT': settings.TEMPLATE_CACHE_TIMEOUT
    }
    context.update(constants.DICTIONARY_URL_TRANSLATION_CONTEXT)
    return context