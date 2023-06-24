"""
Django settings for kemelang project.

Generated by 'django-admin startproject' using Django 3.2.16.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

from pathlib import Path
from django.utils.translation import gettext_lazy as _
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/


# SECURITY WARNING: keep the secret key used in production secret!

SECRET_KEY = os.environ['KEMELANG_SECRET_KEY']
SITE_NAME           =  os.environ.get('KEMELANG_SITE_NAME', 'KEMELANG')
SITE_HEADER_BG      = "#EFF3F2"
###### CELERY SETTINGS

CELERY_BROKER_URL   = os.environ.get('KEMELANG_CELERY_BROKER_URL')
CELERY_BACKEND      = os.environ.get('KEMELANG_CELERY_BACKEND')


CELERY_LOGGER_HANDLER_NAME = "async"
CELERY_LOGGER_NAME = "async"
CELERY_LOGGER_QUEUE = "kemelang-logger"
CELERY_LOGGER_EXCHANGE = "kemelang-logger"
CELERY_LOGGER_ROUTING_KEY = "kemelang-logger"

CELERY_DEFAULT_QUEUE = "kemelang-default"
CELERY_DEFAULT_EXCHANGE = "kemelang-default"
CELERY_DEFAULT_ROUTING_KEY = "kemelang-default"

CELERY_OUTGOING_MAIL_QUEUE = "kemelang-outgoing-mails"
CELERY_OUTGOING_MAIL_EXCHANGE = "kemelang-mail"
CELERY_OUTGOING_MAIL_ROUTING_KEY = "kemelang.mail.outgoing"


CELERY_IDENTIFICATION_QUEUE = "kemelang-ident"
CELERY_IDENTIFICATION_EXCHANGE = "kemelang-ident"
CELERY_IDENTIFICATION_ROUTING_KEY = "kemelang.identification"
CELERY_DEFAULT_EXCHANGE_TYPE = 'direct'

CELERY_NAMESPACE = 'CELERY'
CELERY_APP_NAME = 'kemelang'

###### CUSTOMS SETTINGS
ACCOUNT_ROOT_PATH = "/accounts/"
HOME_URL = "/"
DASHBOARD_ROOT_PATH = "/dashboard/"
USER_PATH = "/users/detail/"
ALLOWED_HOSTS = [os.getenv('KEMELANG_ALLOWED_HOST')]
SITE_HOST = os.getenv('KEMELANG_HOST')

#EMAIL SETTINGS
EMAIL_HOST = os.environ.get('KEMELANG_EMAIL_HOST')
EMAIL_PORT = os.environ.get('KEMELANG_EMAIL_PORT')
EMAIL_HOST_PASSWORD = os.environ.get('KEMELANG_EMAIL_PASSWORD')
EMAIL_HOST_USER = os.environ.get('KEMELANG_EMAIL_USER')
DEFAULT_FROM_EMAIL = os.environ.get('KEMELANG_DEFAULT_FROM_EMAIL', 'KEMELANG <info@kemelang.com>')
CONTACT_MAIL =  os.environ.get('KEMELANG_CONTACT_MAIL')
ADMIN_EXTERNAL_EMAIL = os.environ.get("KEMELANG_ADMIN_EXTERNAL_EMAIL")
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_BACKEND = os.environ.get('KEMELANG_EMAIL_BACKEND')

DJANGO_EMAIL_TEMPLATE = "tags/template_email_new.html"
DJANGO_EMAIL_TO_ADMIN_TEMPLATE = "tags/admin_newuser_template_email.html"
DJANGO_EMAIL_TEMPLATE_TXT = "tags/template_email.txt"
DJANGO_WELCOME_EMAIL_TEMPLATE = "welcome_email_new.html"
DJANGO_VALIDATION_EMAIL_TEMPLATE = "validation_email_new.html"

# SECURITY WARNING: don't run with debug turned on in production!
SESSION_COOKIE_AGE = 86400


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.postgres',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'api.apps.ApiConfig',
    'accounts',
    'core.apps.CoreConfig',
    'dictionary.apps.DictionaryConfig',
    'dashboard.apps.DashboardConfig',
]

# RESTFRAMEWORK SETTINGS
REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ]
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'kemelang.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.template.context_processors.i18n',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'accounts.context_processors.account_context',
                'kemelang.context_processors.site_context',
                'core.context_processors.ui_strings_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'kemelang.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'dev': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'kemelang.db'),
    },
    'production': {
	'ENGINE':  os.environ.get('KEMELANG_DATABASE_ENGINE', 'django.db.backends.postgresql'),
	'NAME'	:  os.environ.get('KEMELANG_DATABASE_NAME'),
	'USER'	:  os.environ.get('KEMELANG_DATABASE_USERNAME'),
	'PASSWORD':  os.environ.get('KEMELANG_DATABASE_PW'),
	'HOST'	:  os.environ.get('KEMELANG_DATABASE_HOST') ,
	'PORT' 	:  os.environ.get('KEMELANG_DATABASE_PORT'),
    'OPTIONS' : {
        'sslmode': 'require'
    },
    'TEST'  :{
        'NAME': os.getenv('KEMELANG_TEST_DATABASE', 'test_kemelang_db'),
    },
   },

}
DEFAULT_DATABASE = os.environ.get('DJANGO_DATABASE', 'dev')
DATABASES['default'] = DATABASES[DEFAULT_DATABASE]
DEV_MODE = DEFAULT_DATABASE == 'dev'
DEBUG = os.environ.get(f"{SITE_NAME}_DEBUG",'false') == 'true'
ALLOW_GOOGLE_ANALYTICS = os.environ.get('KEMELANG_ALLOW_GOOGLE_ANALYTICS', 'false') == 'true'


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

#### CACHING 

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
TEMPLATE_CACHE_TIMEOUT = 600

#### LOGGING 
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'console': {
            'format': '{asctime} {levelname} {module} {message}',
            'style': '{',
        },
        'file': {
            'format': '{asctime} {levelname} {module} {message}',
            'style': '{',
        },
        'async': {
            'format': '{module} {message}',
            'style': '{',
        },
    },

    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'console'
        },
        'async':{
            'level': 'INFO',
            'class': 'core.logging.handlers.AsyncLoggingHandler',
            'formatter': 'async',
            'queue': CELERY_LOGGER_QUEUE,
            'routing_key': CELERY_LOGGER_ROUTING_KEY,
            'exchange': CELERY_LOGGER_EXCHANGE
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'formatter': 'file',
            'filename':'logs/kemelang.log',
            'when' : 'midnight'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        '' : {
            'level': 'DEBUG',
            'handlers': ['console', 'file'],
            'propagate': False,
        },
        'async':{
            'level': 'INFO',
            'handlers': ['file'],
            'propagate': False
        },
        'django': {
            'level': 'WARNING',
            'handlers': ['file'],
            'propagate': True,
        },
        'django.request': {
            'handlers': ['mail_admins', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.template': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': True,
        },
        'PIL':{
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        }
    }
}


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'fr'
LANGUAGES = (
    ('fr',_('French')),
    ('en',_('English')),
)
LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale')
]

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static/")
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "staticfiles"),
]

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
