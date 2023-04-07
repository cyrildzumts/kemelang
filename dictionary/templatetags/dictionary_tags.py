from django import template
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _
from kemelang import utils
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



@register.filter
def action_value(key):
    k,v = utils.find_element_by_key_in_tuples(key, INVENTORY_CONSTANTS.ABTEST_ACTIONS)
    if v is None:
        return key
    return v



@register.filter
def subscription_title(key):
    return SUBSCRIPTION_DESCRIPTION_CTX.get(key, {}).get('title', key)


@register.filter
def subscription_subtitle(key):
    return SUBSCRIPTION_DESCRIPTION_CTX.get(key, {}).get('subtitle', key)


@register.filter
def subscription_attr_title(key):
    return SUBSCRIPTION_ATTR_DESCRIPTION_CTX.get(key, {}).get('display_name', key)


@register.filter
def subscription_attr_description(key):
    return SUBSCRIPTION_ATTR_DESCRIPTION_CTX.get(key, {}).get('description', key)


@register.simple_tag
@register.filter
def render_tag(product):
    if isinstance(product, dict):
        return renderers.render_tag(product)
    elif not hasattr(product, 'description_json') or not isinstance(product.description_json, dict):
        return product
    return renderers.render_tag(product.description_json)


@register.simple_tag
@register.filter
def render_product_summary(product):
    if not hasattr(product, 'description_json') or not isinstance(product.description_json, dict):
        return product
    return renderers.render_summary(product.description_json)





@register.filter
def order_status_cls(status):
    return ORDER_STATUS_CSS_CLS_MAP[status]


@register.filter
def shipment_status_cls(status):
    return SHIPMENT_STATUS_CSS_CLS_MAP[status]



@register.filter
def payment_status_cls(status):
    return PAYMENT_STATUS_CSS_CLS_MAP[status]