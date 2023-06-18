from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.

class Settings(models.Model):
    maintenance_mode = models.BooleanField(default=True, blank=True, null=True)
    allow_anonyme_user = models.BooleanField(default=True, blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='added_words', null=True, blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='changed_words', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    setting_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    FORM_FIELDS = ['maintenance_mode', 'allow_anonyme_user', 'added_by', 'changed_by']
