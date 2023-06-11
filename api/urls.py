from django.conf.urls import include
from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from api import views


app_name = "api"
api_patterns = [
    path('countries/', views.countries, name="countries"),
    path('langages/', views.langages, name="langages"),
    path('create-country/', views.create_country, name="country-create"),
    path('create-langage/', views.create_langage, name="langage-create"),
    path('create-translation/', views.create_translation, name="translation-create"),
    path('add-translations/<uuid:word_uuid>/', views.add_translations, name="translation-add"),
    path('add-synonymes/<uuid:word_uuid>/', views.add_synonymes, name="synonyme-add"),
    path('search-langage/', views.search_langage, name="langage-search"),
    path('create-word/', views.create_word, name="word-create"),
    path('search-word/', views.search_word, name="word-search"),
    path('search-country/', views.search_country, name="country-search"),
    path('detect-langage/', views.detect_langage, name="langage-detect"),
    path('find-country/', views.find_country, name="country-find"),
    path('find-langage/', views.find_langage, name="langage-find"),
    path('find-word/', views.find_word, name="word-find"),
    path('translate/', views.translate, name='translate'),
    path('country-langages/<slug:country_slug>/<uuid:country_uuid>/', views.country_langages, name="country-langages"),
    path('update-word/<str:word>/<uuid:word_uuid>/', views.update_word, name="word-update"),
    path('update-country/<slug:country_slug>/<uuid:country_uuid>/', views.update_country, name="country-update"),
    path('update-langage/<slug:langage_slug>/<uuid:langage_uuid>/', views.update_langage, name="langage-update"),
    path('word-synonymes/<str:word>/<uuid:word_uuid>/', views.word_synonymes, name="word-synonymes"),
    
]

urlpatterns = [
    path('', include(api_patterns)),
]