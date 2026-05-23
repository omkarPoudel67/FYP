from rest_framework import serializers
from .models import Students
from authentication.models import User
from authentication.serializers import UserSerializer
from schedules.models import Group

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    group = serializers.SerializerMethodField()  

    class Meta:
        model = Students
        fields = ['id', 'user', 'semester', 'year', 'group', 'role', 'has_facial_data']
    def get_group(self, obj):
        if obj.group is None:
            return None
        return {
            "id":   obj.group.id,
            "name": obj.group.name
        }



class CreateStudentSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=10)
    semester = serializers.IntegerField()
    year = serializers.IntegerField()
    group = serializers.IntegerField()
    password = serializers.CharField(write_only=True)

    # def validate_email(self, value):
    #     if User.objects.filter(email=value).exists():
    #         raise serializers.ValidationError("A user with this email already exists.")
    #     return value

    def validate_phone_number(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain digits only.")
        if len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate_semester(self, value):
        if value < 1 or value > 6:
            raise serializers.ValidationError("Semester must be between 1 and 6.")
        return value

    def validate_year(self, value):
        if value < 1 or value > 3:
            raise serializers.ValidationError("Year must be between 1 and 3.")
        return value

    def validate_group(self, value):
        if not Group.objects.filter(id=value).exists():
            raise serializers.ValidationError("Selected group does not exist.")
        return value

    def create(self, validated_data):
        group = Group.objects.get(id=validated_data['group'])

        # Create user with temp username first to get the ID
        user = User.objects.create_user(
            username='temp',
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            role='student'
        )

        # Now set final username using the generated ID
        user.username = f"student_{user.id}"
        user.save()

        student = Students.objects.create(
            user=user,
            semester=validated_data['semester'],
            year=validated_data['year'],
            group=group,
            role='student'
        )

        return user, student, validated_data['password']