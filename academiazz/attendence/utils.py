from datetime import datetime
from django.utils import timezone
from ..schedules.models import Schedule

def get_current_running_class(group_id):
    now = timezone.localtime()
    current_time = now.time()
    current_day = now.strftime("%A")

    schedules = Schedule.objects.filter(
        group_id = group_id,
        day=current_day
    )

    for schedule in schedules:
        if schedule.start_time <= current_time <= schedule.end_time:
            return schedule
    return False