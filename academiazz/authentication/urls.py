from django.urls import path,include
from . import views
#from.views import send_test_email

urlpatterns = [

    path('login/', views.login_view, name='login'),
    #path('logout/', views.logout_view, name='logout'),
    path('create-student/', views.create_student, name='create_student'),
    path('create-teacher/', views.create_teacher, name='create_teacher'),
    path('student-dashboard/', views.student_dashboard, name='student_dashboard'),
    path('teacher-dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    path('api/', include('authentication.api_urls')),
    path('test/', views.test_view, name='test_view'),
    

    #path('send-test-email/', send_test_email, name='send_test_email'),

    

]