

from django.db.models.signals import post_save, pre_save
from django.contrib.auth.models import User
from django.contrib.auth import user_logged_in
from django.dispatch import receiver
from accounts.models import Account
from django.utils.text import slugify
from django.utils import translation
from core.tasks import send_mail_task
from core.resources import ui_strings as CORE_UI_STRINGS
from core import constants as CORE_CONSTANTS
from django.core.cache.utils import make_template_fragment_key
from kemelang import settings
import logging
import copy


logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def send_welcome_mail(sender, instance, created, **kwargs):
    
    if created:
        logger.info("sending welcome mail ...")
        if str(instance.username).startswith(settings.TEST_USER_PREFIX):
            logger.debug(f"sending welcome mail for test user {instance.username}...")
            return
        mail_title = CORE_UI_STRINGS.UI_WELCOME_MAIL_TITLE % {'site_name': settings.SITE_NAME}
        email_context = {
            'use_template': True,
            'message': None,
            'template_name': settings.DJANGO_WELCOME_EMAIL_TEMPLATE,
            'title': mail_title,
            'recipient_email': instance.email,
            
            'context':{
                'MAIL_TITLE': mail_title,
                'SITE_NAME': settings.SITE_NAME,
                'SITE_HOST': settings.SITE_HOST,
                'FULL_NAME': instance.get_full_name()
            }
        }
        send_mail_task.apply_async(
            args=[email_context],
            queue=settings.CELERY_OUTGOING_MAIL_QUEUE,
            routing_key=settings.CELERY_OUTGOING_MAIL_ROUTING_KEY
        )
        admin_email_context = copy.deepcopy(email_context)
        admin_email_context['recipient_email'] = settings.ADMIN_EXTERNAL_EMAIL
        admin_email_context['title'] = CORE_UI_STRINGS.UI_NEW_USER_MAIL_TITLE
        send_mail_task.apply_async(
            args=[admin_email_context],
            queue=settings.CELERY_OUTGOING_MAIL_QUEUE,
            routing_key=settings.CELERY_OUTGOING_MAIL_ROUTING_KEY
        )


@receiver(post_save, sender=Account)
def send_validation_mail(sender, instance, created, **kwargs):
    
    if created:
        logger.info("sending validation mail ...")
        if str(instance.user.username).startswith(settings.TEST_USER_PREFIX):
            logger.debug(f"sending validation mail for test user {instance.user.username} ...")
            return
        mail_title = CORE_UI_STRINGS.UI_MAIL_VALIDATION_TITLE
        email_context = {
            'use_template': True,
            'message': None,
            'template_name': settings.DJANGO_VALIDATION_EMAIL_TEMPLATE,
            'title': mail_title,
            'recipient_email': instance.user.email,
            'context':{
                'SITE_NAME': settings.SITE_NAME,
                'SITE_HOST': settings.SITE_HOST,
                'FULL_NAME': instance.user.get_full_name(),
                'MAIL_TITLE': mail_title,
                'validation_url' : settings.SITE_HOST + instance.get_validation_url()
            }
        }
        
        send_mail_task.apply_async(
            args=[email_context],
            queue=settings.CELERY_OUTGOING_MAIL_QUEUE,
            routing_key=settings.CELERY_OUTGOING_MAIL_ROUTING_KEY
        )





