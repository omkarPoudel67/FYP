from django.db import models
from django.conf import settings
from schedules.models import Group

ROLE_CHOICES = (
    ('student','Student'),
    ('teacher','Teacher'),
)
# Create your models here.
class Students(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        db_column = 'student_id'
    )
    semester = models.IntegerField(default = 1)
    year = models.IntegerField(default = 1)
    group = models.ForeignKey(
        Group,              
        on_delete=models.SET_NULL, 
        null=True,            
        related_name='students'  
    )
    role = models.CharField(max_length = 20, choices=ROLE_CHOICES)
    has_facial_data = models.BooleanField(default = False)
    
    def __str__(self):
       return f"{self.user.username} (Group {self.group} - Sem {self.semester})"


    




