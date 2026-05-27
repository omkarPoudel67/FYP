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
from .tokens import get_tokens_for_user
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from django.http import JsonResponse
from django.conf import settings
import jwt
from .models import User
import datetime
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from .decorators import IsStudent, IsTeacher

# def check_access_token(user):
#     auth_header = request.headers.get("Authorization")

#     if not auth_header:
#         return JsonResponse({"error": "Authorization header not present"}, status = 401)
    
#     try:
#         token = auth_header.split(" ")[1] 

#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

#         user_id = payload.get("user_id")

#         user = User.objects.filter(id = user_id).first()

#         if user:
#             return JsonResponse({
#                 "message": "Tolen is valid",
#                 "payload": payload
#             }, status = 200)
#         else:
#             return JsonResponse({
#                 "message": "User does not exists",
#             }, status = 401)
         

    # except IndexError:
    #     return JsonResponse({"error": "Invalid Authorization header format"}, status = 401 )
    # except ExpiredSignatureError:
    #     return JsonResponse({"error": "Token Expired"}, status = 401)
    # except InvalidTokenError:
    #     return JsonResponse({"error": "Unidentified/invalid token"}, status = 401)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def refresh_access_token(request):
    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return JsonResponse({"error": "Refresh token not found"}, status = 401)
    
    try:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token
        return JsonResponse({"access": str(access)}, status = 200)
    except Exception as e :
        return JsonResponse({"error": e  }, status = 401)
    
    

    




@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    User = get_user_model()


    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"success": False, "message": "Invalid credentials"},status=401)

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    if user.is_superuser == True:
        role = 'teacher'
    else:
        role = 'student'


    response = Response({
        "success": True,
        "access": str(access),
        "username": user.username,
        "role": role
    })

    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=False,      
        samesite="Lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )

    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_api(request):

    response = JsonResponse({"success": True, "message": "Logged out successfully"})
    
    response.delete_cookie(
        key="refresh_token",
        path="/"
    )
    
    return response

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAdminUser]

# class StudentViewSet(viewsets.ModelViewSet):
#     queryset = Students.objects.all()
#     serializer_class = StudentSerializer
#     permission_classes = [permissions.IsAdminUser]

# class TeacherViewSet(viewsets.ModelViewSet):
#     queryset = Teachers.objects.all()
#     serializer_class = TeacherSerializer
#     permission_classes = [permissions.IsAdminUser]
