from core.resources import ui_strings


def ui_strings_context(request):

    context = {
        'UI_STRINGS_CONTEXT': ui_strings.UI_STRINGS_CONTEXT
    }
    return context