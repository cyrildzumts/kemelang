from django.conf.urls import include
from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from dashboard import views


app_name = "dashboard"
dashboard_patterns = [
    path('', views.dashboard, name="dashboard"),
    path('settings/', views.dashboard_settings, name="settings"),
    path('create-settings/', views.create_settings, name="settings-create"),
    path('update-settings/<uuid:setting_uuid>', views.update_settings, name="settings-update"),    
]

urlpatterns = [
    path('', include(dashboard_patterns)),
]