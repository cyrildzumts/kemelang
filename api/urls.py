from django.conf.urls import url, include
from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from api import views


app_name = "api"
api_patterns = [
    path('countries/', views.countries, name="countries"),
    path('langages/', views.langages, name="langages"),
    path('create-country/', views.create_country, name="country-create"),
    path('create-langage/', views.create_langage, name="langage-create"),
    path('create-word/', views.create_word, name="word-create"),
    path('update-word/<str:word>/<uuid:word_uuid>/', views.update_word, name="word-update"),
    path('update-country/<slug:country_slug>/<uuid:country_uuid>/', views.update_country, name="country-update"),
    path('update-langage/<slug:langage_slug>/<uuid:langage_uuid>/', views.update_langage, name="langage-update"),
    path('search-langage/', views.search_langage, name="langage-detail"),
    
]

urlpatterns = [
    path('', include(api_patterns)),
]