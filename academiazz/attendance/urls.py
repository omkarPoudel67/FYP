from django.urls import path
from .views import mark_attendance, get_attendance_history,check_ip

urlpatterns = [
    path('mark/', mark_attendance, name='mark_attendance'),
    path('history/', get_attendance_history, name='attendance_history'),
    path("check-ip/", check_ip, name="check_ip"),
]