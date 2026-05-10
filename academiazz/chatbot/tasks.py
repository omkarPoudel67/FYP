from celery import shared_task
from resources.models import Resource, PublicDocument
from .rag.indexer import index_resource, index_public_knowledge

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


@shared_task
def index_public_document_task(document_id):
    try:
        document = PublicDocument.objects.get(id=document_id)
        index_public_knowledge(document)
        print(f"Successfully indexed public document {document_id}")
    except PublicDocument.DoesNotExist:
        print(f"Public document {document_id} not found")
    except Exception as e:
        print(f"Error indexing public document {document_id}: {e}")