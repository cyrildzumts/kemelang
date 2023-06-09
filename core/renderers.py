from core.renders_conf import BLOCK_MAPPING, SUMMARY_TAG
from django.utils.safestring import mark_safe

def render_tag(data_dict):
    html_blocks = [BLOCK_MAPPING[block.get('type')](block) for block in data_dict.get('blocks')]
    return mark_safe("".join(html_blocks))


def render_summary(data_dict):
    paragraph = None
    for block in data_dict.get('blocks'):
        if block.get('type') == SUMMARY_TAG:
            paragraph = block
            break
    if paragraph is not None:
        return mark_safe(BLOCK_MAPPING[paragraph.get('type')](paragraph))
    return ""