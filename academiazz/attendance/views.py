from django.shortcuts import render
from .utils import get_current_running_class
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .utils import get_current_running_class
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from facial_recognition.utils import init_face_model, get_face_embedding
from facial_recognition.pinecone_utils import init_pinecone_index, find_best_match, store_embedding
from dotenv import load_dotenv
import os
import cv2
load_dotenv("../.env")
import numpy as np
from django.contrib.auth import get_user_model
from .models import AttendanceHistory
from django.utils import timezone


# Create your views here.
@api_view(["POST"])
def mark_attendance(request):
    model = init_face_model()
    api_key = os.environ.get("PINECONE_API_KEY")
    index = init_pinecone_index(api_key)
    User = get_user_model()
    try:
        if "image" not in request.FILES:
            return JsonResponse({"success":False,
                                 "message":"No image uploaded"},
                                 status = 400)
        uploaded_file = request.FILES.get('image')
        np_img = np.frombuffer(uploaded_file.read(), np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        embedding = get_face_embedding(img)
        #print(f"this is the embedding{embedding}")
        if embedding is None:
            return JsonResponse({"success":False,
                                 "message": "No face detected"},
                                 status = 400)
            
        match, user_id_str, score = find_best_match(index, embedding)

        if not match:
            return JsonResponse({"success": False, "message": "Face not recognized."})
        
        if user_id_str != str(request.user.id):
            return JsonResponse({"success": False,
                                  "message": "Face not match with logged in account.",
                                  "id1":user_id_str,
                                  "id2":str(request.user.id)})
        
        group_id = request.user.students.group_id
        ongoing_class, present_status, session = get_current_running_class(group_id)
        
        AttendanceHistory.objects.create(
            student=request.user.students,
            schedule=ongoing_class,
            session=session,
            status='present' if present_status else 'late',
        )
        return JsonResponse({
            "Success": True,
            "message": "Attendance successfully tracked"

        })


    except Exception as e:
        # print("Error occured: ",e)
        return JsonResponse({
            'Error': str(e)
        })
    
