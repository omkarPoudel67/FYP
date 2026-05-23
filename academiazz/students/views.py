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
from .serializers import CreateStudentSerializer
from .utils import send_student_welcome_email
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from schedules.models import Group



@api_view(["POST"])
@permission_classes([IsStudent])
def get_student_data(request):
    if request.method == 'POST':
        student = Students.objects.get(user=request.user)

        serializer = StudentSerializer(student)
        return JsonResponse(serializer.data)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

class StudentAPIView(APIView):
    """
    GET    /api/students/         — list with optional filters
    POST   /api/students/         — create student
    PATCH  /api/students/<pk>/    — partial update
    DELETE /api/students/<pk>/    — delete student + user
    """

    permission_classes = [AllowAny]  # swap with teacher decorator later

    # ------------------------------------------------------------------
    # GET
    # ------------------------------------------------------------------
    def get(self, request, pk=None):
        """
        Optional query params:
            ?semester=3
            ?year=2
            ?group=5        ← group ID (since that's what your FK stores)
            ?search=john    ← matches first_name, last_name, username
        """
        queryset = Students.objects.select_related("user", "group").all()

        semester = request.query_params.get("semester")
        year     = request.query_params.get("year")
        group    = request.query_params.get("group")
        search   = request.query_params.get("search")

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

        serializer = StudentSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # POST
    # ------------------------------------------------------------------
    def post(self, request):
        serializer = CreateStudentSerializer(data=request.data)
        if serializer.is_valid():
            user, student, raw_password = serializer.save()
            send_student_welcome_email(user, raw_password)
            return Response(
                {
                    "message": f"Student created successfully. Login details sent to {user.email}.",
                    "username": user.username,
                    "student_id": student.id,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # PATCH
    # ------------------------------------------------------------------
    def patch(self, request, pk=None):
        if pk is None:
            return Response(
                {"error": "Student ID is required for update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = get_object_or_404(Students, pk=pk)
        user    = student.user
        data    = request.data

        # --- User-level fields ---
        user_fields = ["first_name", "last_name", "email", "phone_number"]
        for field in user_fields:
            if field in data:
                setattr(user, field, data[field])
        user.save()

        # --- Students-level fields ---
        if "semester" in data:
            student.semester = data["semester"]
        if "year" in data:
            student.year = data["year"]
        if "group" in data:
            group = get_object_or_404(Group, pk=data["group"])
            student.group = group
        student.save()

        return Response(
            {
                "message": "Student updated successfully.",
                "student": StudentSerializer(student).data,
            },
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------------
    def delete(self, request, pk=None):
        if pk is None:
            return Response(
                {"error": "Student ID is required for deletion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = get_object_or_404(Students, pk=pk)
        user    = student.user
        student.delete()
        user.delete()

        return Response(
            {"message": "Student deleted successfully."},
            status=status.HTTP_200_OK,
        )