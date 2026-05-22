from django import forms
from .models import User
from students.models import Students
from teachers.models import Teachers
from django.core.mail import send_mail
from django.conf import settings
import logging

from django import forms

class LoginUserForm(forms.Form):
    username = forms.CharField(
        max_length=150, 
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Username'})
    )
    
    password = forms.CharField(
        max_length=128, 
        required=True,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )


class StudentCreateForm(forms.ModelForm):
    username = forms.CharField(max_length = 150, required = True)
    first_name = forms.CharField(max_length=30, required =True)
    last_name = forms.CharField(max_length=30, required = True)
    email = forms.EmailField(required = True)
    password = forms.CharField(widget = forms.PasswordInput, required= True)
    phonenumber = forms.CharField(max_length=10, required=True)

    
    class Meta:
        model = Students
        fields = ['semester', 'year', 'group']
    
    def save(self, commit=True):
        logger = logging.getLogger(__name__)

# Before sending email
        logger.info(f"DEBUG: About to send email to ...")
        user = User.objects.create_user(
            username = self.cleaned_data['username'],
            password = self.cleaned_data['password'],
            first_name = self.cleaned_data['first_name'],
            last_name = self.cleaned_data['last_name'],
            email=self.cleaned_data['email'],
            phone_number = self.cleaned_data['phonenumber']
        )
        student = super().save(commit=False)
        student.role ='student'
        student.user = user
        if commit:
            print(f"DEBUG: email sennt to {user.email}...")
            student.save()
            subject = "Your Student Account has been Created!"
            message = f"""
Hi {user.first_name} {user.last_name},

Your student account has been successfully created. You can now log in to academiazz using your username and password

Here are your details:
- Username: {user.username}
- Password: {self.cleaned_data['password']}
- University ID: {user.id}
- Semester: {student.semester}
- Year: {student.year}
- Group: {student.group}

Welcome aboard! 😊
"""
            print(f"DEBUG: About to send email to {user.email}...")

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,  
                [user.email],                 
                fail_silently=False,
            )

            print(f"DEBUG: email sennt to {user.email}...")

        return student
        

class TeacherCreateForm(forms.ModelForm):
    username = forms.CharField()
    first_name = forms.CharField()
    last_name = forms.CharField()
    email = forms.EmailField()
    password = forms.CharField(
        widget=forms.PasswordInput,
        required=False,  # Not required on edit
        help_text="Leave blank to keep the existing password."
    )
    phone_number = forms.CharField(required=False)

    class Meta:
        model = Teachers
        fields = ['role']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # If editing an existing teacher, pre-fill user fields
        if self.instance and self.instance.pk:
            user = self.instance.user
            self.fields['username'].initial = user.username
            self.fields['first_name'].initial = user.first_name
            self.fields['last_name'].initial = user.last_name
            self.fields['email'].initial = user.email
            self.fields['phone_number'].initial = user.phone_number

    def save(self, commit=True):
        teacher = super().save(commit=False)

        if teacher.pk:
            user = teacher.user
        else:
            user = User()

        user.username = self.cleaned_data['username']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']
        user.phone_number = self.cleaned_data.get('phone_number', '')
        user.role = 'teacher'  # always sync role to User model

        if teacher.role == 'admin':
            user.is_superuser = True
            user.is_staff = True

        raw_password = self.cleaned_data.get('password')
        if raw_password:
            user.set_password(raw_password)

        if commit:
            user.save()
            teacher.user = user
            teacher.save()

        return teacher