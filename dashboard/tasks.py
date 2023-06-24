from celery import shared_task
from django.db.models import Q,F
from dashboard.models import Report
from django.utils import timezone
import datetime



@shared_task
def log_translations(data):
    today = datetime.date.today()
    report, created = Report.objects.get_or_create(created_at=today, defaults={'translations': 1})
    if not created:
        report.translations = F('translations') + 1
        report.save()
    return