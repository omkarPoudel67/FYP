# authentication/serializers.py
from rest_framework import serializers
from .models import User
from students.models import Students
from teachers.models import Teachers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()  

    class Meta:
        model = Students
        fields = ['id', 'user', 'semester', 'year', 'group', 'role']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()  

    class Meta:
        model = Teachers
        fields = ['id', 'user', 'role']
