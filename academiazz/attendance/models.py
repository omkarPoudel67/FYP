from django.db import models
from students.models import Students
from schedules.models import Schedule
from django.utils import timezone

from django.db import models
from schedules.models import Schedule

class ClassSession(models.Model):
    STATUS_CHOICES = [
        ('past', 'Past'),
        ('today', 'Today'),
        ('future', 'Future'),
    ]

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.PROTECT,
        related_name='sessions'
    )
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='future'
    )

    class Meta:
        unique_together = ['schedule', 'date']
        ordering = ['date']

    def __str__(self):
        return f"{self.schedule} - {self.date} - {self.status}"

class AttendanceHistory(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]

    student = models.ForeignKey(Students,
                                 on_delete = models.PROTECT,
                                   related_name='attendance_history')
    schedule = models.ForeignKey(Schedule,
                                 on_delete= models.PROTECT,
                                 related_name="schedule")
    session = models.ForeignKey(
        ClassSession,
        on_delete=models.PROTECT,
        related_name='attendance_history',
        null= True,
        blank= True
    )
    date = models.DateField(default=timezone.localdate)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='absent'
    )
    marked_at = models.DateTimeField(default=timezone.localtime)

    # class Meta:
    #     unique_together = ['student', 'schedule', 'date']

    def __str__(self):
        return f"{self.student} - {self.schedule} - {self.date} - {self.status}"


# Create your models here.
