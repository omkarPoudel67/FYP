from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import StudentCreateForm, TeacherCreateForm, LoginUserForm
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
import random
from django.http import HttpResponse
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.http import JsonResponse
import json
#from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.tokens import default_token_generator





# Create your views here.
def login_view(request):
    if request.method == 'POST':
        form = LoginUserForm(request.POST)
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome{user.username}!')
            if hasattr(user, 'Students'):
                return redirect('student_dashboard')
            
            elif hasattr(user, 'teachers'):
                return redirect('teacher_dashboard')
            
            else:
                pass
        else:
            messages.error(request, "Invalid username or password")
    else:
        form = LoginUserForm()

                             

def create_student(request):
    if request.method == 'POST':
        form = StudentCreateForm(request.POST)
        if form.is_valid():
            student = form.save()
            messages.success(request, f'Student {student.user.username} created successfully')
        return redirect('dashboard')
    else:
        form = StudentCreateForm()
    
    return render(request,'auuthentication/create_student.html',{'form':form})


def create_teacher(request):
    if request.method == 'POST':
        form = TeacherCreateForm(request.POST)

        if form.is_valid():
            teacher = form.save()

            messages.success(request,f'Teacher {teacher.user.username} created successfully!')

            return redirect('teacher_list')
    else:
        form =TeacherCreateForm()
    return render(request, 'authentication/create_teacher.html',{'form':form})

@login_required
def student_dashboard(request):
    return render(request, 'dashboards/student_dashboard.html')

@login_required
def teacher_dashboard(request):
    return render(request, 'dashboards/teacher_dashboard.html')

@csrf_exempt
def forgot_password(request):
    User = get_user_model()
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # parse JSON
            email = data.get("email")
            if not email:
                return JsonResponse({"success": False, "message": "Email required."})

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"success": False, "message": "Email not found."})

            token = default_token_generator.make_token(user)
            reset_link = f"http://localhost:5173/reset-password/{user.pk}/{token}/"

            subject = "Password Reset Request"
            message = f"Hi {user.first_name},\n\nClick the link to reset your password:\n{reset_link}"

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

            return JsonResponse({"success": True, "message": "Password reset email sent."})

        except Exception as e:
            # Return the error for debugging
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request method."})

@api_view(["POST"])
def reset_password(request):
    User = get_user_model()

    user_id = request.data.get("user_id")
    token = request.data.get("token")
    password = request.data.get("new_password")
    confirm = request.data.get("confirm_password")

    if not all([user_id, token, password, confirm]):
        return Response({"error": "All fields required"}, status=400)

    if password != confirm:
        return Response({"error": "Passwords do not match"}, status=400)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "Invalid user"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    user.set_password(password)
    user.save()

    return Response({"success": "Password reset successful"})
