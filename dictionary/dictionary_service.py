from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.forms import formset_factory, modelformset_factory
from django.forms import ValidationError
from django.db import transaction
from django.db.models import Q, Count, F
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank, TrigramSimilarity
from django.utils import timezone
from dictionary.models import Country, Langage,Word, TranslationWord, Definition, Comment
from dictionary.forms import CountryForm, LangageForm, WordForm, DefinitionForm, CommentForm, PhraseForm, TranslationWordForm
from dictionary import constants as Constants
from core.resources import ui_strings as CORE_UI_STRINGS
from core import service as core_service
import datetime
import logging


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




def get_countries():
    return Country.objects.all()

def get_countries_by_langage(langage):
    if not isinstance(langage, Langage):
        return Country.objects.none()
    return langage.countries.all()



def get_langages():
    return Langage.objects.all()


def get_langages_by_country(country):
    if not isinstance(country, Country):
        return Langage.objects.none()
    
    return country.langages.all()


def get_langages_by_word(word):
    if not isinstance(word, Word):
        return Langage.objects.none()
    return Langage.objects.filter(words__word=word.word)


def get_word_translations(word):
    if not isinstance(word, Word):
        return TranslationWord.objects.none()
    
    return word.translations.all()


def get_synonymes(word):
    if not isinstance(word, Word):
        return Word.objects.none()
    
    return word.synonymes.all()


def get_word_phrases(word):
    if not isinstance(word, Word):
        return Word.objects.none()
    
    return word.phrases.all()


def get_word_comments(word):
    if not isinstance(word, Word):
        return Word.objects.none()
    
    return word.comments.all()


def get_word_definitions(word):
    if not isinstance(word, Word):
        return Definition.objects.none()
    
    return word.defintions.all()


def get_word_translations_for_langage(word, langage):
    if not isinstance(word, Word):
        return TranslationWord.objects.none()
    
    if not isinstance(langage, Langage):
        return TranslationWord.objects.none()
    
    return word.translations.filter(source_langage=langage)



def search_countries(search_query):
    
    logger.info(f"Search word : {search_query}")
    COUNTRY_VECTOR = SearchVector('name') + SearchVector('langages__name')
    DB_VECTOR = COUNTRY_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    TRIGRAM_SIMILARITY = TrigramSimilarity('name',search_query) + TrigramSimilarity('langages__name',search_query)
    RANK_FILTER = Q(rank__gte=Constants.SEARCH_RANK_FILTER)
    TRIGRAM_FILTER = Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_FILTER
    ORDER_BY = ['-similarity','-rank']
    found_words = set()
    queryset = Country.objects.annotate(rank=SearchRank(DB_VECTOR, DB_QUERY), similarity=TRIGRAM_SIMILARITY).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    for p in queryset:
        found_words.add(p)
    return list(found_words)


def search_words(search_query):
    
    logger.info(f"Search word : {search_query}")
    WORD_VECTOR = SearchVector('word')
    DB_VECTOR = WORD_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    TRIGRAM_SIMILARITY = TrigramSimilarity('word',search_query)
    RANK_FILTER = Q(rank__gte=Constants.SEARCH_RANK_FILTER)
    TRIGRAM_FILTER = Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_FILTER
    ORDER_BY = ['-similarity','-rank']
    found_words = set()
    queryset = Word.objects.annotate(rank=SearchRank(DB_VECTOR, DB_QUERY), similarity=TRIGRAM_SIMILARITY).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    for p in queryset:
        found_words.add(p)
    return list(found_words)


def search_langages(search_query):
    
    logger.info(f"Search word : {search_query}")
    LANG_VECTOR = SearchVector('name') + SearchVector('countries__name')
    DB_VECTOR = LANG_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    TRIGRAM_SIMILARITY = TrigramSimilarity('name',search_query) + TrigramSimilarity('countries__name',search_query)
    RANK_FILTER = Q(rank__gte=Constants.SEARCH_RANK_FILTER)
    TRIGRAM_FILTER = Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_FILTER
    ORDER_BY = ['-similarity','-rank']
    found_langs = set()
    queryset = Langage.objects.annotate(rank=SearchRank(DB_VECTOR, DB_QUERY), similarity=TRIGRAM_SIMILARITY).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    for p in queryset:
        found_langs.add(p)
    return list(found_langs)