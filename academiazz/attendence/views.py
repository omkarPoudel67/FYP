from django.shortcuts import render
from .utils import get_current_running_class
from django.http import JsonResponse
from rest_framework.decorators import api_view

# Create your views here.
api_view(["POST"])
def mark_attendence(request):
    try:
        group = request.user.students.group
    except Exception as e:
        print(e)
    
