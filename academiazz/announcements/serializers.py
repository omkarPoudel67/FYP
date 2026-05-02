# serializers.py
from rest_framework import serializers
from .models import Announcement
from rest_framework.decorators import api_view


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = "__all__"