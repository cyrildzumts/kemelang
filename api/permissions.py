from rest_framework import permissions as REST_PERMS
from core import permissions as PERMISSIONS


class TranslatorPermission(REST_PERMS.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm(PERMISSIONS.DASHBOARD_ACCESS_TRANSLATOR_PERM)
        