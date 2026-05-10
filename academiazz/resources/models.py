from django.db import models
from django.conf import settings

class Module(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Resource(models.Model):
    SESSION_TYPES = [
        ('lecture', 'Lecture'),
        ('tutorial', 'Tutorial'),
        ('workshop', 'Workshop'),
    ]

    #user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default = "NULL")
    file = models.FileField(upload_to='resources/pdfs/')
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)

    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    level = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=SESSION_TYPES, default='lecture')
    week = models.IntegerField(null=True, blank=True)
    uploaded_by = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.module.code})"

class PublicDocument(models.Model):
    DOCUMENT_TYPES = [
        ('enrollment',   'Enrollment'),
        ('courses',      'Courses'),
        ('location',     'Location'),
        ('fees',         'Fees'),
        ('requirements', 'Entry Requirements'),
        ('faq',          'FAQ'),
        ('general',      'General'),
    ]

    file        = models.FileField(upload_to='public/pdfs/')
    title       = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    type        = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='general')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active   = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"
