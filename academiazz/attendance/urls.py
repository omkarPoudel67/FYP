from django.urls import path
from .views import UpdateAttendanceStatusAPIView, mark_attendance, get_attendance_history,check_ip, ManageAttendanceAPIView, StudentAttendanceDetailAPIView

urlpatterns = [
    path('mark/', mark_attendance, name='mark_attendance'),
    path('history/', get_attendance_history, name='attendance_history'),
    path("check-ip/", check_ip, name="check_ip"),
    path('info/', ManageAttendanceAPIView.as_view(), name='manage-attendance'),
    path('info/<int:student_id>/', StudentAttendanceDetailAPIView.as_view(), name='student-attendance-detail'),
    path('info/<int:attendance_id>/update/', UpdateAttendanceStatusAPIView.as_view(), name='update-attendance-status'),  # ← new
]