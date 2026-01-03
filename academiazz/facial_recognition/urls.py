from django.urls import path
from .views import face_login, face_register

urlpatterns = [
    path("login-face/", face_login, name="face-login"),
    path("face-register/", face_register, name="face_register"),
]