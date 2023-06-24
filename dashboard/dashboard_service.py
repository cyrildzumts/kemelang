from dashboard.models import Settings
from dashboard.forms import SettingsForm
from core import service
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
        logger.info(f"Setting created with data: {data} - Clean Data : {form.cleaned_data}")
        return form.save()
    logger.warning(f"Error on creating Setting : {form.errors.as_data()}")
    return None


def update_setting(data, setting):
    form = SettingsForm(data, instance=setting)
    if form.is_valid():
        logger.info(f"Setting updated with data: {data} - Clean Data : {form.cleaned_data} - Changed Data : {form.changed_data}")
        return form.save()
    else:
        logger.warning(f"Error on updating Setting : {form.errors.as_data()}")
    return None
    #return service.update_instance(Settings, setting, data)
    

def can_access_on_maintenance(user):
    
    setting = get_setting()
    maintenance_mode_active = setting is None or setting.maintenance_mode is None or setting.maintenance_mode
    is_superuser = user.is_superuser or user.is_staff
    return is_superuser or not maintenance_mode_active