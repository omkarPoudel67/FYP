from django.urls import path
from .views import get_schedules

urlpatterns = [
    path('schedules/', get_schedules, name='get_schedules'),
]