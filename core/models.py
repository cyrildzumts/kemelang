from django.db import models
from core import constants as Constants
# Create your models here.


class ABTest(models.Model):
    action = models.IntegerField(choices=Constants.ABTEST_ACTIONS)
    hits = models.PositiveIntegerField(default=0)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-hits','-modified_at']