from datetime import datetime, timedelta
from django.utils import timezone
from schedules.models import Schedule
from .models import ClassSession

def get_current_running_class(group_id):
    try:
        now = timezone.localtime()
        current_time = now.time()
        current_day = now.strftime("%A")
        

        schedules = Schedule.objects.filter(
            group_id = group_id,
            day=current_day[:3]
        )
        if not schedules:
            print("no Schedules found")
            return None, None
        print (schedules) 

        for schedule in schedules:
            if schedule.start_time <= current_time <= schedule.end_time:
                late_threshold = (
                    datetime.combine(datetime.today(), schedule.start_time)
                    + timedelta(minutes=15)
                ).time()

                session = ClassSession.objects.filter(
                    schedule=schedule,
                    date=timezone.localdate()
                ).first()

                if current_time > late_threshold:
                    status = False
                else:
                    status = True

                return schedule, status, session
        return False
    except Exception as e:
        print("Error occurred:",e)
        return False



