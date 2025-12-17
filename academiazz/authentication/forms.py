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
    username = forms.CharField(max_length=150, required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=50, required=True)
    email = forms.EmailField(required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)
    phonenumber = forms.CharField(max_length=10, required=True)

    class Meta:
        model = Teachers
        fields = []

    def save(self, commit=True):
        # Create user first
        user = User.objects.create_user(
            username=self.cleaned_data['username'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name'],
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            phone_number=self.cleaned_data['phonenumber']
        )

        # Create teacher object
        teacher = super().save(commit=False)
        teacher.user = user
        teacher.role = 'teacher'

        if commit:
            teacher.save()
        
            subject = "Your Student Account has been Created!"
            message = f"""
Hi {user.first_name} {user.last_name},
Your teacher/admin account has been successfully created.

Here are your login details:
- Username: {user.username}
- Teacher id:{user.id}
- Password: {self.cleaned_data['password']}
- Role: {teacher.role.capitalize()}

You can now log in to the system and manage your classes. Welcome aboard! 😊
"""
            send_mail(
                subject,
                message,
                'omkarpoudel06@gmail.com',  
                [user.email],                 
                fail_silently=False,
            )


        return teacher
