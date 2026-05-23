from django.shortcuts import render
from .utils import get_current_running_class
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .utils import get_current_running_class
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from facial_recognition.utils import init_face_model, get_face_embedding
from facial_recognition.pinecone_utils import init_pinecone_index, find_best_match, store_embedding
from dotenv import load_dotenv
import os
import cv2
load_dotenv("../.env")
import numpy as np
from django.contrib.auth import get_user_model
from .models import AttendanceHistory, ClassSession
from django.utils import timezone
from rest_framework.response import Response
from attendance.serializers import AttendanceHistorySerializer, ClassSessionSerializer
import json
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q

from students.models import Students
from .models import AttendanceHistory
from .serializers import (
    StudentAttendanceSummarySerializer,
    StudentAttendanceDetailSerializer,
)


class ManageAttendanceAPIView(APIView):
    """
    GET attendance/info/
    Returns all students with their attendance summary.
    Filters: semester, year, group (id), search (name/username)
    """
    permission_classes = [AllowAny]  # swap with teacher decorator later

    def get(self, request):
        queryset = Students.objects.select_related('user', 'group').all()

        semester = request.query_params.get('semester')
        year     = request.query_params.get('year')
        group    = request.query_params.get('group')
        search   = request.query_params.get('search')

        if semester:
            queryset = queryset.filter(semester=semester)
        if year:
            queryset = queryset.filter(year=year)
        if group:
            queryset = queryset.filter(group__id=group)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)  |
                Q(user__username__icontains=search)
            )

        serializer = StudentAttendanceSummarySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentAttendanceDetailAPIView(APIView):
    """
    GET attendance/info/<student_id>/
    Returns full attendance detail for one student.
    """
    permission_classes = [AllowAny]  # swap with teacher decorator later

    def get(self, request, student_id):
        student = get_object_or_404(
            Students.objects.select_related('user', 'group'),
            pk=student_id
        )
        serializer = StudentAttendanceDetailSerializer()
        data = serializer.to_representation(student)
        return Response(data, status=status.HTTP_200_OK)
    
ALLOWED_IP = "103.41.173.36"

@api_view(["POST"])
@csrf_exempt
def check_ip(request):
    print("Request method:", request.method)
    print("Raw body:", request.body)
    return JsonResponse({"status": "ok", "message": "Access granted"})

    # try:
    #     data = json.loads(request.body)
    #     print("Parsed JSON:", data)

    #     ip = data.get("ip")
    #     print("IP received:", ip)

    #     if ip == "103.41.173.36":
    #         return JsonResponse({"status": "ok", "message": "Access granted"})
        
    #     return JsonResponse({"status": "error", "message": f"Access denied for IP {ip}."})

    # except Exception as e:
    #     print("Error while parsing JSON:", str(e))
    #     return JsonResponse({"status": "error", "message": "Invalid JSON"})

# Create your views here.
@api_view(["POST"])
@csrf_exempt
def mark_attendance(request):
    model = init_face_model()
    api_key = os.environ.get("PINECONE_API_KEY")
    index = init_pinecone_index(api_key)
    User = get_user_model()
    try:
        if "image" not in request.FILES:
            return JsonResponse({"success":False,
                                 "message":"No image uploaded"},
                                 status = 400)
        uploaded_file = request.FILES.get('image')
        np_img = np.frombuffer(uploaded_file.read(), np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        embedding = get_face_embedding(img)
        #print(f"this is the embedding{embedding}")
        if embedding is None:
            return JsonResponse({"success":False,
                                 "message": "No face detected"},
                                 status = 400)
            
        match, user_id_str, score = find_best_match(index, embedding)

        if not match:
            return JsonResponse({"success": False, "message": "Face not recognized."})
            
        
        if user_id_str != str(request.user.id):
            return JsonResponse({"success": False,
                                  "message": "Face not match with logged in account.",
                                  "id1":user_id_str,
                                  "id2":str(request.user.id)})
        
        group_id = request.user.students.group_id
        ongoing_class, present_status, session = get_current_running_class(group_id)
        ongoing_class = request.POST.get("session_id")
        
        AttendanceHistory.objects.create(
            student=request.user.students,
            schedule=session.schedule,
            session=session,
            status='present' if present_status else 'late',
        )
        return JsonResponse({
            "Success": True,
            "message": "Attendance successfully tracked"

        })


    except Exception as e:
        # print("Error occured: ",e)
        return JsonResponse({
            'Error': str(e)
        }, status = 400)
    
@api_view(['GET'])
def get_attendance_history(request):
    try:
        student = request.user.students
        group_id = student.group_id

        # past attendance
        past = AttendanceHistory.objects.filter(
            student=student,
            session__status='past'
        ).order_by('-date')

        # today's attendance
        today = AttendanceHistory.objects.filter(
            student=student,
            session__status='today'
        ).order_by('-marked_at')

        # today's schedule
        todays_schedule = ClassSession.objects.filter(
            status='today',
            schedule__group_id=group_id
        ).select_related("schedule")
        return Response({
            "past": AttendanceHistorySerializer(past, many=True).data,
            "today": AttendanceHistorySerializer(today, many=True).data,
            "todays_schedule": ClassSessionSerializer(todays_schedule, many=True).data
        })

    except Exception as e:
        print("Error occurred:", e)
        return Response({"error": str(e)}, status=400)