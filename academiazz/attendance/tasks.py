from celery import shared_task
from django.utils import timezone
from attendance.models import ClassSession, AttendanceHistory
from students.models import Students

@shared_task(bind=True)
def mark_absent_students(self):
    try:
        now = timezone.localtime()
        current_time = now.time()
        today = timezone.localdate()

        ended_sessions = ClassSession.objects.filter(
            status='past'  
        ) | ClassSession.objects.filter(
            status='today',
            schedule__end_time__lt=current_time  
        )

        for session in ended_sessions:
            students = Students.objects.filter(
                group=session.schedule.group
            )

            for student in students:
                already_marked = AttendanceHistory.objects.filter(
                    student=student,
                    schedule=session.schedule,
                    date=session.date
                ).exists()

                if not already_marked:

                    AttendanceHistory.objects.get_or_create(
                        student=student,
                        schedule=session.schedule,
                        session=session,
                        date=session.date,
                        status='absent'
                    )

        return f"Absent marking done for {ended_sessions.count()} sessions"
    except Exception as e:
        self.retry(exc=e)