from django.contrib import admin
from django.core.mail import send_mail
from django.conf import settings
from students.models import Students
from teachers.models import Teachers
# from .forms import StudentCreateForm, TeacherCreateForm
from .models import User
# # Student admin
# class CustomStudentsAdmin(admin.ModelAdmin):
#     form = StudentCreateForm
#     list_display = ('user', 'semester', 'year', 'group')
#     search_fields = ('user__username', 'group')
#     list_filter = ('semester', 'year')

#     def save_model(self, request, obj, form, change):
#         is_new = obj.pk is None
#         raw_password = form.cleaned_data.get("password")
#         super().save_model(request, obj, form, change)

#         if is_new:
#             user = obj.user
#             print("DEBUG: Sending email to", user.email)

#             send_mail(
#                 subject="Your Student Account Has Been Created",
#                 message=f"""
# Hi {user.first_name} {user.last_name},

# Your student account has been created successfully.

# Login Details:
# - Username: {user.username}
# - Password: {raw_password}
# - University ID: {user.id}
# - Semester: {obj.semester}
# - Year: {obj.year}
# - Group: {obj.group}

# Please log in and change your password after first login.

# Welcome aboard! 
# """,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[user.email],
#                 fail_silently=False,
#             )
#             print("DEBUG: Email sent successfully")

# # Teacher admin
# class CustomTeachersAdmin(admin.ModelAdmin):
#     form = TeacherCreateForm
#     list_display = ('user', 'role')
#     search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email')
#     list_filter = ('role',)

#     def save_model(self, request, obj, form, change):
#         is_new = obj.pk is None
#         raw_password = form.cleaned_data.get("password")
#         super().save_model(request, obj, form, change)

#         if is_new:
#             user = obj.user
#             print("DEBUG: Sending email to", user.email)

#             send_mail(
#                 subject="Your Teacher Account Has Been Created",
#                 message=f"""
# Hi {user.first_name} {user.last_name},

# Your teacher account has been created successfully.

# Login Details:
# - Username: {user.username}
# - Password: {raw_password}
# - Teacher ID: {user.id}
# - Role: {obj.role}

# Please log in and change your password after first login.

# Welcome aboard!
# """,
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[user.email],
#                 fail_silently=False,
#             )
#             print("DEBUG: Email sent successfully")


# # Register admin
# admin.site.register(Students, CustomStudentsAdmin)
# admin.site.register(Teachers, CustomTeachersAdmin)
admin.site.register(User)