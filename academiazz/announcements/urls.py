from django.urls import path
from .views import announcement_list, AnnouncementAPIView, TeacherListAPIView

urlpatterns = [
    path("announcements/", announcement_list, name="announcement-list"),
    path("info/",          AnnouncementAPIView.as_view(), name="announcement-list-create"),
    path("info/<int:pk>/", AnnouncementAPIView.as_view(), name="announcement-detail"),
    path("teachers/",      TeacherListAPIView.as_view(),  name="teacher-list"),

]