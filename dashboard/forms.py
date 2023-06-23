from typing import Any, Dict
from django import forms
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from dashboard.models import Settings


class SettingsForm(forms.ModelForm):
    
    maintenance_mode = forms.BooleanField(required=False, initial=True)
    
    class Meta:
        model = Settings
        fields = Settings.FORM_FIELDS
        
    
        
    
    def clean_maintenance_mode(self):
        value = self.cleaned_data.get('maintenance_mode')
        if value is None:
            value = True
        return value

    def clean(self):
        return super().clean()