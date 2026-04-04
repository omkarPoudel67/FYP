from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer
from schedules.models import Group, Module
from django.http import FileResponse, Http404
import os
from django.conf import settings

@api_view(["GET"])
def get_modules(request):
    group_id = request.query_params.get("group_id")  # Get group ID from query string
    if not group_id:
        return Response({"error": "Group ID parameter is required"}, status=400)

    try:
        group = Group.objects.get(id=group_id)  # Get the group instance by ID
    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=404)

    # Get all modules linked to this group
    modules = group.module.all().values_list("name", flat=True).distinct()

    return Response({"modules": list(modules)})


@api_view(["GET"])
def get_weeks(request):
    module_name = request.query_params.get("module")  # module name from query params
    if not module_name:
        return Response({"error": "Module name parameter required"}, status=400)

    # Filter by module name
    resources = Resource.objects.filter(module__name=module_name)

    if resources.exists():
        print("Found resources:", resources)  # prints queryset object
        weeks = resources.values_list("week", flat=True).distinct()
        return Response({"weeks": sorted(list(weeks))})
    else:
        print("No resources found for module:", module_name)
        return Response({"error": f"No resources found for module '{module_name}'"}, status=404) 


@api_view(["GET"])
def get_resources(request):
    module_name = request.query_params.get("module")
    week = request.query_params.get("week")

    if not module_name or not week:
        return Response({"error": "Module and week parameters required"}, status=400)


    try:
        module = Module.objects.get(name=module_name)
    except Module.DoesNotExist:
        return Response({"error": f"Module '{module_name}' does not exist"}, status=404)

    resources = Resource.objects.filter(module=module, week=week)
    
    if not resources.exists():
        return Response({"error": f"No resources found for module '{module_name}' in week {week}"}, status=404)

    serializer = ResourceSerializer(resources, many=True)
    return Response(serializer.data)


def download_resource(request, filename):
    
    file_path = os.path.join(settings.MEDIA_ROOT, "resources/pdfs", filename)
    print(file_path)
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    else:
        raise Http404("File does not exist")
