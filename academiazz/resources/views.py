from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer, ModuleSerializer, CreateResourceSerializer, UpdateResourceSerializer, ModuleCreateUpdateSerializer
from schedules.models import Group, Module
from django.http import FileResponse, Http404
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .serializers import (
    ResourceDetailSerializer,
    CreateResourceSerializer,
    UpdateResourceSerializer,
    ModuleSerializer,
)

class ModuleListAPIView(APIView):
    permission_classes = [AllowAny]

    # GET /modules/info/ — list all
    def get(self, request, pk=None):
        modules = Module.objects.all().order_by('year', 'semester', 'name')
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST /modules/info/ — create
    def post(self, request):
        serializer = ModuleCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            module = serializer.save()
            return Response(
                {
                    "message": "Module created successfully.",
                    "module": ModuleSerializer(module).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT /modules/info/<pk>/ — update
    def put(self, request, pk=None):
        if pk is None:
            return Response({"error": "Module ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        module = get_object_or_404(Module, pk=pk)
        serializer = ModuleCreateUpdateSerializer(module, data=request.data)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(
                {
                    "message": "Module updated successfully.",
                    "module": ModuleSerializer(updated).data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE /modules/info/<pk>/ — delete
    def delete(self, request, pk=None):
        if pk is None:
            return Response({"error": "Module ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        module = get_object_or_404(Module, pk=pk)
        module.delete()
        return Response({"message": "Module deleted successfully."}, status=status.HTTP_200_OK)
class ResourceAPIView(APIView):
    """
    GET    resources/info/          — list with filters
    POST   resources/info/          — create (multipart/form-data)
    PATCH  resources/info/<pk>/     — partial update (multipart/form-data)
    DELETE resources/info/<pk>/     — delete
    """
    permission_classes = [AllowAny]  # swap with teacher decorator later

    # ── GET ──────────────────────────────────────────────────────────
    def get(self, request, pk=None):
        """
        Query params:
            ?module=<id>       — filter by module (disables year/semester filter)
            ?year=<1-3>        — filter by module year
            ?semester=<1-6>    — filter by module semester
            ?type=lecture|tutorial|workshop
            ?search=keyword    — by title
        """
        queryset = Resource.objects.select_related('module').all().order_by('-uploaded_at')

        module   = request.query_params.get('module')
        year     = request.query_params.get('year')
        semester = request.query_params.get('semester')
        rtype    = request.query_params.get('type')
        search   = request.query_params.get('search')

        if module:
            # module selected — ignore year/semester filters
            queryset = queryset.filter(module__id=module)
        else:
            if year:
                queryset = queryset.filter(module__year=year)
            if semester:
                queryset = queryset.filter(module__semester=semester)

        if rtype:
            queryset = queryset.filter(type=rtype)

        if search:
            queryset = queryset.filter(title__icontains=search)

        serializer = ResourceDetailSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ── POST ─────────────────────────────────────────────────────────
    def post(self, request):
        # try to get uploader name from JWT
        uploaded_by = self._get_uploader_name(request)

        serializer = CreateResourceSerializer(data=request.data)
        if serializer.is_valid():
            resource = serializer.save(uploaded_by=uploaded_by)
            return Response(
                {
                    "message":     "Resource uploaded successfully.",
                    "resource_id": resource.id,
                    "resource":    ResourceDetailSerializer(resource).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── PATCH ────────────────────────────────────────────────────────
    def patch(self, request, pk=None):
        if pk is None:
            return Response(
                {"error": "Resource ID is required for update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resource   = get_object_or_404(Resource, pk=pk)
        serializer = UpdateResourceSerializer(resource, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(
                {
                    "message":  "Resource updated successfully.",
                    "resource": ResourceDetailSerializer(updated).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── DELETE ───────────────────────────────────────────────────────
    def delete(self, request, pk=None):
        if pk is None:
            return Response(
                {"error": "Resource ID is required for deletion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resource = get_object_or_404(Resource, pk=pk)
        # delete actual file from disk
        if resource.file:
            import os
            if os.path.isfile(resource.file.path):
                os.remove(resource.file.path)
        resource.delete()
        return Response(
            {"message": "Resource deleted successfully."},
            status=status.HTTP_200_OK,
        )

    # ── Helper ───────────────────────────────────────────────────────
    def _get_uploader_name(self, request):
        try:
            from rest_framework_simplejwt.authentication import JWTAuthentication
            result = JWTAuthentication().authenticate(request)
            if result:
                user, _ = result
                name = f"{user.first_name} {user.last_name}".strip()
                return name if name else user.username
        except Exception:
            pass
        return "Unknown"

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
