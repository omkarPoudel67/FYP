from django.db.models.signals import post_save
from django.dispatch import receiver
from resources.models import Resource
from chatbot.rag.tasks import index_resource_task

@receiver(post_save, sender=Resource)
def resource_uploaded(sender, instance, created, **kwargs):
    if created:
        print(f"New resource uploaded: {instance.title} — sending to Celery...")
        index_resource_task.delay(instance.id) 