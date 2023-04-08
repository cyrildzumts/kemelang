from rest_framework import serializers
from django.contrib.auth.models import User
from dictionary.models import Country, Langage, Word, Definition, Comment, Phrase, TranslationWord


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
        

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = Country.FORM_FIELDS


class LangageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Langage
        fields = Langage.FORM_FIELDS


class DefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Definition
        fields = Definition.FORM_FIELDS


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = Comment.FORM_FIELDS


class PhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phrase
        fields = Phrase.FORM_FIELDS


class TranslationWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranslationWord
        fields = TranslationWord.FORM_FIELDS


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = Word.FORM_FIELDS