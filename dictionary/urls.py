from django.conf.urls import url, include
from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from dictionary import views


app_name = "dictionary"
dictionary_patterns = [
    path('', views.dict_home, name="dict-home"),
    path('create-country/', views.create_country, name="country-create"),
    path('create-langage/', views.create_langage, name="langage-create"),
    path('create-word/', views.create_word, name="word-create"),
    path('country/<slug:country_slug>/', views.country_detail, name="country-detail"),
    path('langage/<slug:langage_slug>/', views.langage_details, name="langage-detail"),
    path('word/<std:word>/<uuid:word_uuid>/', views.word_details, name="word-detail"),
    
]

urlpatterns = [
    path('', include(dictionary_patterns)),
]