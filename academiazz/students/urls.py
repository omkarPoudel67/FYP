from django.urls import path
from .views import get_student_data, StudentAPIView


urlpatterns = [
    path('get-student-data/', get_student_data, name='get_student_data'),
    path("info/",        StudentAPIView.as_view(), name="student-list-create"),
    path("info/<int:pk>/", StudentAPIView.as_view(), name="student-detail"),
]