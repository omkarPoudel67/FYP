from django.db import models

from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    phone_number = models.CharField(max_length = 25, blank = True, null = True )
    ROLE_CHOICES = [
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        blank=False,
        null=False,
        default='student'
    )


    def __str__(self):
        return self.username# Create your models here.
