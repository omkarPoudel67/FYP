from django.urls import path
from .views import GroupAPIView, get_schedules, GroupAPIView, GroupDetailAPIView, ScheduleAPIView, ScheduleDetailAPIView

urlpatterns = [
    path("schedules/manage/", ScheduleAPIView.as_view(), name="schedule-list-create"),
    path("schedules/<int:pk>/", ScheduleDetailAPIView.as_view(), name="schedule-detail"),
    path('schedules/', get_schedules, name='get_schedules'),

    path("groups/", GroupAPIView.as_view(), name="group-list"),
    path("groups/<int:pk>/", GroupDetailAPIView.as_view(), name="group-detail"),

]