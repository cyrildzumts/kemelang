from django import forms
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from dictionary.models import Langage, Country, Word, Definition, TranslationWord, Comment, Phrase



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
        

class UpdateWordForm(forms.ModelForm):
    
    class Meta:
        model = Word
        fields = Word.FORM_FIELDS
        
        
class CommentForm(forms.ModelForm):
    
    class Meta:
        model = Comment
        fields = Comment.FORM_FIELDS
        
        

class PhraseForm(forms.ModelForm):
    
    class Meta:
        model = Phrase
        fields = Phrase.FORM_FIELDS
        
        

class TranslationWordForm(forms.ModelForm):
    
    class Meta:
        model = TranslationWord
        fields = TranslationWord.FORM_FIELDS
        


class DefinitionForm(forms.ModelForm):
    
    class Meta:
        model = Definition
        fields = Definition.FORM_FIELDS