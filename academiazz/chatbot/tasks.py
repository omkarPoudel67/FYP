from celery import shared_task
from resources.models import Resource
from .rag.indexer import index_resource

@shared_task
def index_resource_task(resource_id):
    try:
        resource = Resource.objects.get(id=resource_id)
        index_resource(resource)
        print(f"Successfully indexed resource {resource_id}")
    except Resource.DoesNotExist:
        print(f"Resource {resource_id} not found")
    except Exception as e:
        print(f"Error indexing resource {resource_id}: {e}")