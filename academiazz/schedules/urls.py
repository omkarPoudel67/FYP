from django.urls import path
from .views import GroupAPIView, get_schedules, GroupAPIView

urlpatterns = [
    path('schedules/', get_schedules, name='get_schedules'),
    path("groups/", GroupAPIView.as_view(), name="group-list"),
]