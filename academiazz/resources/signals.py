from django.db.models.signals import post_save
from django.dispatch import receiver
from resources.models import Resource
from resources.models import PublicDocument
from chatbot.tasks import index_resource_task, index_public_document_task

@receiver(post_save, sender=Resource)
def resource_uploaded(sender, instance, created, **kwargs):
    if created:
        print(f"New resource uploaded: {instance.title} — sending to Celery...")
        index_resource_task.delay(instance.id)

@receiver(post_save, sender=PublicDocument)
def public_document_uploaded(sender, instance, created, **kwargs):
    if created:
        print(f"New public document uploaded: {instance.title} — sending to Celery...")
        index_public_document_task.delay(instance.id)