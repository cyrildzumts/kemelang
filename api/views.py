from django.utils.translation import ugettext_lazy as _
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authtoken.models import Token
from rest_framework import filters
from rest_framework.generics import ListAPIView
from django.contrib.auth.models import User
from api import serializers
from api.serializers import UserSerializer, CountrySerializer, LangageSerializer, DefinitionSerializer, CommentSerializer, TranslationWordSerializer, WordSerializer
from kemelang import utils
from dictionary.models import Country, Langage,Word, Definition, Comment, Phrase, TranslationWord
from dictionary import dictionary_service
from core.resources import ui_strings as UI_STRINGS

import logging
import uuid
import json
logger = logging.getLogger(__name__)


# Create your views here.
class UserSearchByNameView(ListAPIView):
     #permission_classes = [IsAuthenticated]
     serializer_class = UserSerializer
     search_fields = ['last_name', 'first_name','username']
     filter_backends = [filters.SearchFilter]
     queryset = User.objects.filter(is_superuser=False)
     


class UserSearchView(ListAPIView):
     #permission_classes = [IsAuthenticated]
     serializer_class = UserSerializer
     search_fields = ['last_name', 'first_name', 'username']
     filter_backends = [filters.SearchFilter]
     queryset = User.objects.filter(is_superuser=False)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def countries(request):
    logger.info(f"API: Countries request")
    try:
        queryset = dictionary_service.get_countries()
        #country_list = queryset.values('id', 'name','slug', 'country_uuid')
        result = {'success': True, 'countries': [c.as_dict() for c in queryset], 'size': queryset.count()}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def create_country(request):
    logger.info(f"API: New country creation request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        result = dictionary_service.create_mass_country(utils.get_postdata(request))
    except Exception as e:
        result = {'success': False, 'message': str(e)}
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def update_country(request,country_slug, country_uuid):
    logger.info(f"API: Update Country {country_slug}-{country_uuid} request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        country = Country.objects.get(country_uuid=country_uuid)
        country = dictionary_service.update_country(country, utils.get_postdata(request))
        result = {'success': True, 'country': LangageSerializer(country).data, 'url': country.get_absolute_url(), 'message': f"Word {country}"}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.error(f"Updating country {country_slug} [{country_uuid}] failed : {result}")
    return Response(data=result, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def langages(request):
    logger.info(f"API: Langages request")
    try:
        queryset = dictionary_service.get_langages()
        #langage_list = queryset.values('id', 'name','slug', 'langage_uuid')
        result = {'success': True, 'langages': [l.as_dict() for l in queryset], 'size': queryset.count()}
        #result = {'success': True, 'langages': langage_list}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def country_langages(request, country_slug, country_uuid):
    logger.info(f"API: Langages request")
    try:
        country = Country.objects.get(country_uuid=country_uuid)
        queryset = dictionary_service.get_langages_by_country(country)
        result = {'success': True, 'langages': [l.as_dict(True) for l in queryset], 'country': country.as_dict(True), 'size': queryset.count()}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def create_langage(request):
    logger.info(f"API: New Langage creation request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        result = dictionary_service.create_mass_langage(utils.get_postdata(request))
    except Exception as e:
        result = {'success': False, 'message': str(e)}
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def update_langage(request,langage_slug, langage_uuid):
    logger.info(f"API: Update Langage {langage_slug}-{langage_uuid} request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        langage = Langage.objects.get(langage_uuid=langage_uuid)
        langage = dictionary_service.update_langage(langage, utils.get_postdata(request))
        result = {'success': True, 'langage': LangageSerializer(langage).data, 'url': langage.get_absolute_url(), 'message': f"Word {langage}"}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.error(f"Updating langage {langage_slug} [{langage_uuid}] failed : {result}")
    return Response(data=result, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def create_word(request):
    logger.info(f"API: New Word creation request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        result = dictionary_service.create_mass_word(utils.get_postdata(request))
    except Exception as e:
        result = {'success': False, 'message': str(e)}
    return Response(data=result, status=status.HTTP_200_OK)






@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def update_word(request, word, word_uuid):
    logger.info(f"API: Update Word {word}-{word_uuid} request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        w = Word.objects.get(word_uuid=word_uuid)
        w = dictionary_service.update_word(w, utils.get_postdata(request))
        result = {'success': True, 'word': WordSerializer(w).data, 'url': w.get_absolute_url(), 'message': f"Word {w.word}"}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.error(f"Updating word {word} [{word_uuid}] failed : {result}")
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def search_langage(request):
    logger.info(f"API: Search Langages request")
    try:
        search_query = utils.get_request_data(request).get('search')
        query_list = dictionary_service.search_langages(search_query)
        langage_list = [lang.as_dict() for lang in query_list]
        result = {'success': True, 'langages': langage_list, 'query': search_query}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Langages request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def detect_langage(request):
    logger.info(f"API: Search Langages request")
    try:
        search_query = utils.get_request_data(request).get('search')
        result_dict = dictionary_service.find_word_langages(search_query)
        if result_dict['found']:
            result = {'success': True, 'found': True, 'langages': [lang.as_dict(True) for lang in result_dict['langages']], 'size': result_dict['size'], 'query': result_dict['query']}
        else:
            result = {'success': True, 'found': False, 'suggestions': [lang.as_dict(True) for lang in result_dict['suggestions']], 'size': result_dict['size'], 'query': result_dict['query']}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Langages request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def search_country(request):
    logger.info(f"API: Search Countries request")
    try:
        search_query = utils.get_request_data(request).get('search')
        query_list = dictionary_service.search_countries(search_query)
        country_list = [c.as_dict() for c in query_list]
        result = {'success': True, 'countries': country_list, 'query': search_query}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Country request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def search_word(request):
    logger.info(f"API: Search Words request")
    try:
        search_query = utils.get_request_data(request).get('word')
        query_list = dictionary_service.search_words(search_query)
        word_list = [w.as_dict() for w in query_list]
        result = {'success': True, 'words': word_list, 'query': search_query}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Word request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def find_country(request):
    logger.info(f"API: Find Country request")
    try:
        search_query = utils.get_request_data(request).get('country')
        country = dictionary_service.find_country(search_query)
        if country:
            result = {'success': True, 'country': country.as_dict(True), 'query': search_query, 'found': True}
        else:
            result = {'success': True, 'country': None, 'query': search_query, 'found': False}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Country request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def find_langage(request):
    logger.info(f"API: Find Langage request")
    try:
        search_query = utils.get_request_data(request).get('langage')
        langage = dictionary_service.find_langage(search_query)
        if langage:
            result = {'success': True, 'langage': langage.as_dict(True), 'query': search_query, 'found': True}
        else:
            result = {'success': True, 'langage': None, 'query': search_query, 'found': False}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Langage request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def find_word(request):
    logger.info(f"API: Find word request")
    try:
        search_query = utils.get_request_data(request).get('word')
        words = dictionary_service.find_words(search_query)
        result = {'success': True, 'words': [word.as_dict(True) for word in words], 'query': search_query, 'found': words.exists()}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search word request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def word_synonymes(request, word, word_uuid):
    logger.info(f"API: Search Synonymes request")
    try:
        w = Word.objects.get(word_uuid=word_uuid)
        query_list = dictionary_service.get_synonymes(w)
        word_list = [instance.as_dict() for instance in query_list]
        result = {'success': True, 'synonymes': word_list, 'word': w.as_dict()}
    except Exception as e:
        result = {'success': False, 'message': str(e)}
        logger.warn(f"API: Search Synonymes request failed : {e}")
    return Response(data=result, status=status.HTTP_200_OK)