from django.db import models

# Create your models here.
from django.db import models 
from django.conf import settings


class Announcement(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   limit_choices_to={"is_superuser":True},
                                     on_delete = models.CASCADE,
                                     related_name='Announcements_created')
    upload_time = models.DateTimeField(auto_now_add=True)  
    updated_time = models.DateTimeField(auto_now=True)  

    class Meta:
        ordering = ['-upload_time']  
        verbose_name = "Announcement"
        verbose_name_plural = "Announcements"

    def __str__(self):
        return f"{self.title} by {self.created_by.username if self.created_by else 'Unknown'}"
