from rest_framework import serializers
from attendance.models import AttendanceHistory, ClassSession

class AttendanceHistorySerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='schedule.module.name', read_only=True)
    location = serializers.CharField(source='schedule.location', read_only=True)

    class Meta:
        model = AttendanceHistory
        fields = ['status', 'module_name', 'location', 'date']

class ClassSessionSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='schedule.module.name', read_only=True)
    location = serializers.CharField(source='schedule.location', read_only=True)
    start_time = serializers.TimeField(source='schedule.start_time', read_only=True)
    end_time = serializers.TimeField(source='schedule.end_time', read_only=True)

    class Meta:
        model = ClassSession
        fields = [
            'id',
            'date',
            'status',
            'module_name',
            'location',
            'start_time',
            'end_time'
        ]