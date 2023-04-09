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
        country = dictionary_service.create_country(utils.get_postdata(request))
        result = {'success': True, 'country': CountrySerializer(country).data, 'url': country.get_absolute_url(), 'message': f"Country {country.name}"}
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
        result = {'success': True, 'countries': [l.as_dict() for l in queryset], 'size': queryset.count()}
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
    logger.info(f"API: New langage creation request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        langage = dictionary_service.create_langage(utils.get_postdata(request))
        result = {'success': True, 'langage': LangageSerializer(langage).data, 'url': langage.get_absolute_url(), 'message': f"Langage {langage.name}"}
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
    logger.info(f"API: New word creation request")
    if request.method != 'POST':
        return Response({'status': False, 'errror': 'Bad request. Use POST instead'}, status=status.HTTP_400_BAD_REQUEST)
    result = None
    try:
        word = dictionary_service.create_word(utils.get_postdata(request))
        result = {'success': True, 'word': WordSerializer(word).data, 'url': word.get_absolute_url(), 'message': f"Word {word.word}"}
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