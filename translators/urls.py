from django.conf.urls import include
from django.urls import path
from translators import views


app_name = "translators"
translator_patterns = [
    path('', views.translator_home, name="translators"), 
]

urlpatterns = [
    path('', include(translator_patterns)),
]