from django.contrib.auth import get_user_model
from .models import Teachers
from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings as django_settings
from rest_framework.exceptions import ValidationError as DRFValidationError


User = get_user_model()

class TeacherSerializer(serializers.ModelSerializer):
    username   = serializers.CharField(source="user.username",   read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name  = serializers.CharField(source="user.last_name",  read_only=True)
    email      = serializers.EmailField(source="user.email",     read_only=True)
    phone      = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model  = Teachers
        fields = ["id", "username", "first_name", "last_name", "email", "phone", "role"]


class TeacherCreateSerializer(serializers.Serializer):
    username   = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name  = serializers.CharField(required=False, allow_blank=True)
    email      = serializers.EmailField(required=False, allow_blank=True)
    phone      = serializers.CharField(required=False, allow_blank=True)
    password   = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if value and User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username     = validated_data["username"],
            password     = validated_data["password"],
            first_name   = validated_data.get("first_name", ""),
            last_name    = validated_data.get("last_name",  ""),
            email        = validated_data.get("email",      ""),
            phone_number = validated_data.get("phone",      ""),
            role         = "teacher",
        )
        teacher = Teachers.objects.create(user=user, role="teacher")
        return teacher
class TeacherCreateSerializer(serializers.Serializer):
    username   = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name  = serializers.CharField(required=False, allow_blank=True)
    email      = serializers.EmailField(required=False, allow_blank=True)
    phone      = serializers.CharField(required=False, allow_blank=True)
    password   = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if value:
            if not value.isdigit():
                raise serializers.ValidationError("Phone number must contain digits only.")
            if len(value) != 10:
                raise serializers.ValidationError("Phone number must be exactly 10 digits.")
            if User.objects.filter(phone_number=value).exists():
                raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username     = validated_data["username"],
            password     = validated_data["password"],
            first_name   = validated_data.get("first_name", ""),
            last_name    = validated_data.get("last_name",  ""),
            email        = validated_data.get("email",      ""),
            phone_number = validated_data.get("phone",      ""),
            role         = "teacher",
        )
        teacher = Teachers.objects.create(user=user, role="teacher")

        if user.email:
            try:
                send_mail(
                    subject="Your Academiaz Teacher Account",
                    message="",
                    from_email=django_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=f"""
                    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;
                                background: #0d1a18; color: #cdd8d6; border-radius: 12px;
                                padding: 32px; border: 1px solid rgba(13,148,136,0.25);">

                        <div style="margin-bottom: 24px;">
                            <span style="background: #0d9488; color: white; font-size: 18px;
                                         font-weight: 700; padding: 6px 14px; border-radius: 8px;">
                                Academiaz
                            </span>
                        </div>

                        <h2 style="color: #e8eaf0; margin: 0 0 8px;">
                            Welcome, {user.first_name or user.username}!
                        </h2>
                        <p style="color: #99c4c0; margin: 0 0 24px; font-size: 14px;">
                            Your teacher account has been created. Here are your login details:
                        </p>

                        <div style="background: rgba(13,148,136,0.08);
                                    border: 1px solid rgba(13,148,136,0.2);
                                    border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                                <tr>
                                    <td style="color: #99c4c0; padding: 6px 0; width: 120px;">Username</td>
                                    <td style="color: #e8eaf0; font-weight: 600;">{user.username}</td>
                                </tr>
                                <tr>
                                    <td style="color: #99c4c0; padding: 6px 0;">Password</td>
                                    <td style="color: #e8eaf0; font-weight: 600;">{validated_data["password"]}</td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #99c4c0; font-size: 13px; margin: 0 0 20px;">
                            For security, please change your password after your first login.
                        </p>

                        <div style="border-top: 1px solid rgba(13,148,136,0.15);
                                    padding-top: 20px; margin-top: 8px;">
                            <p style="color: #4a6360; font-size: 12px; margin: 0;">
                                This is an automated message from Academiaz. Please do not reply.
                            </p>
                        </div>
                    </div>
                    """,
                )
            except Exception as e:
                # account was created but email failed —
                # delete the user so the frontend can retry cleanly
                user.delete()
                raise DRFValidationError({
                    "email": [
                        f"Account could not be created because the welcome email failed to send "
                        f"({str(e)}). Please check the email address and try again."
                    ]
                })

        return teacher



class TeacherUpdateSerializer(serializers.Serializer):
    username   = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name  = serializers.CharField(required=False, allow_blank=True)
    email      = serializers.EmailField(required=False, allow_blank=True)
    phone      = serializers.CharField(required=False, allow_blank=True)
    password   = serializers.CharField(write_only=True, min_length=6, required=False, allow_blank=True)

    def update(self, validated_data):
        user = self.teacher_instance.user

        user.username     = validated_data.get("username",     user.username)
        user.first_name   = validated_data.get("first_name",   user.first_name)
        user.last_name    = validated_data.get("last_name",    user.last_name)
        user.email        = validated_data.get("email",        user.email)
        user.phone_number = validated_data.get("phone",        user.phone_number)

        new_password = validated_data.get("password", "")
        if new_password:
            user.set_password(new_password)

        user.save()
        return self.teacher_instance

    def __init__(self, *args, **kwargs):
        self.teacher_instance = kwargs.pop("teacher_instance")
        super().__init__(*args, **kwargs)

    def validate_username(self, value):
        if User.objects.filter(username=value).exclude(pk=self.teacher_instance.user.pk).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exclude(pk=self.teacher_instance.user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if value:
            if not value.isdigit():
                raise serializers.ValidationError("Phone number must contain digits only.")
            if len(value) != 10:
                raise serializers.ValidationError("Phone number must be exactly 10 digits.")
            if User.objects.filter(phone_number=value).exclude(pk=self.teacher_instance.user.pk).exists():
                raise serializers.ValidationError("A user with this phone number already exists.")
        return value