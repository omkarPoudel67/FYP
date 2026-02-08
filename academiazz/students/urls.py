from django.urls import path
from .views import get_student_data


urlpatterns = [
    path('get-student-data/', get_student_data, name='get_student_data'),
]