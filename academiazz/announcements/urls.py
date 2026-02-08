from django.urls import path
from .views import announcement_list

urlpatterns = [
    path("announcements/", announcement_list, name="announcement-list"),
]