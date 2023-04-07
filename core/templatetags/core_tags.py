from django import template
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _
from kemelang import utils
from dictionary.models import Country, Langage
from accounts import constants as ACCOUNT_CONSTANTS
from core import renderers
import logging
import re
import json

NAME_PATTERN = re.compile(r"[,.-_\\]")

logger = logging.getLogger(__name__)
register = template.Library()


@register.simple_tag
def core_trans(value):
    if isinstance(value, str):
        return _(value)
    return value

@register.filter
def access_dict(mapping, key):
    if isinstance(mapping, dict) :
        return mapping.get(key, None)
    return None

@register.filter
def mapping_key(key, mapping):
    if isinstance(mapping, dict) :
        return mapping.get(key, None)
    return None


@register.simple_tag(takes_context=True)
def filter_conf(context,field, key=None):
    value = None
    if key:
        value = context.get('FILTER_CONFIG', {}).get(field, {}).get(key)
    else:
        value = context.get('FILTER_CONFIG', {}).get(field, {})
    return value




@register.filter
def account_type_key(value):
    k,v = utils.find_element_by_value_in_tuples(value, ACCOUNT_CONSTANTS.ACCOUNT_TYPE)
    if k is None:
        return value
    return k


@register.filter
def account_type_value(key):
    k,v = utils.find_element_by_key_in_tuples(key, ACCOUNT_CONSTANTS.ACCOUNT_TYPE)
    if v is None:
        return key
    return v

@register.simple_tag
@register.filter
def splitize(value):
    if not isinstance(value, str):
        return value
    result = " ".join(NAME_PATTERN.split(value))
    return result

@register.simple_tag(takes_context=True)
def json_ld(context, structured_data):
    request = context['request']
    structured_data['url'] = request.build_absolute_uri()
    indent = '\n'
    dumped = json.dumps(structured_data, ensure_ascii=False, indent=True, sort_keys=True)
    script_tag = f"\n<script type=\"application/ld+json\">{indent}{dumped}{indent}</script>"
    return mark_safe(script_tag)





@register.simple_tag
@register.filter
def render_tag(json_field):
    if isinstance(json_field, dict):
        return renderers.render_tag(json_field)
    elif not hasattr(json_field, 'description') or not isinstance(json_field.description, dict):
        return json_field
    return renderers.render_tag(json_field.description)


@register.simple_tag
@register.filter
def render_description(model):
    if not hasattr(model, 'description') or not isinstance(product.description_json, dict):
        return product
    return renderers.render_summary(product.description_json)


