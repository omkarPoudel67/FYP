from django.shortcuts import render
from django.http import JsonResponse
from .models import Students
from .serializers import StudentSerializer
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework import status
from authentication.models import User
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from authentication.decorators import IsTeacher, IsStudent
from rest_framework.decorators import permission_classes

@api_view(["POST"])
@permission_classes([IsStudent])
def get_student_data(request):
    if request.method == 'POST':
        student = Students.objects.get(user=request.user)

        serializer = StudentSerializer(student)
        return JsonResponse(serializer.data)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)
