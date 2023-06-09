from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.forms import formset_factory, modelformset_factory, inlineformset_factory
from django.forms import ValidationError
from django.db import transaction
from django.db.models import Q, Count, F, TextField
from django.db.models.functions import Cast
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank, TrigramSimilarity, TrigramDistance, TrigramStrictWordSimilarity, TrigramWordSimilarity, TrigramWordDistance
from django.utils import timezone
from dictionary.models import Country, Langage, Phrase,Word, TranslationWord, Definition, Comment
from dictionary.forms import CountryForm, LangageForm, WordForm, DefinitionForm, CommentForm, PhraseForm, TranslationWordForm, UpdateAudioForm, UpdateWordForm, UpdateTranslationForm
from dictionary import constants as Constants
from core.resources import ui_strings as CORE_UI_STRINGS
from core import service as core_service
import datetime
import logging


logger = logging.getLogger(__name__)


def get_default_translation_langages():
    source_lang = Langage.objects.get(slug=Constants.TRANSLATE_DEFAULT_SOURCE_LANGAGE)
    dest_lang = Langage.objects.get(slug=Constants.TRANSLATE_DEFAULT_DESTINATION_LANGAGE)
    return source_lang, dest_lang


def create_country(data):
    country = core_service.create_instance(Country, data)
    return country


def create_phrase(data):
    country = core_service.create_instance(Phrase, data)
    return country


def create_mass_country(data):
    CountryFormSet = modelformset_factory(Country, form=CountryForm)
    formset = CountryFormSet(data, prefix=Constants.COUNTRY_FORMSET_PREFIX)
    result = {}
    if formset.is_valid():
        logger.info(f"Country Formset is valid. Dataset : {formset.cleaned_data}")
        countries = formset.save()
        logger.info(f"Country Formset created.")
        #result = {'success' : True, 'message': f'Created countries'}
        result = {'success' : True, 'message': f'Created {len(countries)} countries'}
    else:
        logger.warning(f"Country form is invalid - Error : {formset.errors} - Non Fields Errors : {formset.non_form_errors}")
        result = {'success': False, 'message': formset.errors}
    return result

def create_mass_langage(data):
    CountryFormSet = modelformset_factory(Langage, form=LangageForm)
    formset = CountryFormSet(data, prefix=Constants.LANGAGE_FORMSET_PREFIX)
    result = {}
    if formset.is_valid():
        logger.info(f"Langage Formset is valid. Dataset : {formset.cleaned_data}")
        langages = formset.save()
        logger.info(f"Langage Formset created.")
        result = {'success' : True, 'message': f'Created {len(langages)} langages'}
    else:
        logger.warning(f"Language form is invalid : {formset.errors} - Non Fields Errors : {formset.non_form_errors}")
        result = {'success': False, 'message': formset.errors}
    return result


def create_mass_word(data):
    WordFormSet = modelformset_factory(Word, form=WordForm)
    formset = WordFormSet(data, prefix=Constants.WORD_FORMSET_PREFIX)
    result = {}
    if formset.is_valid():
        logger.info(f"Word Formset is valid. Dataset : {formset.cleaned_data}")
        words = formset.save()
        logger.info(f"Word Formset created.")
        result = {'success' : True, 'message': f'Created {len(words)} words'}
    else:
        logger.warn(f"Word not created : Errors : {formset.errors} - Non Fields Errors : {formset.non_form_errors}")
        result = {'success': False, 'message': formset.errors}
    return result

def create_mass_translation(data):
    TranslationFormSet = modelformset_factory(TranslationWord, form=TranslationWordForm)
    formset = TranslationFormSet(data, prefix=Constants.TRANSLATION_FORMSET_PREFIX)
    result = {}
    if formset.is_valid():
        logger.info(f"Translation Formset is valid. Dataset : {formset.cleaned_data}")
        translations = formset.save()
        logger.info(f"Word Formset created.")
        result = {'success' : True, 'message': f'Translated {len(translations)} words'}
    else:
        logger.warn(f"Translation not created : Errors : {formset.errors} - Non Fields Errors : {formset.non_form_errors}")
        result = {'success': False, 'message': formset.errors}
    return result




def add_translations(word_uuid, data):
    word = Word.objects.get(word_uuid=word_uuid)
    form = UpdateTranslationForm(data, instance=word)
    result = {}
    if form.is_valid():
        logger.info(f"Translation Form is valid. Dataset : {form.cleaned_data}")
        translations = form.cleaned_data.get('translations')
        word.translations.add(*translations)
        logger.info(f"Translations added created.")
        result = {'success' : True, 'message': f'Translated {len(translations)} words'}
    else:
        logger.warn(f"Translation not created : Errors : {form.errors} - data : {data}")
        result = {'success': False, 'message': form.errors.as_json()}
    return result


def add_synonymes(word_uuid, data):
    word = Word.objects.get(word_uuid=word_uuid)
    form = UpdateTranslationForm(data, instance=word)
    result = {}
    if form.is_valid():
        logger.info(f"Synonymes Form is valid. Dataset : {form.cleaned_data}")
        synonymes = form.cleaned_data.get('synonymes')
        word.synonymes.add(*synonymes)
        logger.info(f"Synonymes added created.")
        result = {'success' : True, 'message': f'Added {len(synonymes)} Synonyme(s)'}
    else:
        logger.warn(f"Synonymes not added : Errors : {form.errors} - data : {data}")
        result = {'success': False, 'message': form.errors.as_json()}
    return result



def create_langage(data):
    return core_service.create_instance(Langage, data)

def create_word(data):
    return core_service.create_instance(Word, data)

def create_translation(data):
    return core_service.create_instance(TranslationWord, data)

def create_definition(data):
    return core_service.create_instance(Definition, data)


def update_country(country, data):
    result = core_service.update_instance(Country,country, data)
    Country.objects.filter(pk=country.pk).update(editing=False, start_editing_at=None, editing_token=None)
    return core_service.update_instance(Country,country, data)

def update_langage(langage, data):
    return core_service.update_instance(Langage,langage, data)

#def update_word(word, data):
#   return core_service.update_instance(Word, word, data)

def update_word(word, data):
    form = UpdateWordForm(data, instance=word)
    if form.is_valid():
        logger.info(f"Word Form is valid. Dataset : {form.cleaned_data}")
        word = form.save()
        logger.info(f"Word updated.")
        return word
    else:
        logger.warn(f"Word UpdateFowrm not updated:  Errors : {form.errors} - data : {data}")
        raise ValidationError(message=form.non_field_errors())

def update_definition(definition, data):
    return core_service.update_instance(Definition, definition, data)

def update_phrase(phrase, data):
    return core_service.update_instance(Phrase,phrase, data)


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

def find_country(name):
    logger.info(f"Looking for country {name}")
    country = None
    try:
        country = Country.objects.get(Q(name__iexact=name)|Q(slug__iexact=name)) 
    except ObjectDoesNotExist as e:
        pass
    return country

def get_countries_by_langage(langage):
    if not isinstance(langage, Langage):
        return Country.objects.none()
    return langage.countries.all()



def get_langages():
    return Langage.objects.all()


def find_langage(name):
    logger.info(f"Looking for langage {name}")
    lang = None
    try:
        lang = Langage.objects.get(Q(name__iexact=name)|Q(slug__iexact=name)) 
    except ObjectDoesNotExist as e:
        pass
    return lang


def find_words(word, lang):
    logger.info(f"Looking for word {word}")
    return Word.objects.filter(word__iexact=word,langage__slug__iexact=lang) 

def get_words_for_langage(langage):
    return langage.words.all()

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
    
    logger.info(f"Search Country : {search_query}")
    COUNTRY_VECTOR = SearchVector('name') + SearchVector('slug')
    DB_VECTOR = COUNTRY_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    TRIGRAM_SIMILARITY = TrigramSimilarity('name',search_query) + TrigramSimilarity('slug',search_query)
    RANK_FILTER = Q(rank__gte=Constants.SEARCH_RANK_FILTER)
    TRIGRAM_FILTER = Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_FILTER
    ORDER_BY = ['-similarity','-rank']
    found_words = set()
    queryset = Country.objects.annotate(rank=SearchRank(DB_VECTOR, DB_QUERY), similarity=TRIGRAM_SIMILARITY).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    for p in queryset:
        found_words.add(p)
    return list(found_words)


def log_word_full_search(p):
    logger.info(f"Search Result for {p} :")
    logger.info(f"Similiraty Word : {p.similarity_word} - Similiraty Description : {p.similarity_description}")
    logger.info(f"WordSimiliraty Word : {p.word_similarity_word} - - WordSimiliraty Description : {p.word_similarity_description}")
    logger.info(f"Rank Word : {p.rank_word} - Rank Description : {p.rank_descr} - Rank : {p.rank}")
    logger.info(f"Distance Word : {p.distance_word} - Distance Description : {p.distance_description}")
    logger.info(f"WordDistance Word : {p.word_distance_word} - WordDistance Description : {p.word_distance_description}")

def search_words(search_query, exclude_word=None, exclude_lang=None, filter_lang=None):
    
    logger.info(f"Search word : {search_query} - Filter lang : {filter_lang or ''} - Exclude word : {exclude_word or ''} - Exclude lang : {exclude_lang or ''}")
    CAST_DEFINITION = Cast('description', output_field=TextField())
    WORD_VECTOR = SearchVector('word', weight='A')
    DEFINITION_VECTOR = SearchVector('definition', weight='A')
    DESCRIPTION_VECTOR = SearchVector(CAST_DEFINITION, weight='A')
    DB_VECTOR = WORD_VECTOR + DESCRIPTION_VECTOR + DEFINITION_VECTOR
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    #TRIGRAM_SIMILARITY = TrigramSimilarity('word', search_query)
    TRIGRAM_SIMILARITY = TrigramWordSimilarity(search_query, 'word')
    #####
    TRIGRAM_FIELD_WORD_SIMILARITY = TrigramSimilarity('word', search_query)
    TRIGRAM_FIELD_DEFINITION_SIMILARITY = TrigramSimilarity('definition', search_query)
    TRIGRAM_FIELD_DESCRIPTION_SIMILARITY = TrigramSimilarity(CAST_DEFINITION, search_query)
    #####
    #TRIGRAMWORD_FIELD_WORD_SIMILARITY = TrigramWordSimilarity(search_query, 'word')
    #TRIGRAMWORD_FIELD_DESCRIPTION_SIMILARITY = TrigramWordSimilarity(search_query, CAST_DEFINITION)
    
    TRIGRAMWORD_FIELD_WORD_SIMILARITY = TrigramStrictWordSimilarity(search_query, 'word')
    TRIGRAMWORD_FIELD_DEFINITION_SIMILARITY = TrigramStrictWordSimilarity(search_query, 'definition')
    TRIGRAMWORD_FIELD_DESCRIPTION_SIMILARITY = TrigramStrictWordSimilarity(search_query, CAST_DEFINITION)
    #####
    TRIGRAM_FIELD_WORD_DISTANCE = TrigramDistance('word', search_query)
    TRIGRAM_FIELD_DEFINITION_DISTANCE = TrigramDistance('definition', search_query)
    TRIGRAM_FIELD_DESCRIPTION_DISTANCE = TrigramDistance(CAST_DEFINITION, search_query)
    TRIGRAM_DISTANCE = TrigramDistance('word', search_query)
    TRIGRAMWORD_FIELD_WORD_DISTANCE = TrigramWordDistance(search_query, 'word')
    TRIGRAMWORD_FIELD_DEFINITION_DISTANCE = TrigramWordDistance(search_query, 'definition')
    TRIGRAMWORD_FIELD_DESCRIPTION_DISTANCE = TrigramWordDistance(search_query, CAST_DEFINITION)
    RANK_FILTER = Q(rank__gt=Constants.SEARCH_RANK_FILTER)
    #TRIGRAM_SIMILARITY_FILTER = Q(similarity_word__gt=Constants.SEARCH_SIMILARITY_FILTER) | Q(similarity_description__gt=Constants.SEARCH_SIMILARITY_FILTER)
    TRIGRAM_WORD_SIMILARITY_FILTER = Q(word_similarity_word__gt=Constants.SEARCH_SIMILARITY_FILTER) | Q(word_similarity_definition__gt=Constants.SEARCH_SIMILARITY_FILTER) | Q(word_similarity_description__gt=Constants.SEARCH_SIMILARITY_FILTER)
    TRIGRAM_DISTANCE_FILTER = Q(word_distance_word__lt=Constants.SEARCH_TRIGRAM_DISTANCE_FILTER) | Q(word_distance_definition__lt=Constants.SEARCH_TRIGRAM_DISTANCE_FILTER) | Q(word_distance_description__lt=Constants.SEARCH_TRIGRAM_DISTANCE_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_WORD_SIMILARITY_FILTER | TRIGRAM_DISTANCE_FILTER 
    ORDER_BY = ['-rank']
    found_words = set()
    queryset = Word.objects.annotate(
        rank=SearchRank(DB_VECTOR, DB_QUERY),
        rank_word=SearchRank(WORD_VECTOR, DB_QUERY),
        rank_descr=SearchRank(DESCRIPTION_VECTOR, DB_QUERY), 
        rank_def=SearchRank(DEFINITION_VECTOR, DB_QUERY),
        similarity_word=TRIGRAM_FIELD_WORD_SIMILARITY,
        similarity_description=TRIGRAM_FIELD_DESCRIPTION_SIMILARITY,
        similarity_definition=TRIGRAM_FIELD_DEFINITION_SIMILARITY,
        word_similarity_word=TRIGRAMWORD_FIELD_WORD_SIMILARITY,
        word_similarity_definition=TRIGRAMWORD_FIELD_DEFINITION_SIMILARITY,
        word_similarity_description=TRIGRAMWORD_FIELD_DESCRIPTION_SIMILARITY,
        distance_word=TRIGRAM_FIELD_WORD_DISTANCE,
        distance_description=TRIGRAM_FIELD_DESCRIPTION_DISTANCE,
        distance_definition=TRIGRAM_FIELD_DEFINITION_DISTANCE,
        word_distance_word=TRIGRAMWORD_FIELD_WORD_DISTANCE,
        word_distance_definition=TRIGRAMWORD_FIELD_DEFINITION_DISTANCE,
        word_distance_description=TRIGRAMWORD_FIELD_DESCRIPTION_DISTANCE
    ).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    if filter_lang is not None:
        queryset = queryset.filter(langage__langage_uuid=filter_lang)
    if exclude_word is not None:
        queryset = queryset.exclude(word_uuid=exclude_word)
    if exclude_lang is not None:
        queryset = queryset.exclude(langage__langage_uuid=exclude_lang)
    for p in queryset:
        found_words.add(p)
    return list(found_words)


def search_langages(search_query):
    
    logger.info(f"Search langage : {search_query}")
    LANG_VECTOR = SearchVector('name') + SearchVector('slug')
    DB_VECTOR = LANG_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    TRIGRAM_SIMILARITY = TrigramSimilarity('name',search_query) + TrigramSimilarity('slug',search_query)
    RANK_FILTER = Q(rank__gte=Constants.SEARCH_RANK_FILTER)
    TRIGRAM_FILTER = Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_FILTER
    ORDER_BY = ['-similarity','-rank']
    found_langs = set()
    queryset = Langage.objects.annotate(rank=SearchRank(DB_VECTOR, DB_QUERY), similarity=TRIGRAM_SIMILARITY).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    for p in queryset:
        found_langs.add(p)
    return list(found_langs)


def find_word_langages(search_query):
    logger.info(f"Search word : {search_query}")
    
    queryset = Langage.objects.filter(words__word__unaccent__iexact=search_query)
    if queryset.exists():
        return {'query': search_query, 'langages': queryset, 'found': True, 'size': queryset.count()}
    
    WORD_VECTOR = SearchVector('words__word')
    DB_VECTOR = WORD_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH)
    TRIGRAM_SIMILARITY = TrigramSimilarity('words__word',search_query)
    RANK_FILTER = Q(rank__gte=Constants.SEARCH_RANK_FILTER)
    TRIGRAM_FILTER = Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)
    SEARCH_FILTER = RANK_FILTER | TRIGRAM_FILTER
    ORDER_BY = ['-similarity','-rank']
    found_langages = set()
    queryset = Langage.objects.annotate(rank=SearchRank(DB_VECTOR, DB_QUERY), similarity=TRIGRAM_SIMILARITY).filter(SEARCH_FILTER).order_by(*ORDER_BY)
    for p in queryset:
        found_langages.add(p)
    return {'query': search_query, 'found': False, 'suggestions': list(found_langages), 'size': len(found_langages)}



def slugify_langage():
    queryset = Langage.objects.filter(slug=None)
    for l in queryset:
        l.save()

def slugify_country():
    queryset = Country.objects.filter(slug=None)
    for c in queryset:
        c.save()


def slugify_models():
    logger.info("Slugify Models ...")
    slugify_country()
    slugify_langage()
    logger.info("Slugify Models done")
    

def build_translate_filter_old(query, source_lang, target_lang, auto_detect=False):
    WORD_FILTER = None
    TRANSLATE_FILTER = None
    if auto_detect:
        TARGET_LANGAGE_FILTER = Q(target_langage__slug__iexact=target_lang)
        SOURCE_WORD_FILTER = Q(source_word__word__unaccent__iexact=query) 
        WORD_FILTER = Q(word__unaccent__iexact=query)
        TRANSLATE_FILTER = SOURCE_WORD_FILTER & TARGET_LANGAGE_FILTER
    else:
        SOURCE_LANGAGE_FILTER =  Q(source_langage__slug__iexact=source_lang)
        TARGET_LANGAGE_FILTER =  Q(target_langage__slug__iexact=target_lang)
        SOURCE_WORD_FILTER = Q(source_word__word__unaccent__iexact=query) 
        WORD_FILTER = Q(word__unaccent__iexact=query) & Q(langage__slug__iexact=source_lang)
        TRANSLATE_FILTER = SOURCE_WORD_FILTER & SOURCE_LANGAGE_FILTER & TARGET_LANGAGE_FILTER
    return WORD_FILTER, TRANSLATE_FILTER


def build_translate_filter(query, source_lang, target_lang, auto_detect=False):
    WORD_FILTER = None
    TRANSLATE_FILTER = None
    if auto_detect:
        TARGET_LANGAGE_FILTER = Q(langage__slug__iexact=target_lang)
        SOURCE_WORD_FILTER = Q(word__unaccent__iexact=query) 
        WORD_FILTER = Q(word__unaccent__iexact=query)
        TRANSLATE_FILTER = SOURCE_WORD_FILTER & TARGET_LANGAGE_FILTER
    else:
        SOURCE_LANGAGE_FILTER =  Q(langage__slug__iexact=source_lang)
        TARGET_LANGAGE_FILTER =  Q(langage__slug__iexact=target_lang)
        SOURCE_WORD_FILTER = Q(word__unaccent__iexact=query) 
        WORD_FILTER = Q(word__unaccent__iexact=query) & Q(langage__slug__iexact=source_lang)
        TRANSLATE_FILTER = SOURCE_WORD_FILTER & SOURCE_LANGAGE_FILTER & TARGET_LANGAGE_FILTER
    return WORD_FILTER, TRANSLATE_FILTER
    

def translate(query, source_lang, target_lang):
    auto_detect = source_lang == Constants.TRANSLATE_AUTO_DETECT
    WORD_FILTER, TRANSLATE_FILTER = build_translate_filter(query, source_lang, target_lang, source_lang == Constants.TRANSLATE_AUTO_DETECT)
    word = None
    word_found = False
    result = None
    suggestions = []
    try:
        word_set = Word.objects.filter(WORD_FILTER)
        word_found = word_set.exists()
        if not word_found:
            suggestions = search_words(query)
        if word_found:
            words = [word.as_dict(True) for word in word_set]
            word = words[0]
            w = word_set.first()
            translation_set = w.translations.filter(langage__slug__iexact=target_lang)
            found = translation_set.exists()
            result = {'success': True,'found':found,'auto_detect': auto_detect, 'query':query,'word': word, 'words': words ,'translations': [translation.as_dict() for translation in translation_set]}
        elif len(suggestions) > 0 :
            logger.info(f"suggestions found for query {query}")
            result = {'success': True,'found':False,'auto_detect': auto_detect, 'query':query,'word': None, 'words': None ,'translations': [], 'suggestions': [s.as_dict() for s in  suggestions]}
        else:
            logger.warn(f"word and suggestions not found for query {query}")
            raise Word.DoesNotExist(f"Word {query} not found")
    except Word.DoesNotExist as e:
        logger.warning(f"translate : word {query} not found")
        result = {'success': True, 'found': False, 'auto_detect': auto_detect, 'word': None,'suggestions': None, 'query': query,'message': f"word {query} not found"}
    
    except Exception as e:
        logger.warning(f"Error while translating word {query}", e)
        result = {'success': False, 'auto_detect': auto_detect,'word': None, 'suggestions': None, 'message': f"Error while translating word {query}"}
    
    return result



def search_users(search_query):
    
    logger.info(f"Search user : {search_query}")
    USER_VECTOR = SearchVector('username') + SearchVector('last_name') + SearchVector('first_name') + SearchVector('email')
    DB_VECTOR = USER_VECTOR 
    DB_QUERY = SearchQuery(search_query, search_type=Constants.SEARCH_TYPE_WEBSEARCH) 
    return User.objects.annotate(similarity=TrigramSimilarity('email', search_query), rank=SearchRank(DB_VECTOR, DB_QUERY)).filter(Q(rank__gte=Constants.SEARCH_RANK_FILTER)|Q(similarity__gte=Constants.SEARCH_SIMILARITY_FILTER)).order_by(Constants.SEARCH_ORDER_BY_RANK_DESCENDING)