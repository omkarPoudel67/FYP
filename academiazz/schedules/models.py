from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from resources.models import Module
from django.core.exceptions import ValidationError

User = get_user_model()


class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    module = models.ManyToManyField(
    Module,
    related_name='groups'
)


    def __str__(self):
        return self.name

class Schedule(models.Model):
    CLASS_TYPES = [
        ("lecture", "Lecture"),
        ("tutorial", "Tutorial"),
        ("workshop", "Workshop"),
        ("lab", "Lab"),
    ]
    CLASS_DAYS = [
        ("Mon", "Monday"),
        ("Tue", "Tuesday"),
        ("Wed", "Wednesday"),
        ("Thu", "Thursday"),
        ("Fri", "Friday"),
        ("Sat", "Saturday"),
        ("Sun", "Sunday"),
    ]

    module     = models.ForeignKey("resources.Module", on_delete=models.CASCADE)
    group      = models.ForeignKey(Group, on_delete=models.CASCADE)
    class_type = models.CharField(max_length=20, choices=CLASS_TYPES)
    teacher    = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    day        = models.CharField(max_length=3, choices=CLASS_DAYS, default=None)
    start_time = models.TimeField()
    end_time   = models.TimeField()
    location   = models.CharField(max_length=100, blank=True, null=True)
    description= models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["day", "start_time"]

    def __str__(self):
        return f"{self.module} - {self.group} - {self.class_type} on {self.day}"
    def clean(self):
        # guard: only validate if both times are provided
        if not self.start_time or not self.end_time:
            return  # skip validation, let field-level required checks handle it

        # make sure end time is after start time
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        # check for overlapping classes for the same group on the same day
        if not self.group or not self.day:
            return  # skip overlap check if group or day not selected yet

        overlapping = Schedule.objects.filter(
            group=self.group,
            day=self.day,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )

        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        if overlapping.exists():
            clash = overlapping.first()
            raise ValidationError(
                f"This group already has a class from "
                f"{clash.start_time.strftime('%H:%M')} to "
                f"{clash.end_time.strftime('%H:%M')} on {self.day}. "
                f"Please choose a different time."
            )

    def save(self, *args, **kwargs):
        self.full_clean()  # runs clean() automatically before every save
        super().save(*args, **kwargs)