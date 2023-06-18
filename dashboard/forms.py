from django import forms
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from dashboard.models import Settings


class SettingsForm(forms.ModelForm):
    
    class Meta:
        model = Settings
        fields = Settings.FORM_FIELDS

