from django.db import models
from django.conf import settings
ROLE_CHOICES = (
    ('student','Student'),
    ('teacher','Teacher'),
)
# Create your models here.
class Students(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE
    )
    semester = models.IntegerField(default = 1)
    year = models.IntegerField(default = 1)
    group = models.CharField(max_length = 50)
    role = models.CharField(max_length = 20, choices=ROLE_CHOICES)
    
    def __str__(self):
       return f"{self.user.username} (Group {self.group} - Sem {self.semester})"


    




