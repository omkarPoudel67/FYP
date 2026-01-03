from rest_framework import viewsets, permissions
from .models import User
from students.models import Students
from teachers.models import Teachers
from .serializers import UserSerializer, StudentSerializer, TeacherSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model




@api_view(['POST'])
def login_api(request):
    User = get_user_model()
    print("\n===== USER DEBUG LIST =====")
    for u in User.objects.all():
        print(f"ID: {u.id}")
        print(f"Username: {u.username}")
        print(f"Password Hash: {u.password}")   # <-- NOT PLAIN PASSWORD
        print("---------------------------")
    print("===== END USER LIST =====\n")
    print(" Login API Called")
    print(" Request Data:", request.data)

    username = request.data.get("username")
    password = request.data.get("password")

    print("➡️ Username:", username)
    print("➡️ Password:", password)

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"success": False, "message": "Invalid credentials"})

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    if hasattr(user, "students"):
        refresh["role"]="student"
    else:
        refresh["role"]="teacher"

    return Response({
        "success": True,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": refresh["role"],
        "username": user.username
    })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Students.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAdminUser]

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teachers.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAdminUser]
