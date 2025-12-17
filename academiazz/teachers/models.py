from django.db import models
from django.conf import settings

# Create your models here.
ROLE_CHOICES = (
    ('student','Student'),
    ('teacher','Teacher'),
)

class Teachers(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"teacherID:{self.user_id}, teachername:{self.user.username}"


