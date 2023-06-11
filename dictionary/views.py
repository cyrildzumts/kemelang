from django.forms.models import inlineformset_factory
from django.shortcuts import get_object_or_404, redirect, render, HttpResponse
from django.http import HttpResponseNotAllowed
from django.core.exceptions import PermissionDenied, SuspiciousOperation, ObjectDoesNotExist
from kemelang import utils
from dictionary.models import Comment, Country, Definition, Langage, Word, TranslationWord, Phrase
from dictionary import constants as DICT_CONSTANTS
from dictionary import dictionary_service
from core import renderers
from django.contrib import messages
import logging
import json

logger = logging.getLogger(__name__)
# Create your views here.


def dict_home(request):
    template_name = "dictionary/dict.html"
    context = {
        'page_title': "Dictionary Home",
        'countrie_list': dictionary_service.get_countries(),
        'langage_list': dictionary_service.get_langages()
    }
    return render(request, template_name, context)


def dict(request):
    template_name = "dictionary/dict.html"
    context = {
        'page_title': "Dictionary Home",
        'countrie_list': dictionary_service.get_countries(),
        'langage_list': dictionary_service.get_langages()
    }
    return render(request, template_name, context)


def create_country(request):
    template_name = "dictionary/create_country.html"
    context = {
        'page_title': "New Country",
    }
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            country = dictionary_service.create_country(data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on creating Country : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
        
    return render(request, template_name, context)



def create_langage(request):
    template_name = "dictionary/create_langage.html"
    context = {
        'page_title': "New Langage",
        'country_list': dictionary_service.get_countries(),
    }
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            langage = dictionary_service.create_langage(data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on creating Langage : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    return render(request, template_name, context)


def create_word(request):
    
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            word = dictionary_service.create_word(data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on creating Word : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    template_name = "dictionary/create_word.html"
    WORD_TYPES_DICT = {k:str(v) for k,v in DICT_CONSTANTS.WORD_TYPES}
    context = {
        'page_title': "New Word",
        'langage_list': dictionary_service.get_langages(),
        'WORD_TYPES': DICT_CONSTANTS.WORD_TYPES,
        'WORD_TYPES_JSON': json.dumps(WORD_TYPES_DICT)
    }
    return render(request, template_name, context)

def create_phrase(request, word_uuid):
    template_name = "dictionary/create_phrase.html"
    word = get_object_or_404(Word, word_uuid=word_uuid)
    context = {
        'page_title': "New Phrase",
        'word': word,
        'langage': word.langage
    }
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            word = dictionary_service.create_phrase(data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on creating Word : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    context.update(DICT_CONSTANTS.DICTIONARY_URL_WORD_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_PHRASE_CONTEXT)
    return render(request, template_name, context)

def create_translation(request, word_uuid=None):
    template_name = "dictionary/create_translation.html"
    word = None
    if word_uuid:
        word = get_object_or_404(Word, word_uuid=word_uuid)
    context = {
        'page_title': "New Translation",
        'source_word': word,
        'langage_list': dictionary_service.get_langages()
    }
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            translation = dictionary_service.create_translation(data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on translating Word : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    return render(request, template_name, context)



def add_translations(request, word_uuid=None):
    logger.info(f"API: New Translation creation request")
    word = get_object_or_404(Word, word_uuid=word_uuid)
    if request.method != 'POST':
        return HttpResponseNotAllowed('Bad request. Use POST instead')
    result = None
    try:
        
        result = dictionary_service.add_translations(word_uuid, request.data)
        messages.success(request, message=result.get('message'))
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        messages.error(request, message=result.get('message'))
        logger.error(f"Error while adding translations {e}")
    return redirect(word)



def add_synonymes(request, word_uuid=None):
    logger.info(f"API: New Synonymes creation request")
    word = get_object_or_404(Word, word_uuid=word_uuid)
    if request.method != 'POST':
        return HttpResponseNotAllowed('Bad request. Use POST instead')
    result = None
    try:
        result = dictionary_service.add_synonymes(word_uuid, request.data)
        messages.success(request, message=result.get('message'))
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        messages.error(request, message=result.get('message'))
        logger.error(f"Error while adding synonymes {e}")
    return redirect(word)


def update_country(request, country_slug, country_uuid):
    template_name = "dictionary/update_country.html"
    country = get_object_or_404(Country, country_uuid=country_uuid)
    context = {
        'page_title': "Update Country",
        'country': country,
    }
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            country = dictionary_service.update_country(country, data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on updating Country {country.name} : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    context.update(DICT_CONSTANTS.DICTIONARY_URL_COUNTRY_CONTEXT)
    return render(request, template_name, context)

def update_phrase(request, phrase_uuid):
    template_name = "dictionary/update_phrase.html"
    phrase = get_object_or_404(Phrase, phrase_uuid=phrase_uuid)
    context = {
        'page_title': "Update Phrase",
        'phrase': phrase,
    }
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            phrase = dictionary_service.update_phrase(phrase, data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on updating Phrase for word{phrase.word} : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    context.update(DICT_CONSTANTS.DICTIONARY_URL_WORD_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_PHRASE_CONTEXT)
    return render(request, template_name, context)

def update_langage(request, langage_slug, langage_uuid):
    template_name = "dictionary/update_langage.html"
    langage = get_object_or_404(Langage, langage_uuid=langage_uuid)
    context = {
        'page_title': "Update Langage",
        'langage': langage,
        'country_list': dictionary_service.get_countries().exclude(langages__pk=langage.pk),
    }
    logger.info(f"langage update : {langage} - Description : {langage.description}")
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            langage = dictionary_service.update_langage(langage, data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on updating Langage {langage.name} : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    else:
        pass
    context.update(DICT_CONSTANTS.DICTIONARY_URL_LANGAGE_CONTEXT)
    return render(request, template_name, context)


def update_word(request, word, word_uuid):
    template_name = "dictionary/update_word.html"
    w = get_object_or_404(Word, word_uuid=word_uuid)
    
    if request.method == DICT_CONSTANTS.REQUEST_METHOD_POST:
        data = utils.get_postdata(request)
        try:
            w = dictionary_service.update_word(w, data)
            return redirect(DICT_CONSTANTS.RESOLVE_DICT_HOME)
        except Exception as e:
            msg = f"Error on updating Word {word} : {e}"
            messages.warning(request, msg)
            logger.warn(msg)
    
    try:
        WORD_TYPES_DICT = {k:str(v) for k,v in DICT_CONSTANTS.WORD_TYPES}
        context = {
        'page_title': "Update Word",
        'word': w,
        'langage_list': dictionary_service.get_langages(),
        'WORD_TYPES': DICT_CONSTANTS.WORD_TYPES,
        'WORD_TYPES_DICT': WORD_TYPES_DICT,
        'WORD_TYPES_JSON': json.dumps(WORD_TYPES_DICT)
    }
    except Exception as e:
        logger.warning(f"Error on building context object from Tuple :{DICT_CONSTANTS.WORD_TYPES} {e}", e)
        raise e
    
    context.update(DICT_CONSTANTS.DICTIONARY_URL_WORD_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_SYNONYME_CONTEXT)
    
    return render(request, template_name, context)



def countries(request):
    template_name = "dictionary/countries.html"
    context = {
        'page_title': f"Countries",
        'country_list': dictionary_service.get_countries(),
    }
    return render(request, template_name, context)


def langages(request):
    template_name = "dictionary/langages.html"
    context = {
        'page_title': f"Langages",
        'langage_list': dictionary_service.get_langages(),
    }
    context.update(DICT_CONSTANTS.DICTIONARY_URL_LANGAGE_CONTEXT)
    return render(request, template_name, context)


def country_detail(request, country_slug):
    template_name = "dictionary/country.html"
    country = get_object_or_404(Country, slug=country_slug)
    langage_list = dictionary_service.get_langages_by_country(country)
    context = {
        'page_title': f"Country {country.name}",
        'country': country,
        'langage_list': langage_list,
    }
    context.update(DICT_CONSTANTS.DICTIONARY_URL_COUNTRY_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_LANGAGE_CONTEXT)
    return render(request, template_name, context)


def langage_details(request,langage_slug):
    template_name = "dictionary/langage.html"
    langage = get_object_or_404(Langage, slug=langage_slug)
    country_list = dictionary_service.get_countries_by_langage(langage)
    context = {
        'page_title': f"Langage {langage.name}",
        'langage': langage,
        'country_list': country_list,
        'word_list': dictionary_service.get_words_for_langage(langage)
    }
    context.update(DICT_CONSTANTS.DICTIONARY_URL_LANGAGE_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_COUNTRY_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_WORD_CONTEXT)
    return render(request, template_name, context)



def word_details(request,word, word_uuid):
    template_name = "dictionary/word.html"
    word = get_object_or_404(Word, word=word, word_uuid=word_uuid)
    context = {
        'page_title': f"Word {word.word}",
        'word': word,
        'definition_list': word.definitions.all(),
        'comment_list': word.comments.all(),
        'phrase_list': word.phrases.all(),
        'translations': word.translations.all()
    }
    context.update(DICT_CONSTANTS.DICTIONARY_URL_WORD_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_PHRASE_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_DEFINTION_CONTEXT)
    context.update(DICT_CONSTANTS.DICTIONARY_URL_SYNONYME_CONTEXT)
    return render(request, template_name, context)