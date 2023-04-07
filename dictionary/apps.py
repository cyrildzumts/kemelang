from django.apps import AppConfig
import django
import logging

logger = logging.getLogger(__name__)

class DictionaryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dictionary'
    
    def ready(self):
        import dictionary.signals
        logger.info(f"Dictionary Started using Django Version {django.get_version()}")
