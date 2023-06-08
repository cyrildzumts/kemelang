import json
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.shortcuts import reverse
from django.core.serializers.json import DjangoJSONEncoder
from dictionary import constants

# Create your models here.


def upload_word_audio_to(instance, filename):
    return f"dictionary/{instance.langage.name}/{instance.word}/{filename}"


def upload_definition_audio_to(instance, filename):
    return f"dictionary/{instance.langage.name}/{instance.word}/definitions/{filename}"


class Langage(models.Model):
    name = models.CharField(max_length=constants.NAME_MAX_LENGTH)
    description = models.JSONField(encoder=DjangoJSONEncoder,blank=True, null=True)
    alphabet = models.JSONField(encoder=DjangoJSONEncoder,blank=True, null=True)
    countries = models.ManyToManyField('Country', related_name='langages', blank=True)
    slug = models.SlugField(max_length=constants.NAME_MAX_LENGTH, blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_langages', blank=True, null=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_langages', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    langage_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['name', 'description','alphabet', 'countries', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['name']
    FORM_MAANAGEMENT_FIELDS = {
        'fields' : [
            {'field': 'name','tag': 'input','type':'text','max-length': constants.NAME_MAX_LENGTH, 'required': True},
            {'field': 'description', 'tag': 'input', 'type':'text','max-length': None, 'required': False},
            {'field': 'countries', 'tag': 'select', 'selection': 'multiple', 'required': False},
            {'field': 'added_by', 'tag': 'input', 'type':'hidden','max-length': None, 'required': False},
        ]
    }
    
    class Meta:
        ordering = ['name', '-created_at']
    
    def __str__(self) -> str:
        return self.name
    
    @property
    def alphabet_to_json(self):
        if self.alphabet is None:
            return ''
        return json.dumps(self.alphabet)
    
    @property
    def description_to_json(self):
        if self.description is None:
            return ''
        return json.dumps(self.description)
        
    
    
    def get_absolute_url(self):
        return reverse("dictionary:langage", kwargs={"langage_slug": self.slug})
    
    def get_update_url(self):
        return reverse("dictionary:langage-update", kwargs={"langage_slug": self.slug, 'langage_uuid': self.langage_uuid})
    
    def as_dict(self, filter_foreign_key=False):
        if filter_foreign_key:
            return {
                'id': self.pk, 
                'type': 'Langage', 
                'name': self.name, 
                'slug': self.slug, 
                'description': self.description_to_json,
                'langage_uuid': self.langage_uuid
            }
        return {
            'id': self.pk, 
            'type': 'Langage', 
            'name': self.name, 
            'slug': self.slug, 
            'description': self.description_to_json, 
            'countries': [c.as_dict(True) for c in self.countries.all()], 
            'langage_uuid': self.langage_uuid
        }
    


class Country(models.Model):
    name = models.CharField(max_length=constants.NAME_MAX_LENGTH)
    description = models.JSONField(blank=True, null=True)
    slug = models.SlugField(max_length=constants.NAME_MAX_LENGTH, blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_countries', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_countries', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    country_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['name', 'description', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['name', 'description']
    FORM_MAANAGEMENT_FIELDS = {
        'fields' : [
            {'field': 'name','tag': 'input','type':'text','max-length': constants.NAME_MAX_LENGTH, 'required': True},
            {'field': 'description', 'tag': 'input', 'type':'text','max-length': None, 'required': False},
            {'field': 'added_by', 'tag': 'input', 'type':'hidden','max-length': None, 'required': False},
        ]
    }
    
    class Meta:
        ordering = ['name', '-created_at']
    
    def __str__(self) -> str:
        return self.name
    
    @property
    def description_to_json(self):
        if self.description is None:
            return ''
        return json.dumps(self.description)
    
    def get_absolute_url(self):
        return reverse("dictionary:country", kwargs={"country_slug": self.slug})
    
    def get_update_url(self):
        return reverse("dictionary:country-update", kwargs={"country_slug": self.slug, 'country_uuid': self.country_uuid})
    
    
    def as_dict(self, filter_foreign_key=False):
        if filter_foreign_key:
            return {'id': self.pk, 'type': 'Country', 'name': self.name, 'slug': self.slug, 'description': self.description, 'country_uuid': self.country_uuid}
        return {'id': self.pk, 'type': 'Country', 'name': self.name, 'slug': self.slug,'description': self.description, 'langages': [l.as_dict(True) for l in self.langages.all()], 'country_uuid': self.country_uuid}
    

class Word(models.Model):
    word = models.CharField(max_length=constants.WORD_MAX_LENGTH)
    transliteration = models.CharField(max_length=constants.WORD_MAX_LENGTH, blank=True, null=True)
    audio = models.FileField(upload_to=upload_word_audio_to, blank=True, null=True)
    synonymes = models.ManyToManyField('self', blank=True)
    translations = models.ManyToManyField('self', blank=True)
    langage = models.ForeignKey(Langage, on_delete=models.CASCADE, related_name='words')
    description = models.JSONField(blank=True, null=True)
    view_count = models.IntegerField(default=0)
    word_type = models.IntegerField(default=constants.WORD_TYPE_NOUN, choices=constants.WORD_TYPES, blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_words', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_words', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    word_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['word','audio', 'description','synonymes','transliteration','word_type', 'langage', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['word', 'description']
    
    class Meta:
        ordering = ['word', '-created_at']
    
    def __str__(self) -> str:
        return self.word
    
    @property
    def description_to_json(self):
        if self.description is None:
            return ''
        return json.dumps(self.description)
    
    def get_absolute_url(self):
        return reverse("dictionary:word", kwargs={"word": self.word, 'word_uuid': self.word_uuid})
    
    def get_update_url(self):
        return reverse("dictionary:word-update", kwargs={"word": self.word, 'word_uuid': self.word_uuid})
    
    
    def as_dict(self, filter_foreign_key=False):
        return {
            'id': self.pk, 
            'type': 'Word', 
            'word_type': self.word_type,
            'word': self.word,
            'transliteration': self.transliteration,
            'description': self.description, 
            'langage': self.langage.as_dict(True), 
            'word_uuid': self.word_uuid
        }


class Definition(models.Model):
    word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='definitions')
    description = models.JSONField()
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_definitions', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_definitions', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    definition_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['word', 'description', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['word', 'description']
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return self.word
    
    @property
    def description_to_json(self):
        if self.description is None:
            return ''
        return json.dumps(self.description)
    
    def as_dict(self, filter_foreign_key=False):
        return {'id': self.pk, 'type': 'Definition', 'word': self.word.as_dict(),'description': self.description,'definition_uuid': self.definition_uuid}
    


class Comment(models.Model):
    word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='comments')
    comment = models.JSONField()
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_comments', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_comments', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    comment_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['word', 'comment', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['name', 'comment']
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return self.word
    
    @property
    def comment_to_json(self):
        if self.comment is None:
            return ''
        return json.dumps(self.comment)
    
    def as_dict(self, filter_foreign_key=False):
        return {'id': self.pk, 'type': 'Comment', 'word': self.word.as_dict(),'comment': self.comment,'comment_uuid': self.comment_uuid}


class Phrase(models.Model):
    word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='phrases')
    audio = models.FileField(upload_to=upload_definition_audio_to, blank=True, null=True)
    content = models.JSONField()
    description = models.JSONField(blank=True, null=True)
    langage = models.ForeignKey(Langage, on_delete=models.CASCADE, related_name='phrases')
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_phrases', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_phrases', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    phrase_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['word','audio', 'content', 'description', 'langage', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['name','content', 'description']
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return self.word
    
    @property
    def content_to_json(self):
        if self.content is None:
            return ''
        return json.dumps(self.content)
    
    @property
    def description_to_json(self):
        if self.description is None:
            return ''
        return json.dumps(self.description)
    
    def as_dict(self, filter_foreign_key=False):
        return {'id': self.pk, 'type': 'Phrase', 'word': self.word.as_dict(),'content': self.content, 'description': self.description,'phrase_uuid': self.phrase_uuid}
    
    
    
class TranslationWord(models.Model):
    source_word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='translations_source')
    target_word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='translations_target')
    source_langage = models.ForeignKey('Langage', on_delete=models.CASCADE, related_name='translations')
    target_langage = models.ForeignKey('Langage', on_delete=models.CASCADE, related_name='translations_target')
    comment = models.CharField(max_length=constants.TRANSLATION_COMMENT_MAX_LENGTH)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_translations', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_translations', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    transaltion_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    
    class Meta:
        ordering = ['-created_at']
    
    FORM_FIELDS = ['source_word','target_word', 'source_langage', 'target_langage', 'comment', 'added_by', 'changed_by']
    
    def as_dict(self, filter_foreign_key=False):
        return {'id': self.pk, 'type': 'TranslationWord', 'source_word': self.source_word.as_dict(),'target_word': self.target_word.as_dict(), 'source_langage': self.source_langage.as_dict(True),'target_langage': self.target_langage.as_dict(True),'comment': self.comment, 'transaltion_uuid': self.transaltion_uuid}
    