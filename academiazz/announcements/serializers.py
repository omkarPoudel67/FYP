# serializers.py
from rest_framework import serializers
from .models import Announcement
from rest_framework.decorators import api_view


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = "__all__"

class AnnouncementDetailSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model  = Announcement
        fields = ['id', 'title', 'description', 'created_by', 'upload_time', 'updated_time']

    def get_created_by(self, obj):
        if obj.created_by is None:
            return None
        return {
            "id":         obj.created_by.id,
            "username":   obj.created_by.username,
            "first_name": obj.created_by.first_name,
            "last_name":  obj.created_by.last_name,
        }


# --- create ---
class CreateAnnouncementSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=200)
    description = serializers.CharField()

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        # if Announcement.objects.filter(title__iexact=value).exists():
        #     raise serializers.ValidationError("An announcement with this title already exists.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters.")
        return value

    def create(self, validated_data):
        user = self.context.get('request_user')
        return Announcement.objects.create(
            title       = validated_data['title'],
            description = validated_data['description'],
            created_by  = user,
        )


# --- update ---
class UpdateAnnouncementSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(required=False)

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        qs = Announcement.objects.filter(title__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An announcement with this title already exists.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters.")
        return value

    def update(self, instance, validated_data):
        instance.title       = validated_data.get('title',       instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance