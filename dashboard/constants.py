


PERMISSION_DASHBOAD = [
    ('can_access_dashboad', 'Can access Dashboard'),
    ('can_access_translator', 'Can access Translator Page'),
    ('can_view_dashboad', 'Can access Dashboard'),
    ('can_access_maintenance_mode', 'Can access the site on Maintenance Mode'),
    ('can_create_token', 'Can create Token'),
]


DASHBOARD_GLOBALS_PREFIX = "dashboard"
DASHBOARD_GROUP_CONTEXT = {
    'GROUPS_URL'               : f"{DASHBOARD_GLOBALS_PREFIX}:groups",
    'GROUP_URL'                : f"{DASHBOARD_GLOBALS_PREFIX}:group-detail",
    'GROUP_UPDATE_URL'         : f"{DASHBOARD_GLOBALS_PREFIX}:group-update",
    'GROUP_DELETE_URL'         : f"{DASHBOARD_GLOBALS_PREFIX}:group-delete",
    'GROUPS_DELETE_URL'        : f"{DASHBOARD_GLOBALS_PREFIX}:groups-delete",
    'GROUP_CREATE_URL'         : f"{DASHBOARD_GLOBALS_PREFIX}:group-create",
}