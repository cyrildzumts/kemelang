from typing import Any, Dict
from django import forms
from accounts.models import Account
from django.contrib.auth.models import Group, Permission
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from dashboard.models import Settings


class SettingsForm(forms.ModelForm):
    
    maintenance_mode = forms.BooleanField(required=False, initial=True)
    allow_anonyme_user = forms.BooleanField(required=False, initial=True)
    class Meta:
        model = Settings
        fields = Settings.FORM_FIELDS
        


class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ("user","date_of_birth","telefon",
                  "newsletter","account_type",
                  "email_validated", )
        

class TokenForm(forms.Form):
    user = forms.IntegerField()


class GroupFormCreation(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name', 'permissions']