# students/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Schedule, Group
from .serializers import ScheduleSerializer

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