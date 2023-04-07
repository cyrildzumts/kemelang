from django.forms import modelformset_factory
from django.forms import inlineformset_factory
from django.forms import ValidationError
from django.db import transaction
from core import service as core_service
from dictionary.models import Country, Langage, Word, Definition
from dictionary.forms import CountryForm, LangageForm, WordForm, DefinitionForm

import logging
import datetime

logger = logging.getLogger(__name__)


def create_country(data):
    country = core_service.create_instance(Country, data)
    return country

def create_langage(data):
    return core_service.create_instance(Langage, data)

def create_word(data):
    return core_service.create_instance(Word, data)

def create_definition(data):
    return core_service.create_instance(Definition, data)

def update_country(country, data):
    return core_service.update_instance(country, data)

def update_langage(langage, data):
    return core_service.update_instance(langage, data)

def update_word(word, data):
    return core_service.update_instance(word, data)

def update_definition(definition, data):
    return core_service.update_instance(definition, data)


def create_country_langages(data):
    country = None
    try:
        with transaction.atomic():
            country = core_service.create_instance(Country, data)
            langages = create_langages(country, data)
            logger.info(f"Country created with langages : {langages}")
    except Exception as e:
        logger.warn("Error on creating Country.")
        logger.exception(e)
    
    return country


def create_langages(country, data):
    logger.info(f" creating langages for country {country}")
    Formset = modelformset_factory(Langage, form=LangageForm)
    for i in range(4):
        data[f"form-{i}-country"] = country.pk
    formset = Formset(data)
    if formset.is_valid():
        langages = formset.save()
        logger.info("Saved Langage Formset")
        return langages
    else:
        msg = f"Langage Formset Error : {formset.errors} - Non form Errors : {formset.non_form_errors()}"
        logger.error(f"Answer Formset Error : {msg}")
        raise ValidationError(msg)
    


