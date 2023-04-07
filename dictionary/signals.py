from django.dispatch import receiver
from django.utils.text import slugify
from django.db.models.signals import post_save, pre_save
from dictionary.models import Country, Langage


@receiver(pre_save, sender=Langage)
def generate_lang_slug(sender, instance, *args, **kwargs):
    instance.slug = slugify( instance.name)


@receiver(pre_save, sender=Country)
def generate_country_slug(sender, instance, *args, **kwargs):
    instance.slug = slugify( instance.name)