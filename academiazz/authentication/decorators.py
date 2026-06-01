from rest_framework.permissions import BasePermission,IsAuthenticated

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return (request.user.role == "teacher")
    

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return (request.user.role == "student")
    

class TeacherRequiredMixin:
    permission_classes = [IsAuthenticated, IsTeacher]


class StudentRequiredMixin:
    permission_classes = [IsAuthenticated, IsStudent]


class TeacherOrStudentMixin:
    permission_classes = [IsAuthenticated, IsTeacher | IsStudent]



