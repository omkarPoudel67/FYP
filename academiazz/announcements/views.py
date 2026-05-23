# views.pygfdgfdg
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Announcement
from .serializers import AnnouncementSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from .models import Announcement
from .serializers import (
    AnnouncementDetailSerializer,
    CreateAnnouncementSerializer,
    UpdateAnnouncementSerializer,
)

from authentication.models import User


def get_user_from_jwt(request):
    """
    Try to extract user from JWT token.
    Returns User instance or None — never raises.
    """
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        result = JWTAuthentication().authenticate(request)
        if result is not None:
            user, _ = result
            return user
    except Exception:
        pass
    return None


class AnnouncementAPIView(APIView):
    """
    GET    /api/announcements/info/          — list with optional filters
    POST   /api/announcements/info/          — create
    PATCH  /api/announcements/info/<pk>/     — partial update
    DELETE /api/announcements/info/<pk>/     — delete
    """

    permission_classes = [AllowAny]  # swap with teacher decorator later

    # ── GET ──────────────────────────────────────────────────────────
    def get(self, request, pk=None):
        """
        Query params:
            ?search=keyword        — filters by title
            ?created_by=<user_id>  — filters by teacher
            ?start_date=YYYY-MM-DD
            ?end_date=YYYY-MM-DD
        """
        queryset = Announcement.objects.select_related('created_by').all()

        search     = request.query_params.get('search')
        created_by = request.query_params.get('created_by')
        start_date = request.query_params.get('start_date')
        end_date   = request.query_params.get('end_date')

        if search:
            queryset = queryset.filter(title__icontains=search)

        if created_by:
            queryset = queryset.filter(created_by__id=created_by)

        if start_date:
            parsed = parse_date(start_date)
            if parsed:
                queryset = queryset.filter(upload_time__date__gte=parsed)

        if end_date:
            parsed = parse_date(end_date)
            if parsed:
                queryset = queryset.filter(upload_time__date__lte=parsed)

        serializer = AnnouncementDetailSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ── POST ─────────────────────────────────────────────────────────
    def post(self, request):
        user = get_user_from_jwt(request)

        serializer = CreateAnnouncementSerializer(
            data=request.data,
            context={'request_user': user}
        )
        if serializer.is_valid():
            announcement = serializer.save()
            return Response(
                {
                    "message":         "Announcement created successfully.",
                    "announcement_id": announcement.id,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── PATCH ────────────────────────────────────────────────────────
    def patch(self, request, pk=None):
        if pk is None:
            return Response(
                {"error": "Announcement ID is required for update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        announcement = get_object_or_404(Announcement, pk=pk)
        serializer   = UpdateAnnouncementSerializer(
            announcement, data=request.data, partial=True
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(
                {
                    "message":      "Announcement updated successfully.",
                    "announcement": AnnouncementDetailSerializer(updated).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── DELETE ───────────────────────────────────────────────────────
    def delete(self, request, pk=None):
        if pk is None:
            return Response(
                {"error": "Announcement ID is required for deletion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        announcement = get_object_or_404(Announcement, pk=pk)
        announcement.delete()
        return Response(
            {"message": "Announcement deleted successfully."},
            status=status.HTTP_200_OK,
        )


class TeacherListAPIView(APIView):
    """
    GET /api/announcements/teachers/
    Returns all teachers — used for the created_by filter dropdown.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        teachers = User.objects.filter(role='teacher').values(
            'id', 'username', 'first_name', 'last_name'
        )
        return Response(list(teachers), status=status.HTTP_200_OK)

@api_view(["GET"])
def announcement_list(request):
    print("=== VIEW HIT ===")
    print("user:", request.user)
    print("role:", getattr(request.user, 'role', 'NO ROLE'))
    announcements = Announcement.objects.all().order_by('-upload_time')
    serializer = AnnouncementSerializer(announcements, many=True)
    return Response(serializer.data)