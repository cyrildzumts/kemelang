from rest_framework import permissions as REST_PERMS
from core import permissions as PERMISSIONS
import logging


logger = logging.getLogger(__name__)
class TranslatorPermission(REST_PERMS.BasePermission):
    def has_permission(self, request, view):
        logger.info(f"Translator Permissions  Checker for user : {request.user}")
        return request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_TRANSLATOR_PERM)
        