from django.urls import path
from .views import TeacherAPIView, TeacherDetailAPIView

urlpatterns = [
    path("teachers/",TeacherAPIView.as_view(),name="teacher-list-create"),
    path("teachers/<int:pk>/", TeacherDetailAPIView.as_view(), name="teacher-detail"),
]