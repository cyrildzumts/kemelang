from django.forms.models import inlineformset_factory
from django.shortcuts import get_object_or_404, redirect, render

from dictionary.models import Comment, Country, Definition, Langage, Word, TranslationWord, Phrase
from dictionary import constants as DICT_CONSTANTS
# Create your views here.


def dict_home(request):
    template_name = "dictionary/dict.html"
    context = {
        'page_title': "Quiz Home",
        'countrie_list': Country.objects.all()
    }
    return render(request, template_name, context)


def dict(request):
    template_name = "dictionary/dict.html"
    context = {
        'page_title': "Quiz Home",
        'countrie_list': Country.objects.all()
    }
    return render(request, template_name, context)


def create_country(request):
    template_name = "dictionary/create_country.html"
    context = {
        'page_title': "New Country",
    }
    return render(request, template_name, context)



def create_langage(request):
    template_name = "dictionary/create_langage.html"
    context = {
        'page_title': "New Langage",
    }
    return render(request, template_name, context)


def create_word(request):
    template_name = "dictionary/create_word.html"
    context = {
        'page_title': "New Word",
    }
    return render(request, template_name, context)



def update_country(request, country_uuid):
    template_name = "dictionary/create_country.html"
    country = get_object_or_404(Country, country_uuid=country_uuid)
    context = {
        'page_title': "Update Quiz",
        'country': country,
    }
    return render(request, template_name, context)




def country_detail(request, country_slug):
    template_name = "dictionary/country.html"
    country = get_object_or_404(Country, slug=country_slug)
    langage_list = country.langages.all()
    context = {
        'page_title': country.name,
        'country': country,
        'langage_list': langage_list,
    }
    return render(request, template_name, context)


def langage_details(request,langage_slug):
    template_name = "dictionary/langage.html"
    langage = get_object_or_404(Langage, slug=langage_slug)
    country_list = langage.countries.all()
    context = {
        'page_title': "Update Question",
        'langage': langage,
        'country_list': country_list,
    }
    return render(request, template_name, context)



def word_details(request,word, word_uuid):
    template_name = "dictionary/word.html"
    word = get_object_or_404(Word, word=word, word_uuid=word_uuid)
    context = {
        'page_title': "Update Question",
        'word': word,
        'definition_list': word.definitions.all(),
        'comment_list': word.comments.all(),
        'phrase_list': word.phrases.all()
    }
    return render(request, template_name, context)