# resources/urls.py
from django.urls import path
from .views import get_modules, get_weeks, get_resources, download_resource, ModuleListAPIView, ResourceAPIView

urlpatterns = [
    path("modules/", get_modules, name="get_modules"),
    path("weeks/", get_weeks, name="get_weeks"),
    path("resources/", get_resources, name="get_resources"),
    path("download/<path:filename>/", download_resource, name ="download_resources"),
    path("info/",ModuleListAPIView.as_view(), name="module-list"),
    path("modules/info/",ModuleListAPIView.as_view(), name="module-list-alt"),
    path("resources/info/",ResourceAPIView.as_view(), name="resource-list-create"),
    path("resources/info/<int:pk>/", ResourceAPIView.as_view(), name="resource-detail"),
    path("modules/info/<int:pk>/", ModuleListAPIView.as_view(), name="module-detail"),

]
