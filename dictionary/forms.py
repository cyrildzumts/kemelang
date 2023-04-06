from django import forms
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from dictionary.models import Langage, Country, Word, Definition



class LangageForm(forms.ModelForm):
    
    class Meta:
        model = Langage
        fields = Langage.FORM_FIELDS
        
        
        
class CountryForm(forms.ModelForm):
    
    class Meta:
        model = Country
        fields = Country.FORM_FIELDS



class WordForm(forms.ModelForm):
    
    class Meta:
        model = Word
        fields = Word.FORM_FIELDS
        


class DefinitionForm(forms.ModelForm):
    
    class Meta:
        model = Definition
        fields = Definition.FORM_FIELDS