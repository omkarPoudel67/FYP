from rest_framework import serializers
from .models import Resource, Module
import os

class ModuleCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'name', 'code', 'year', 'semester']

    def validate_name(self, value):
        qs = Module.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A module with this name already exists.")
        return value

    def validate_code(self, value):
        qs = Module.objects.filter(code__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A module with this code already exists.")
        return value

    def validate_year(self, value):
        if value not in [1, 2, 3]:
            raise serializers.ValidationError("Year must be 1, 2, or 3.")
        return value

    def validate_semester(self, value):
        if value not in [1, 2, 3, 4, 5, 6]:
            raise serializers.ValidationError("Semester must be between 1 and 6.")
        return value

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = "__all__"  
class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Module
        fields = ['id', 'name', 'code', 'year', 'semester']


class CreateResourceSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=255)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    module      = serializers.IntegerField()
    type        = serializers.ChoiceField(choices=['lecture', 'tutorial', 'workshop'])
    week        = serializers.IntegerField(min_value=1, max_value=11)
    uploaded_by = serializers.CharField(max_length=255, required=False)
    file        = serializers.FileField()

    def validate_module(self, value):
        if not Module.objects.filter(id=value).exists():
            raise serializers.ValidationError("Selected module does not exist.")
        return value

    def validate_week(self, value):
        if value < 1 or value > 11:
            raise serializers.ValidationError("Week must be between 1 and 11.")
        return value

    def create(self, validated_data):
        module = Module.objects.get(id=validated_data['module'])
        return Resource.objects.create(
            title       = validated_data['title'],
            description = validated_data.get('description', ''),
            module      = module,
            level       = str(module.semester),  # auto-set from module
            type        = validated_data['type'],
            week        = validated_data['week'],
            uploaded_by = validated_data.get('uploaded_by', 'Unknown'),
            file        = validated_data['file'],
        )


class UpdateResourceSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    module      = serializers.IntegerField(required=False)
    type        = serializers.ChoiceField(choices=['lecture','tutorial','workshop'], required=False)
    week        = serializers.IntegerField(min_value=1, max_value=11, required=False)
    file        = serializers.FileField(required=False)

    def validate_module(self, value):
        if not Module.objects.filter(id=value).exists():
            raise serializers.ValidationError("Selected module does not exist.")
        return value

    def update(self, instance, validated_data):
        if 'module' in validated_data:
            module = Module.objects.get(id=validated_data['module'])
            instance.module = module
            instance.level  = str(module.semester)  # keep level in sync
        instance.title       = validated_data.get('title',       instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.type        = validated_data.get('type',        instance.type)
        instance.week        = validated_data.get('week',        instance.week)
        if 'file' in validated_data:
            instance.file    = validated_data['file']
        instance.save()
        return instance


class ResourceDetailSerializer(serializers.ModelSerializer):
    """Used in responses — includes module name, year, semester"""
    module_name     = serializers.CharField(source='module.name')
    module_code     = serializers.CharField(source='module.code')
    module_year     = serializers.IntegerField(source='module.year')
    module_semester = serializers.IntegerField(source='module.semester')
    file_url        = serializers.SerializerMethodField()
    file_name       = serializers.SerializerMethodField()

    class Meta:
        model  = Resource
        fields = [
            'id', 'title', 'description',
            'module', 'module_name', 'module_code', 'module_year', 'module_semester',
            'type', 'week', 'level',
            'uploaded_by', 'uploaded_at',
            'file_url', 'file_name',
        ]

    def get_file_url(self, obj):
        if obj.file:
            filename = os.path.basename(obj.file.name)
            return f"/resources/download/{filename}/"
        return None

    def get_file_name(self, obj):
        if obj.file:
            return os.path.basename(obj.file.name)
        return None