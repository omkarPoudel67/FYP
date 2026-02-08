from rest_framework import serializers
from .models import Students
from authentication.models import User
from authentication.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()  

    class Meta:
        model = Students
        fields = ['id', 'user', 'semester', 'year', 'group', 'role', 'has_facial_data']
