from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from resources.models import Module

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
    

    module = models.ForeignKey(
        "resources.Module", on_delete=models.CASCADE
    )  
    group = models.ForeignKey(Group, on_delete=models.CASCADE)  # link to Group
    class_type = models.CharField(max_length=20, choices=CLASS_TYPES)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    day = models.CharField(max_length=3, choices=CLASS_DAYS, default=None) 
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["day", "start_time"]

    def __str__(self):
        return f"{self.module} - {self.group} - {self.class_type} on {self.day}"
