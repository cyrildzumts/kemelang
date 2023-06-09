
from django.utils.translation import gettext as _

TRANSLATION_COMMENT_MAX_LENGTH = 300
NAME_MAX_LENGTH = 128
WORD_MAX_LENGTH = 128
WORD_DEFINITION_MAX_LENGTH = 256
RESOURCE_EDIT_TIMEOUT = 15 # Minutes
RESOURCE_EDIT_MAX_IDLE = 3 # Minutes

TRANSLATE_AUTO_DETECT = "auto"

REQUEST_METHOD_GET = "GET"
REQUEST_METHOD_POST = "POST"

SEARCH_TYPE_PLAIN = "plain"
SEARCH_TYPE_PHRASE = "phrase"
SEARCH_TYPE_RAW = "raw"
SEARCH_TYPE_WEBSEARCH = "websearch"
SEARCH_ORDER_BY_RANK_ASCENDING = "rank"
SEARCH_ORDER_BY_RANK_DESCENDING = "-rank"
SEARCH_RANK_FILTER = 0.6
SEARCH_SIMILARITY_FILTER = 0.8
SEARCH_TRIGRAM_DISTANCE_FILTER = 0.3

COUNTRY_FORMSET_PREFIX = "country"
LANGAGE_FORMSET_PREFIX = "langage"
WORD_FORMSET_PREFIX = "word"
TRANSLATION_FORMSET_PREFIX = "translation"
TRANSLATE_DEFAULT_SOURCE_LANGAGE = "bambara"
TRANSLATE_DEFAULT_DESTINATION_LANGAGE = "bassa"

RESOLVE_DICT_HOME = "dictionary:dict-home"
RESOLVE_HOME = "home"


FORM_MANAGEMENT_TYPE_MAPPING = {
    'langage' : 'Langage',
    'country': 'Country',
    'definition': 'Definition',
    
}

WORD_TYPE_NOUN = 0
WORD_TYPE_VERB = 1
WORD_TYPE_PRONOUN = 2
WORD_TYPE_ADVERB = 3
WORD_TYPE_ADJECTIVE = 4
WORD_TYPE_PREPOSITION = 5

WORD_TYPES = (
    (WORD_TYPE_NOUN, _('Noun')),
    (WORD_TYPE_VERB, _('Verb')),
    (WORD_TYPE_PRONOUN, _('Pronoun')),
    (WORD_TYPE_ADVERB, _('Adverb')),
    (WORD_TYPE_ADJECTIVE, _('Adjective')),
    (WORD_TYPE_PREPOSITION, _('Preposition'))
)

RESOURCE_TYPE_LANGAGE = 0
RESOURCE_TYPE_COUNTRY = 1
RESOURCE_TYPE_WORD = 2

RESOURCE_TYPES = (
    (RESOURCE_TYPE_LANGAGE, 'Langage'),
    (RESOURCE_TYPE_COUNTRY, 'Country'),
    (RESOURCE_TYPE_WORD, 'Word')
)


DICTIONARY_URL_PREFIX = "dictionary"

DICTIONARY_HOME_URL = f"{DICTIONARY_URL_PREFIX}:dict-home"

DICTIONARY_URL_COUNTRY_CONTEXT = {
    'COUNTRIES_URL'               : f"{DICTIONARY_URL_PREFIX}:countries",
    'COUNTRY_URL'                : f"{DICTIONARY_URL_PREFIX}:country",
    'COUNTRY_UPDATE_URL'         : f"{DICTIONARY_URL_PREFIX}:country-update",
    'COUNTRY_DELETE_URL'         : f"{DICTIONARY_URL_PREFIX}:country-delete",
    'COUNTRIES_DELETE_URL'        : f"{DICTIONARY_URL_PREFIX}:countries-delete",
    'COUNTRY_CREATE_URL'         : f"{DICTIONARY_URL_PREFIX}:country-create"
}

DICTIONARY_URL_LANGAGE_CONTEXT = {
    'LANGAGES_URL'               : f"{DICTIONARY_URL_PREFIX}:langages",
    'LANGAGE_URL'                : f"{DICTIONARY_URL_PREFIX}:langage",
    'LANGAGE_UPDATE_URL'         : f"{DICTIONARY_URL_PREFIX}:langage-update",
    'LANGAGE_DELETE_URL'         : f"{DICTIONARY_URL_PREFIX}:langage-delete",
    'LANGAGES_DELETE_URL'        : f"{DICTIONARY_URL_PREFIX}:langages-delete",
    'LANGAGE_CREATE_URL'         : f"{DICTIONARY_URL_PREFIX}:langage-create"
}

DICTIONARY_URL_WORD_CONTEXT = {
    'WORDS_URL'               : f"{DICTIONARY_URL_PREFIX}:words",
    'WORD_URL'                : f"{DICTIONARY_URL_PREFIX}:word",
    'WORD_UPDATE_URL'         : f"{DICTIONARY_URL_PREFIX}:word-update",
    'WORD_DELETE_URL'         : f"{DICTIONARY_URL_PREFIX}:word-delete",
    'WORDS_DELETE_URL'        : f"{DICTIONARY_URL_PREFIX}:words-delete",
    'WORD_CREATE_URL'         : f"{DICTIONARY_URL_PREFIX}:word-create"
}

DICTIONARY_URL_SYNONYME_CONTEXT = {
    'SYNONYMES_URL'               : f"{DICTIONARY_URL_PREFIX}:synonymes",
    'SYNONYME_URL'                : f"{DICTIONARY_URL_PREFIX}:synonyme",
    'SYNONYME_UPDATE_URL'         : f"{DICTIONARY_URL_PREFIX}:synonyme-update",
    'SYNONYME_DELETE_URL'         : f"{DICTIONARY_URL_PREFIX}:synonyme-delete",
    'SYNONYMES_DELETE_URL'        : f"{DICTIONARY_URL_PREFIX}:synonymes-delete",
    'SYNONYME_CREATE_URL'         : f"{DICTIONARY_URL_PREFIX}:synonyme-create",
    'SYNONYME_ADD_URL'            : f"{DICTIONARY_URL_PREFIX}:synonyme-add"
}

DICTIONARY_URL_DEFINTION_CONTEXT = {
    'DEFINTIONS_URL'               : f"{DICTIONARY_URL_PREFIX}:definitions",
    'DEFINTION_URL'                : f"{DICTIONARY_URL_PREFIX}:definition",
    'DEFINTION_UPDATE_URL'         : f"{DICTIONARY_URL_PREFIX}:definition-update",
    'DEFINTION_DELETE_URL'         : f"{DICTIONARY_URL_PREFIX}:definition-delete",
    'DEFINTIONS_DELETE_URL'        : f"{DICTIONARY_URL_PREFIX}:definitions-delete",
    'DEFINTION_CREATE_URL'         : f"{DICTIONARY_URL_PREFIX}:definition-create"
}

DICTIONARY_URL_PHRASE_CONTEXT = {
    'PHRASES_URL'               : f"{DICTIONARY_URL_PREFIX}:phrases",
    'PHRASE_URL'                : f"{DICTIONARY_URL_PREFIX}:phrase",
    'PHRASE_UPDATE_URL'         : f"{DICTIONARY_URL_PREFIX}:phrase-update",
    'PHRASE_DELETE_URL'         : f"{DICTIONARY_URL_PREFIX}:phrase-delete",
    'PHRASES_DELETE_URL'        : f"{DICTIONARY_URL_PREFIX}:phrases-delete",
    'PHRASE_CREATE_URL'         : f"{DICTIONARY_URL_PREFIX}:phrase-create"
}

DICTIONARY_URL_TRANSLATION_CONTEXT = {
    'TRANSLATION_ADD_URL'               : f"{DICTIONARY_URL_PREFIX}:translation-add",
    'TRANSLATION_CREATE_URL'               : f"{DICTIONARY_URL_PREFIX}:translation-create",
    'TRANSLATION_UPDATE_URL'               : f"{DICTIONARY_URL_PREFIX}:translation-update",
    'TRANSLATION_URL'               : f"{DICTIONARY_URL_PREFIX}:translation",
    'TRANSLATION_DELETE_URL'               : f"{DICTIONARY_URL_PREFIX}:translation-delete",
    'TRANSLATIONS_DELETE_URL'               : f"{DICTIONARY_URL_PREFIX}:translations-delete",
    'TRANSLATIONS_URL'               : f"{DICTIONARY_URL_PREFIX}:translations",
    
}