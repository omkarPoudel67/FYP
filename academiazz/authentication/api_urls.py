# authentication/api_urls.py
from rest_framework import routers
from django.urls import path, include
from .api_views import login_api, refresh_access_token, logout_api
#from .api_views import UserViewSet, StudentViewSet, TeacherViewSet, login_api
from .views import forgot_password, reset_password, test_view

# router = routers.DefaultRouter()
# router.register(r'users', UserViewSet)
# router.register(r'students', StudentViewSet)
# router.register(r'teachers', TeacherViewSet)

urlpatterns = [
    path('login/', login_api, name='login-api'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path("auth/reset-password/", reset_password),
    path('test/', test_view, name='test_view'),
    path('refresh-access-token/', refresh_access_token, name ='refresh_access_token'),
    path('logout/', logout_api, name = 'logout')
  #  path('', include(router.urls)), 
]
