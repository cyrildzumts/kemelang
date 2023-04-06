
from django import forms as django_forms
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, Q, Count, Sum
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import get_template, render_to_string
from django.utils.translation import gettext_lazy as _
from django.forms import modelform_factory
from django.forms import formset_factory, modelformset_factory

from django.utils.text import slugify
from dictionary.models import Country, Langage, Word, Definition
import logging
import datetime
import io

logger = logging.getLogger(__name__)

def create_instance(model, data):
    Form = modelform_factory(model, fields=model.FORM_FIELDS)
    form = Form(data)
    if form.is_valid():
        return form.save()
    else:
        logger.warn(f"Error on creating a new instance of {model}")
        logger.error(form.errors)
        raise django_forms.ValidationError(message=form.non_field_errors())
    return None


def update_instance(model, instance, data):
    Form = modelform_factory(model, fields=model.FORM_FIELDS)
    form = Form(data, instance=instance)
    if form.is_valid():
        return form.save()
    else:
        logger.warn(f"Error on updating an instance of {model}")
        logger.error(form.errors)
        raise django_forms.ValidationError(message=form.non_field_errors())


def delete_instance(model, data):
    logger.warn(f"Delete instance of {model} with data : {data}")
    return model.objects.filter(**data).delete()

def delete_instances(model, id_list):
    logger.warn(f"Delete instances of {model} with id in : {id_list}")
    return model.objects.filter(id__in=id_list).delete()


def instances_active_toggle(model, id_list, toggle=True):
    logger.warn(f"Updating active status for  instances of {model} with id in : {id_list}. new active status : {toggle}")
    return model.objects.filter(id__in=id_list).exclude(is_active=toggle).update(is_active=toggle)




def core_send_mail(recipient_list, subject, message):
    send_mail(subject, message, recipient_list)


