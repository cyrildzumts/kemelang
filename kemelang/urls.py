"""kemelang URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf.urls.i18n import i18n_patterns
from django.urls import path
from django.conf.urls import include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from accounts import views as accounts_views
from kemelang import views


urlpatterns_i18n = i18n_patterns(
    *[
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    # path('login/', accounts_views.login, name='login'),
    # path('logout/', accounts_views.logout, name='logout'),
    # path('register/', accounts_views.register, name='register'),
    
    path('accounts/', include('accounts.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('translators/', include('translators.urls')),
    path('faq/', views.faq, name='faq'),
    path('kemelang-admin-board/', admin.site.urls),
    path('dictionary/', include('dictionary.urls')),
], prefix_default_language=False
)



urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),
    path('api/', include('api.urls', namespace='api')),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    #path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name="django.contrib.sitemaps.views.sitemap"),
    *urlpatterns_i18n
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
