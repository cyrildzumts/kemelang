from django.conf.urls import include
from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from dashboard import views


app_name = "dashboard"
dashboard_patterns = [
    path('', views.dashboard, name="dashboard"),
    path('settings/', views.dashboard_settings, name="settings"),
    path('create-settings/', views.create_settings, name="settings-create"),
    path('users-home/group-create/',views.group_create, name='group-create'),
    path('users-home/group-detail/<int:pk>/',views.group_detail, name='group-detail'),
    path('users-home/group-delete/<int:pk>/',views.group_delete, name='group-delete'),
    path('users-home/group-update/<int:pk>/',views.group_update, name='group-update'),
    path('users-home/groups/',views.groups, name='groups'),
    
    #path('users-home/', views.users_home, name='users-home'),
    #path('users-home/partner-tokens/', views.partner_tokens, name='partner-tokens'),
    #path('users-home/partner-token-details/<uuid:token_uuid>/', views.partner_token_details, name='partner-token-details'),
    #path('users-home/partner-token-create', views.create_partner_token, name='partner-token-create'),
    #path('users-home/partner-token-update/<uuid:token_uuid>/', views.update_partner_token, name='partner-token-update'),
    path('user-searches/', views.search_users, name="user-searches"),
    path('users-home/tokens/', views.tokens, name='tokens'),
    path('users-home/generate-token/', views.generate_token, name='generate-token'),
    path('users-home/users/', views.users, name='users'),
    #path('users-home/translators/', views.translators, name='translators'),
    path('users-home/users/send-welcome-mail/<int:pk>/', views.send_welcome_mail, name='send-welcome-mail'),
    path('users-home/users/delete/<int:pk>/', views.user_delete, name='user-delete'),
    path('users-home/users/users-delete/', views.users_delete, name='users-delete'),
    path('users/create-user/', views.create_account, name='create-user'),
    path('users-home/users/detail/<int:pk>', views.user_details, name='user-detail'),
    path('update-settings/<uuid:setting_uuid>', views.update_settings, name="settings-update"),    
]

urlpatterns = [
    path('', include(dashboard_patterns)),
]