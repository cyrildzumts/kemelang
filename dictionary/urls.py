from django.conf.urls import url, include
from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from dictionary import views


app_name = "dictionary"
dictionary_patterns = [
    path('', views.dict_home, name="dict-home"),
    path('countries/', views.countries, name="countries"),
    path('langages/', views.langages, name="langages"),
    path('create-country/', views.create_country, name="country-create"),
    path('create-langage/', views.create_langage, name="langage-create"),
    path('create-word/', views.create_word, name="word-create"),
    path('create-translation/', views.create_translation, name="translation-create"),
    path('update-word/<str:word>/<uuid:word_uuid>/', views.update_word, name="word-update"),
    path('update-country/<slug:country_slug>/<uuid:country_uuid>/', views.update_country, name="country-update"),
    path('update-langage/<slug:langage_slug>/<uuid:langage_uuid>/', views.update_langage, name="langage-update"),
    path('countries/<slug:country_slug>/', views.country_detail, name="country"),
    path('langages/<slug:langage_slug>/', views.langage_details, name="langage"),
    path('word/<str:word>/<uuid:word_uuid>/', views.word_details, name="word"),
    
]

urlpatterns = [
    path('', include(dictionary_patterns)),
]