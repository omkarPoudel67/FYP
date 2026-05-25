# students/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Schedule, Group
from .serializers import ScheduleSerializer, GroupSerializer, ScheduleCreateUpdateSerializer, GroupCreateUpdateSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404

class GroupDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        serializer = GroupCreateUpdateSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            group = serializer.save()
            return Response(GroupSerializer(group).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        group.delete()
        return Response({"detail": "Group deleted."}, status=status.HTTP_204_NO_CONTENT)


# ADD this new class for schedule create/list
class ScheduleAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # same logic as your existing get_schedules, just class-based
        group_id  = request.query_params.get("group")
        module_id = request.query_params.get("module")
        day       = request.query_params.get("day")

        qs = Schedule.objects.all()

        if group_id:
            qs = qs.filter(group_id=group_id)
        if module_id:
            qs = qs.filter(module_id=module_id)
        if day:
            qs = qs.filter(day=day)

        serializer = ScheduleSerializer(qs, many=True)
        for item in serializer.data:
            try:
                teacher_obj = Schedule.objects.get(id=item['id']).teacher
                item['teacher_name'] = teacher_obj.username
            except Exception:
                item['teacher_name'] = "Unknown"
        return Response(serializer.data)

    def post(self, request):
        serializer = ScheduleCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            schedule = serializer.save()
            return Response(ScheduleSerializer(schedule).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ADD this new class for schedule update/delete
class ScheduleDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        schedule = get_object_or_404(Schedule, pk=pk)
        serializer = ScheduleCreateUpdateSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            schedule = serializer.save()
            return Response(ScheduleSerializer(schedule).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        schedule = get_object_or_404(Schedule, pk=pk)
        schedule.delete()
        return Response({"detail": "Schedule deleted."}, status=status.HTTP_204_NO_CONTENT)

class GroupAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # your existing get — unchanged
        groups = Group.objects.all().order_by('name')
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = GroupCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save()
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_schedules(request):
    group_id = request.query_params.get("group")

    if group_id:
        try:
            group = Group.objects.get(id=group_id)
            schedules = Schedule.objects.filter(group=group)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=404)
    else:
        schedules = Schedule.objects.all()

    serializer = ScheduleSerializer(schedules, many=True)
    for item in serializer.data:
        try:
            # Assuming teacher is a ForeignKey to User
            teacher_obj = Schedule.objects.get(id=item['id']).teacher
            item['teacher_name'] = teacher_obj.username
        except Exception:
            item['teacher_name'] = "Unknown"
    return Response(serializer.data)