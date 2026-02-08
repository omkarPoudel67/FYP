# resources/urls.py
from django.urls import path
from .views import get_modules, get_weeks, get_resources

urlpatterns = [
    path("modules/", get_modules, name="get_modules"),
    path("weeks/", get_weeks, name="get_weeks"),
    path("resources/", get_resources, name="get_resources"),
]
