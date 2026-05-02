# views.pygfdgfdg
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Announcement
from .serializers import AnnouncementSerializer

@api_view(["GET"])
def announcement_list(request):
    print("=== VIEW HIT ===")
    print("user:", request.user)
    print("role:", getattr(request.user, 'role', 'NO ROLE'))
    announcements = Announcement.objects.all().order_by('-upload_time')
    serializer = AnnouncementSerializer(announcements, many=True)
    return Response(serializer.data)