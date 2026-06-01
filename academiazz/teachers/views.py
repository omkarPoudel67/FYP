from .models import Teachers
from .serializers import TeacherSerializer, TeacherCreateSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from authentication.decorators import IsAuthenticated, IsTeacher
from rest_framework.decorators import permission_classes

User = get_user_model()


class TeacherAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teachers = Teachers.objects.select_related("user").order_by("user__username")
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TeacherCreateSerializer(data=request.data)
        if serializer.is_valid():
            teacher = serializer.save()
            return Response(TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        teacher = get_object_or_404(Teachers, pk=pk)
        user = teacher.user

        user.first_name   = request.data.get("first_name",   user.first_name)
        user.last_name    = request.data.get("last_name",    user.last_name)
        user.email        = request.data.get("email",        user.email)
        user.phone_number = request.data.get("phone",        user.phone_number)

        new_username = request.data.get("username", user.username)
        if new_username != user.username:
            if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
                return Response(
                    {"username": ["A user with this username already exists."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = new_username

        new_password = request.data.get("password", "")
        if new_password:
            user.set_password(new_password)

        user.save()
        return Response(TeacherSerializer(teacher).data)

    def delete(self, request, pk):
        teacher = get_object_or_404(Teachers, pk=pk)
        teacher.user.delete()
        return Response({"detail": "Teacher deleted."}, status=status.HTTP_204_NO_CONTENT)