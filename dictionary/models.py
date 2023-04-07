import uuid
from django.db import models
from django.contrib.auth.models import User
from django.shortcuts import reverse
from dictionary import constants

# Create your models here.


def upload_word_audio_to(instance, filename):
    return f"dictionary/{instance.langage.name}/{instance.word}/{filename}"


def upload_definition_audio_to(instance, filename):
    return f"dictionary/{instance.langage.name}/{instance.word}/definitions/{filename}"


class Langage(models.Model):
    name = models.CharField(max_length=constants.NAME_MAX_LENGTH)
    description = models.JSONField(blank=True, null=True)
    countries = models.ManyToManyField('Country', related_name='langages', null=True, blank=True)
    slug = models.SlugField(max_length=constants.NAME_MAX_LENGTH, blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_langages', blank=True, null=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_langages', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    langage_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['name', 'description', 'countries', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['name']
    
    def __str__(self) -> str:
        return self.name
    
    def get_absolute_url(self):
        return reverse("dictionary:langage-detail", kwargs={"langage_slug": self.slug})
    
    def get_update_url(self):
        return reverse("dictionary:langage-update", kwargs={"langage_slug": self.slug, 'langage_uuid': self.langage_uuid})
    


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
    
    def __str__(self) -> str:
        return self.name
    
    def get_absolute_url(self):
        return reverse("dictionary:country-detail", kwargs={"country_slug": self.slug})
    
    def get_update_url(self):
        return reverse("dictionary:country-update", kwargs={"country_slug": self.slug, 'country_uuid': self.country_uuid})
    

class Word(models.Model):
    word = models.CharField(max_length=constants.WORD_MAX_LENGTH)
    audio = models.FileField(upload_to=upload_word_audio_to, blank=True, null=True)
    synonyme = models.ForeignKey('self', on_delete=models.SET_NULL, related_name='synonymes', blank=True, null=True)
    langage = models.ForeignKey(Langage, on_delete=models.CASCADE, related_name='words')
    description = models.JSONField(blank=True, null=True)
    view_count = models.IntegerField(default=0)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_words', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_words', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    word_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['word','audio', 'description','synonyme', 'langage', 'added_by', 'changed_by']
    SEARCH_FIELDS = ['word', 'description']
    
    def __str__(self) -> str:
        return self.word
    
    def get_absolute_url(self):
        return reverse("dictionary:word-detail", kwargs={"word": self.word, 'word_uuid': self.word_uuid})
    
    def get_update_url(self):
        return reverse("dictionary:word-update", kwargs={"word": self.word, 'word_uuid': self.word_uuid})


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
    
    def __str__(self) -> str:
        return self.word
    


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
    
    def __str__(self) -> str:
        return self.word
    


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
    
    def __str__(self) -> str:
        return self.word
    
class TranslationWord(models.Model):
    source_word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='translations')
    target_word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='translations_target')
    source_langage = models.ForeignKey('Langage', on_delete=models.CASCADE, related_name='translations')
    target_langage = models.ForeignKey('Langage', on_delete=models.CASCADE, related_name='translations_target')
    comment = models.CharField(max_length=constants.TRANSLATION_COMMENT_MAX_LENGTH)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_translations', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_translations', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    transaltion_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    
    FORM_FIELDS = ['source_word','target_word', 'source_langage', 'target_langage', 'comment', 'added_by', 'changed_by']
    