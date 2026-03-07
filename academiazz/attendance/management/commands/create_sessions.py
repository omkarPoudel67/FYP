from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from schedules.models import Schedule
from attendance.models import ClassSession

class Command(BaseCommand):
    help = 'Creates and updates class sessions'

    def handle(self, *args, **kwargs):
        today = timezone.localdate()
        start_date = today - timedelta(days=7)
        end_date = today + timedelta(days=7)

        schedules = Schedule.objects.all()
        created_count = 0
        updated_count = 0

        for schedule in schedules:
            current_date = start_date
            while current_date <= end_date:
                # check if this date matches the schedule's day
                if current_date.strftime("%a") == schedule.day:
                    
                    # determine status
                    if current_date < today:
                        status = 'past'
                    elif current_date == today:
                        status = 'today'
                    else:
                        status = 'future'

                    # create or update session
                    session, created = ClassSession.objects.update_or_create(
                        schedule=schedule,
                        date=current_date,
                        defaults={'status': status}
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                current_date += timedelta(days=1)

        self.stdout.write(f"Created: {created_count} sessions")
        self.stdout.write(f"Updated: {updated_count} sessions")