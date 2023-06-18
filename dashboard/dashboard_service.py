from dashboard.models import Settings
from dashboard.forms import SettingsForm
import logging

logger = logging.getLogger(__name__)

def get_setting():
    setting_set = Settings.objects.all()
    setting = None
    if setting_set.exists():
        setting = setting_set.first()
    return setting

def create_setting(data):
    form = SettingsForm(data)
    if form.is_valid():
        logger.info("Setting created")
        return form.save()
    logger.warning(f"Error on creating Setting : {form.errors.as_data()}")
    return None


def update_setting(data, setting):
    form = SettingsForm(data, instance=setting)
    if form.is_valid():
        logger.info("Setting updated")
        return form.save()
    logger.warning(f"Error on updating Setting : {form.errors.as_data()}")
    return None